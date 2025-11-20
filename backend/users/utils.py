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
        return True, "Устройство в белом списке"
    
    # 2. Проверка белого списка IP (для админов)
    admin_ips = ['127.0.0.1']  # Добавьте ваши IP адреса
    if ip_address in admin_ips:
        return True, "Админский IP"
    
    # 3. Проверка существующего пользователя
    if CustomUser.objects.filter(email=email).exists():
        return True, "Существующий пользователь"
    
    # 4. Проверка блокировки устройства (для НОВЫХ регистраций)
    fingerprint, created = DeviceFingerprint.objects.get_or_create(
        device_hash=device_hash
    )
    
    # Если устройство уже заблокировано
    if fingerprint.is_blocked:
        return False, "Регистрация с этого устройства заблокирована"
    
    # Если устройство пропускает проверку (для тестирования)
    if fingerprint.skip_verification:
        return True, "Проверка отключена для этого устройства"
    
    # 5. Проверяем предыдущие регистрации с этого устройства
    existing_registrations = Registration.objects.filter(device=fingerprint)
    
    if existing_registrations.exists():
        # Блокируем устройство при попытке новой регистрации
        fingerprint.is_blocked = True
        fingerprint.save()
        return False, "С этого устройства уже была регистрация. Новая регистрация невозможна."
    
    # 6. Проверка одноразовых email (опционально)
    if is_disposable_email(email):
        return False, "Использование временных email запрещено"
    
    return True, "Регистрация разрешена"

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

# Сохраняем старую функцию для обратной совместимости
def check_registration_limits(ip_address, device_hash):
    """
    Старая функция для обратной совместимости
    """
    return True, "allowed"