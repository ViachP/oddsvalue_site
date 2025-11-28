import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from users.models import CustomUser, DeviceFingerprint, Registration

print("=== DEBUG USERS ===")

# Просто берем первого пользователя
user = CustomUser.objects.first()
if user:
    print(f"First user: {user.email}")
    print(f"Device hash: '{user.device_hash}'")
    
    # Добавляем тестовый device_hash
    user.device_hash = "test_device_hash_123"
    user.save()
    print("Added test device_hash")
    
    # Создаем Registration
    fingerprint, _ = DeviceFingerprint.objects.get_or_create(device_hash="test_device_hash_123")
    Registration.objects.create(
        device=fingerprint,
        user=user,
        email=user.email,
        ip_address=user.registration_ip
    )
    print("Created registration record")
else:
    print("No users found")

print("=== DONE ===")