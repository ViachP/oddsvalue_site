# users/utils.py
import hashlib
import logging
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import DeviceFingerprint, VerificationCode, Registration, WhitelistedDevice, CustomUser

# Настройка логирования
logger = logging.getLogger(__name__)

# Ключи для кэширования
CACHE_WHITELIST_PREFIX = "whitelist_device_"
CACHE_USER_EXISTS_PREFIX = "user_exists_"
CACHE_USER_DEVICES_PREFIX = "user_devices_"

def generate_device_fingerprint(request):
    """
    Создает хеш устройства (упрощенная версия)
    """
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    http_accept = request.META.get('HTTP_ACCEPT', '')
    http_accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    
    # Используем только стабильные части
    fingerprint_string = f"{user_agent}{http_accept}{http_accept_language}"
    device_hash = hashlib.sha256(fingerprint_string.encode()).hexdigest()

    logger.debug(f"Generated device hash: {device_hash[:16]}...")
    
    return device_hash

def get_client_ip(request):
    """
    Получает реальный IP адрес клиента
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip

def validate_email_format(email):
    """
    Валидация формата email
    """
    try:
        validate_email(email)
        return True, ""
    except ValidationError as e:
        return False, str(e)

def is_disposable_email(email):
    """
    Проверяет email на временные/одноразовые домены
    """
    disposable_domains = {
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'throwawaymail.com',
        'fakeinbox.com', 'temp-mail.org', 'trashmail.com',
        'sharklasers.com', 'guerrillamail.net', 'grr.la',
        'maildrop.cc', 'getairmail.com', 'dispostable.com'
    }
    
    try:
        domain = email.split('@')[-1].lower()
        return domain in disposable_domains
    except (IndexError, AttributeError):
        return False

def is_device_whitelisted(device_hash):
    """
    Проверяет, находится ли устройство в белом списке
    """
    cache_key = f"{CACHE_WHITELIST_PREFIX}{device_hash}"
    
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    is_whitelisted = WhitelistedDevice.objects.filter(device_hash=device_hash).exists()
    cache.set(cache_key, is_whitelisted, 3600)
    
    return is_whitelisted

def check_user_exists(email):
    """
    Проверяет существование пользователя
    """
    cache_key = f"{CACHE_USER_EXISTS_PREFIX}{email}"
    
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    exists = CustomUser.objects.filter(email=email).exists()
    cache.set(cache_key, exists, 300)
    
    return exists

def get_user_devices(user):
    """
    Получает все устройства пользователя (с кэшированием)
    """
    if not user or not user.id:
        return []
        
    cache_key = f"{CACHE_USER_DEVICES_PREFIX}{user.id}"
    
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    devices = list(DeviceFingerprint.objects.filter(
        registration__user=user
    ).distinct())
    
    cache.set(cache_key, devices, 600)
    return devices

def invalidate_user_devices_cache(user):
    """
    Инвалидирует кэш устройств пользователя
    """
    if user and user.id:
        cache_key = f"{CACHE_USER_DEVICES_PREFIX}{user.id}"
        cache.delete(cache_key)

def check_registration_allowed(request, email):
    """
    Основная функция проверки возможности регистрации
    Возвращает (is_allowed, message)
    """
    # Валидация email
    is_valid, validation_error = validate_email_format(email)
    if not is_valid:
        logger.warning(f"Invalid email format: {email}")
        return False, f"Invalid email format: {validation_error}"
    
    # Проверка disposable email
    if is_disposable_email(email):
        logger.warning(f"Disposable email detected: {email}")
        return False, "Disposable email addresses are not allowed."
    
    device_hash = generate_device_fingerprint(request)
    
    logger.info("Checking registration eligibility", extra={
        'email': email,
        'device_hash_prefix': device_hash[:16]
    })
    
    # 1. Проверка белого списка
    if is_device_whitelisted(device_hash):
        logger.info("Device is whitelisted, allowing registration")
        return True, "Whitelisted device"
    
    # 2. Проверка существующего пользователя
    if check_user_exists(email):
        logger.warning("Registration attempt for existing user")
        return False, "User with this email already exists. Please use login instead."
    
    # 3. НОВАЯ ЛОГИКА: Ищем пользователей с этим устройством
    device = DeviceFingerprint.objects.filter(device_hash=device_hash).first()
    if device:
        # Находим всех пользователей, у которых есть это устройство
        users_with_this_device = CustomUser.objects.filter(
            registration__device=device
        ).distinct()
        
        if users_with_this_device.exists():
            user_emails = [user.email for user in users_with_this_device]
            email_list = ', '.join(user_emails)
            logger.warning("Device already used by other users", extra={
                'device_hash_prefix': device_hash[:16],
                'existing_users': user_emails
            })
            return False, f"This device is already used by: {email_list}. Please use your existing account."
    
    logger.info("Registration allowed")
    return True, "Registration allowed"

def collect_device_fingerprint(request, email, user=None):
    """
    ТИХИЙ сбор device fingerprint и привязка к пользователю
    """
    device_hash = generate_device_fingerprint(request)
    ip_address = get_client_ip(request)
    
    logger.info("Collecting device fingerprint", extra={
        'email': email,
        'user_id': user.id if user else None,
        'device_hash_prefix': device_hash[:16]
    })
    
    # Получаем или создаем fingerprint
    fingerprint, created = DeviceFingerprint.objects.get_or_create(
        device_hash=device_hash
    )
    
    # Обновляем last_seen
    fingerprint.last_seen = timezone.now()
    fingerprint.save()
    
    if user:
        # Привязываем устройство к пользователю
        registration, reg_created = Registration.objects.get_or_create(
            device=fingerprint,
            user=user,
            defaults={
                'email': email,
                'ip_address': ip_address
            }
        )
        
        if reg_created:
            logger.info("New device registered for user", extra={
                'user_id': user.id,
                'device_hash_prefix': device_hash[:16],
                'registration_id': registration.id
            })
        else:
            registration.last_seen = timezone.now()
            registration.save()
            
        # Инвалидируем кэш устройств пользователя
        invalidate_user_devices_cache(user)
    
    return fingerprint

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
    
    if user:
        invalidate_user_devices_cache(user)
    
    logger.info("Registration record created", extra={
        'email': email,
        'user_id': user.id if user else None,
        'device_hash_prefix': device_hash[:16]
    })
    
    return registration

def send_verification_code(email):
    """
    Отправляет код подтверждения на email
    """
    is_valid, validation_error = validate_email_format(email)
    if not is_valid:
        return False, f"Invalid email format: {validation_error}"
    
    try:
        verification_code = VerificationCode.generate_code(email)
        
        logger.info("Verification code generated", extra={
            'email': email,
            'code_id': verification_code.id
        })
        
        if settings.DEBUG:
            logger.debug(f"Verification code for {email}: {verification_code.code}")
        
        # TODO: Реальная отправка email
        # from django.core.mail import send_mail
        # send_mail(...)
        
        return True, "Verification code sent successfully"
        
    except Exception as e:
        logger.error(f"Failed to send verification code: {str(e)}")
        return False, "Failed to send verification code. Please try again."

def get_user_device_stats(user):
    """
    Получает статистику по устройствам пользователя
    """
    user_devices = get_user_devices(user)
    registrations = Registration.objects.filter(user=user)
    
    return {
        'total_devices': len(user_devices),
        'devices': [
            {
                'device_hash': device.device_hash[:16] + '...',
                'last_seen': device.last_seen
            }
            for device in user_devices
        ],
        'registrations_count': registrations.count()
    }

def can_user_add_new_device(user, max_devices=3):
    """
    Проверяет может ли пользователь добавить новое устройство
    """
    if not user:
        return False, "User not found"
    
    user_devices = get_user_devices(user)
    
    if len(user_devices) >= max_devices:
        return False, f"Maximum {max_devices} devices per user allowed"
    
    return True, "Can add new device"