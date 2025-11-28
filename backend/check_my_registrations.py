import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from users.models import DeviceFingerprint, Registration

my_device_hash = "6a6c2ec9a9838f6beb385ac9f91e5aa9f96dbb60c3a4eaf6724bb78151283fbd"

print(f"Проверяем device_hash: {my_device_hash[:16]}...")

# Ищем fingerprint в базе
try:
    fingerprint = DeviceFingerprint.objects.get(device_hash=my_device_hash)
    print("✅ DeviceFingerprint найден!")
    
    # Ищем регистрации для этого устройства
    registrations = Registration.objects.filter(device=fingerprint)
    print(f"Найдено регистраций: {registrations.count()}")
    
    for reg in registrations:
        print(f"  - {reg.email} (создана: {reg.created_at})")
        
except DeviceFingerprint.DoesNotExist:
    print("❌ DeviceFingerprint НЕ найден в базе!")
    
print(f"\nВсего DeviceFingerprint в базе: {DeviceFingerprint.objects.count()}")