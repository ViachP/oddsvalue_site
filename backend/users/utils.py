# users/utils.py
import hashlib
from django.utils import timezone
from datetime import timedelta
from .models import DeviceFingerprint, VerificationCode

def create_device_fingerprint(request):
    """
    Создает уникальный хеш устройства на основе данных запроса
    """
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    ip_address = get_client_ip(request)
    
    # Создаем строку для хеширования
    fingerprint_string = f"{user_agent}{accept_language}{ip_address}"
    device_hash = hashlib.md5(fingerprint_string.encode()).hexdigest()
    
    return device_hash

def get_client_ip(request):
    """
    Получает реальный IP адрес клиента
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def is_disposable_email(email):
    """
    Проверяет email на временные/одноразовые домены
    """
    disposable_domains = {
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'throwawaymail.com',
        'fakeinbox.com', 'temp-mail.org', 'trashmail.com'
    }
    
    domain = email.split('@')[-1].lower()
    return domain in disposable_domains

def check_registration_limits(ip_address, device_hash):
    """
    Проверяет лимиты регистраций с IP и устройства
    """
    # Проверяем лимит по IP (максимум 3 регистрации в неделю)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    week_ago = timezone.now() - timedelta(days=7)
    ip_registrations = User.objects.filter(
        registration_ip=ip_address,
        date_joined__gte=week_ago
    ).count()
    
    if ip_registrations >= 3:
        return False, "too_many_registrations_from_ip"
    
    # Проверяем устройство (максимум 2 пользователя на устройство)
    try:
        device = DeviceFingerprint.objects.get(device_hash=device_hash)
        if device.user_count() >= 2:
            return False, "too_many_users_on_device"
        if device.is_blocked:
            return False, "device_blocked"
    except DeviceFingerprint.DoesNotExist:
        pass
    
    return True, "allowed"

def send_verification_code(email):
    """
    Отправляет код подтверждения на email
    """
    # Генерируем код
    verification_code = VerificationCode.generate_code(email)
    
    # В реальной реализации здесь будет отправка email
    # Для теста просто выводим код в консоль
    print(f"Verification code for {email}: {verification_code.code}")
    
    # TODO: Реальная отправка email
    # from django.core.mail import send_mail
    # send_mail(
    #     'Your Verification Code',
    #     f'Your code is: {verification_code.code}',
    #     'noreply@footballsite.com',
    #     [email],
    #     fail_silently=False,
    # )
    
    return True