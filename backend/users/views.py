from datetime import timedelta
import json
import random
import string
import traceback
import smtplib
import socket

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail

from .models import CustomUser, VerificationCode, DeviceFingerprint, Registration, WhitelistedDevice
from .serializers import (
    UserRegistrationSerializer,
    SubscriptionSerializer,
    LoginSerializer,
    MeSerializer,
)
from .utils import (
    generate_device_fingerprint,
    get_client_ip,
    check_registration_allowed,
    create_registration_record,
    send_verification_code,
    collect_device_fingerprint,
    get_user_device_stats,
    can_user_add_new_device
)

User = get_user_model()

# ------------------ регистрация (с JWT) ------------------
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Устанавливаем trial период для обычных пользователей
        if not user.is_superuser:
            user.expires_at = timezone.now() + timedelta(days=7)
            user.save()
        
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": MeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

# ------------------ логин (email + password) ------------------
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        # ⭐⭐⭐ ПРИВЯЗЫВАЕМ УСТРОЙСТВО К ПОЛЬЗОВАТЕЛЮ ⭐⭐⭐
        collect_device_fingerprint(request, email, user)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": MeSerializer(user).data,
            }
        )

# ------------------ кто я (/me) ------------------
class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeSerializer

    def get_object(self):
        user = self.request.user
        # ⭐⭐⭐ ОБНОВЛЯЕМ ИНФОРМАЦИЮ ОБ УСТРОЙСТВЕ ⭐⭐⭐
        collect_device_fingerprint(self.request, user.email, user)
        return user

# ------------------ подписка ------------------
class SubscriptionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.subscription

# ------------------ верификация ------------------
@csrf_exempt
@require_POST
def send_verification_code_view(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").lower().strip()
        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)
        
        # ПРОВЕРКА ДО ОТПРАВКИ КОДА
        is_allowed, message = check_registration_allowed(request, email)
        
        if not is_allowed:
            return JsonResponse({"error": message}, status=400)
        
        send_verification_code(email)
        return JsonResponse({"success": True, "message": "Verification code sent to email"})
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_POST
def verify_code_and_register(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").lower().strip()
        code = data.get("code", "").strip()
        if not email or not code:
            return JsonResponse({"error": "Email and code are required"}, status=400)

        try:
            vc = VerificationCode.objects.get(email=email, code=code, is_used=False)
            if not vc.is_valid():
                return JsonResponse({"error": "Invalid code"}, status=400)
        except VerificationCode.DoesNotExist:
            return JsonResponse({"error": "Invalid code"}, status=400)

        # Дополнительная проверка
        is_allowed, message = check_registration_allowed(request, email)
        if not is_allowed:
            return JsonResponse({"error": message}, status=400)

        user_data = {"username": email, "email": email, "password": None}
        serializer = UserRegistrationSerializer(data=user_data)
        if not serializer.is_valid():
            return JsonResponse({"error": serializer.errors}, status=400)

        user = serializer.save()
        user.registration_ip = get_client_ip(request)
        
        # Устанавливаем trial период для обычных пользователей
        if not user.is_superuser:
            user.expires_at = timezone.now() + timedelta(days=7)
        
        user.save()

        # ⭐⭐⭐ СОЗДАЕМ ЗАПИСЬ О РЕГИСТРАЦИИ И ПРИВЯЗЫВАЕМ УСТРОЙСТВО ⭐⭐⭐
        create_registration_record(request, email, user)

        vc.is_used = True
        vc.save()

        refresh = RefreshToken.for_user(user)
        return JsonResponse(
            {
                "success": True,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": MeSerializer(user).data,
                "has_free_trial": user.has_active_trial,
                "trial_end": user.expires_at.isoformat() if user.expires_at else None,
            }
        )
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ------------------ проверка авторизации ------------------
@csrf_exempt
def check_auth_status(request):
    if request.user.is_authenticated:
        # ⭐⭐⭐ ОБНОВЛЯЕМ ИНФОРМАЦИЮ ОБ УСТРОЙСТВЕ ⭐⭐⭐
        collect_device_fingerprint(request, request.user.email, request.user)
        
        return JsonResponse(
            {
                "authenticated": True,
                "user": MeSerializer(request.user).data,
                "has_free_trial": request.user.has_active_trial,
                "trial_days_remaining": request.user.trial_days_remaining,
            }
        )
    return JsonResponse({"authenticated": False})

@api_view(['POST'])
def send_login_code(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=400)

        # ПРОВЕРКА TRIAL СТАТУСА ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
        try:
            user = CustomUser.objects.get(email=email)
            # Если пользователь существует и у него истек trial
            if not user.is_superuser and not user.has_active_trial:
                return Response({
                    'trial_expired': True,
                    'message': 'Your trial period has expired. Please subscribe to continue.'
                }, status=403)
            
            # ⭐⭐⭐ ПРИВЯЗЫВАЕМ УСТРОЙСТВО К ПОЛЬЗОВАТЕЛЮ ⭐⭐⭐
            collect_device_fingerprint(request, email, user)
            
        except CustomUser.DoesNotExist:
            # Для новых пользователей проверяем устройство
            is_allowed, message = check_registration_allowed(request, email)
            if not is_allowed:
                return Response({'error': message}, status=400)

        # Остальной код без изменений...
        code = ''.join(random.choices(string.digits, k=6))
        VerificationCode.objects.update_or_create(
            email=email,
            defaults={'code': code, 'created_at': timezone.now(), 'is_used': False}
        )

        try:
            send_mail(
                'Login Code for OddsValue',
                f'Your verification code: {code}',
                None,
                [email],
                fail_silently=False,
            )
        except (smtplib.SMTPException, socket.error, OSError) as smtp_err:
            return Response({'error': 'Temporary email issue. Please try again later.'}, status=502)

        return Response({'sent': True})
        
    except Exception as e:
        return Response({'error': 'Server error'}, status=500)

@api_view(['POST'])
def verify_login_code(request):
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email and code required'}, status=400)

    vc = VerificationCode.objects.filter(
        email=email,
        code=code,
        is_used=False,
        created_at__gte=timezone.now() - timedelta(minutes=10)
    ).first()

    if not vc:
        return Response({'error': 'Invalid code'}, status=400)

    vc.is_used = True
    vc.save()

    user = CustomUser.objects.get(email=email)
    
    # ⭐⭐⭐ ПРИВЯЗЫВАЕМ УСТРОЙСТВО К ПОЛЬЗОВАТЕЛЮ ⭐⭐⭐
    collect_device_fingerprint(request, email, user)

    refresh = RefreshToken.for_user(user)

    # Проверяем активна ли подписка
    has_active_subscription = user.has_active_trial

    return Response({
        'access': str(refresh.access_token),
        'user': {
            'email': user.email,
            'username': 'admin' if user.is_superuser else user.email,
            'role': 'admin' if user.is_superuser else 'user',
            'expires_at': user.expires_at.isoformat() if user.expires_at else None,
            'has_active_subscription': has_active_subscription,
            'is_trial_expired': not has_active_subscription and not user.is_superuser,
            'trial_days_remaining': user.trial_days_remaining
        }
    })

# ------------------ API для управления устройствами ------------------
@api_view(['GET'])
def get_my_devices(request):
    """Получает устройства текущего пользователя"""
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    stats = get_user_device_stats(request.user)
    return Response(stats)

@api_view(['POST'])
def check_new_device(request):
    """Проверяет может ли пользователь добавить новое устройство"""
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    can_add, message = can_user_add_new_device(request.user)
    return Response({
        'can_add': can_add,
        'message': message
    })