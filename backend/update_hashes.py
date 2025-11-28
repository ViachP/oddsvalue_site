import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from users.models import CustomUser, DeviceFingerprint, Registration

# Новый device_hash который показывает скрипт
new_device_hash = "6a6c2ec9a9838f6beb385ac9f91e5aa9f96dbb60c3a4eaf6724bb78151283fbd"

# Твои email
emails = ["cavin@bk.ru", "pv.slawa@gmail.com"]

print("=== ОБНОВЛЯЕМ DEVICE_HASH ===")

# Создаем или получаем DeviceFingerprint с новым хэшем
fingerprint, created = DeviceFingerprint.objects.get_or_create(
    device_hash=new_device_hash
)
print(f"DeviceFingerprint: {new_device_hash[:16]}... (created: {created})")

for email in emails:
    try:
        user = CustomUser.objects.get(email=email)
        
        # Обновляем device_hash у пользователя
        old_hash = user.device_hash
        user.device_hash = new_device_hash
        user.save()
        
        # Обновляем или создаем Registration
        registration, reg_created = Registration.objects.get_or_create(
            device=fingerprint,
            email=email,
            defaults={'user': user, 'ip_address': user.registration_ip}
        )
        
        print(f"✅ {email}")
        print(f"   Старый hash: {old_hash[:16] if old_hash else 'None'}...")
        print(f"   Новый hash: {new_device_hash[:16]}...")
        print(f"   Registration: {'created' if reg_created else 'updated'}")
        
    except CustomUser.DoesNotExist:
        print(f"❌ Пользователь {email} не найден")

print("\n=== ПРОВЕРКА ===")
print(f"Registration записи для нового device_hash:")
registrations = Registration.objects.filter(device=fingerprint)
for reg in registrations:
    print(f"  - {reg.email}")