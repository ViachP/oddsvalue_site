# users/utils.py
import hashlib
from django.utils import timezone
from datetime import timedelta
from .models import DeviceFingerprint, VerificationCode, Registration, WhitelistedDevice, CustomUser

def generate_device_fingerprint(request):
    """
    Создает уникальный хеш устройства на основе данных запроса
    """
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    ip_address = get_client_ip(request)
    
    # Создаем строку для хеширования (можно добавить больше параметров)
    fingerprint_string = f"{user_agent}{accept_language}{ip_address}"
    device_hash = hashlib.sha256(fingerprint_string.encode()).hexdigest()
    
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

def check_registration_allowed(request, email):
    """
    Основная функция проверки возможности регистрации
    Возвращает (is_allowed, message)
    """
    device_hash = generate_device_fingerprint(request)
    ip_address = get_client_ip(request)
    
    # 1. Проверка белого списка устройств
    if WhitelistedDevice.objects.filter(device_hash=device_hash).exists():
        return True, "Device in whitelist"
    
    # 2. Проверка существующего пользователя
    if CustomUser.objects.filter(email=email).exists():
        return True, "Existing user"
    
    # 3. Проверка блокировки устройства (для НОВЫХ регистраций)
    fingerprint, created = DeviceFingerprint.objects.get_or_create(
        device_hash=device_hash
    )
    
    # Если устройство уже заблокировано
    if fingerprint.is_blocked:
        return False, "Registration from this device is blocked"
    
    # Если устройство пропускает проверку (для тестирования)
    if fingerprint.skip_verification:
        return True, "Verification disabled for this device"
    
    # 4. Проверяем предыдущие регистрации с этого устройства
    existing_registrations = Registration.objects.filter(device=fingerprint)
    
    if existing_registrations.exists():
        # Получаем email существующих регистраций
        existing_emails = existing_registrations.values_list('email', flat=True)
        email_list = ', '.join(existing_emails)
        return False, f"This device already has registered accounts: {email_list}. Please log in instead."
    
    # 5. Проверка одноразовых email (опционально)
    if is_disposable_email(email):
        return False, "Use of temporary email addresses is prohibited"
    
    return True, "Registration allowed"

def create_registration_record(request, email, user=None):
    """
    Создает запись о регистрации после успешного создания пользователя
    """
    device_hash = generate_device_fingerprint(request)
    ip_address = get_client_ip(request)
    
    fingerprint, created = DeviceFingerprint.objects.get_or_create(
        device_hash=device_hash
    )
    
    # Обновляем last_seen
    fingerprint.last_seen = timezone.now()
    fingerprint.save()
    
    # Создаем запись о регистрации
    registration = Registration.objects.create(
        device=fingerprint,
        user=user,
        email=email,
        ip_address=ip_address
    )
    
    return registration

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