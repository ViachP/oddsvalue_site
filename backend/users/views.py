# users/views.py (дополняем)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, SubscriptionSerializer
from .models import Subscription
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from .models import VerificationCode, DeviceFingerprint
from .utils import create_device_fingerprint, get_client_ip, check_registration_limits, send_verification_code

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # ДОБАВЛЯЕМ JWT ТОКЕНЫ ПРИ РЕГИСТРАЦИИ
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)

# ДОБАВЛЯЕМ LOGIN VIEW
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserRegistrationSerializer(user).data
        })
    return Response(
        {'error': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

class SubscriptionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.subscription


@csrf_exempt
@require_POST
def send_verification_code_view(request):
    """
    Отправляет код подтверждения на email (для беспарольной регистрации)
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').lower().strip()
        
        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)
        
        # Проверяем, не зарегистрирован ли уже email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)
        
        # Отправляем код
        send_verification_code(email)
        
        return JsonResponse({
            'success': True, 
            'message': 'Verification code sent to email'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def verify_code_and_register(request):
    """
    Проверяет код и регистрирует пользователя (беспарольная регистрация)
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').lower().strip()
        code = data.get('code', '').strip()
        
        if not email or not code:
            return JsonResponse({'error': 'Email and code are required'}, status=400)
        
        # Проверяем код
        try:
            verification_code = VerificationCode.objects.get(
                email=email, 
                code=code, 
                is_used=False
            )
            
            if not verification_code.is_valid():
                return JsonResponse({'error': 'Invalid or expired code'}, status=400)
                
        except VerificationCode.DoesNotExist:
            return JsonResponse({'error': 'Invalid code'}, status=400)
        
        # Получаем данные для проверки
        ip_address = get_client_ip(request)
        device_hash = create_device_fingerprint(request)
        
        # Проверяем лимиты регистраций
        can_register, reason = check_registration_limits(ip_address, device_hash)
        
        if not can_register:
            return JsonResponse({
                'error': 'Registration limit exceeded',
                'reason': reason
            }, status=400)
        
        # Используем твой существующий сериализатор для создания пользователя
        from .serializers import UserRegistrationSerializer
        user_data = {
            'username': email,
            'email': email,
            'password': None  # Без пароля
        }
        
        serializer = UserRegistrationSerializer(data=user_data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Создаем профиль пользователя
            user.registration_ip = ip_address
            user.device_hash = device_hash
            user.free_trial_end = timezone.now() + timedelta(days=7)
            user.save()
            
            # Обновляем device fingerprint
            device, created = DeviceFingerprint.objects.get_or_create(
                device_hash=device_hash
            )
            device.users.add(user)
            
            # Помечаем код как использованный
            verification_code.is_used = True
            verification_code.save()
            
            # Генерируем JWT токены (как у тебя уже реализовано)
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return JsonResponse({
                'success': True,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data,
                'has_free_trial': True,
                'trial_end': user_profile.free_trial_end.isoformat()
            })
        else:
            return JsonResponse({'error': serializer.errors}, status=400)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def check_auth_status(request):
    """
    Проверяет статус аутентификации пользователя
    """
    if request.user.is_authenticated:
        from .serializers import UserRegistrationSerializer
        return JsonResponse({
            'authenticated': True,
            'user': UserRegistrationSerializer(request.user).data,
            'has_free_trial': request.user.has_active_trial,
            'trial_days_remaining': request.user.trial_days_remaining
        })
    else:
        return JsonResponse({'authenticated': False})