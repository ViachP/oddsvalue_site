import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.test import RequestFactory
from users.utils import generate_device_fingerprint

# Создаем тестовый request похожий на твой браузер
factory = RequestFactory()
request = factory.get('/')
request.META = {
    'HTTP_USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'HTTP_ACCEPT': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'HTTP_ACCEPT_ENCODING': 'gzip, deflate, br, zstd',
    'HTTP_ACCEPT_LANGUAGE': 'en-US,en;q=0.9',
}

device_hash = generate_device_fingerprint(request)
print(f"Твой device_hash: {device_hash}")

# =================================================================

#!/usr/bin/env python
# import os
# import django

# # Исправляем путь к настройкам
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
# django.setup()

# from users.models import WhitelistedDevice, Registration, DeviceFingerprint

# print("=== CHECKING WHITELIST ===")
# all_whitelisted = WhitelistedDevice.objects.all()
# print(f"Total whitelisted devices: {all_whitelisted.count()}")

# for device in all_whitelisted:
#     print(f" - {device.device_hash[:20]}... ({device.created_at})")

# if all_whitelisted.exists():
#     print("\n⚠️  WHITELIST IS NOT EMPTY! This may be causing the issue.")
#     answer = input("Delete all whitelist entries? (y/n): ")
#     if answer.lower() == 'y':
#         WhitelistedDevice.objects.all().delete()
#         print("All whitelist entries deleted!")
# else:
#     print("Whitelist is empty - not the issue")

# print("\n=== CHECKING REGISTRATIONS ===")
# all_registrations = Registration.objects.all().select_related('device', 'user')
# print(f"Total registrations: {all_registrations.count()}")

# for reg in all_registrations:
#     print(f" - Device: {reg.device.device_hash[:20]}... -> Email: {reg.email}")

# print("\n=== CHECKING UNIQUE DEVICES ===")
# unique_devices = DeviceFingerprint.objects.all()
# print(f"Unique devices: {unique_devices.count()}")
# for device in unique_devices:
#     regs = Registration.objects.filter(device=device)
#     emails = list(regs.values_list('email', flat=True))
#     print(f" - Device {device.device_hash[:20]}... has {regs.count()} registrations: {emails}")

# print("\n=== DONE ===")