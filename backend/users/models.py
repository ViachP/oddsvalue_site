# from django.contrib.auth.models import AbstractUser
# from django.db import models
# from django.utils import timezone

# # Расширяем стандартного пользователя
# class CustomUser(AbstractUser):
#     email = models.EmailField(unique=True)
#     # Дополнительные поля при необходимости

# # Модель подписки
# class Subscription(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription')
#     start_date = models.DateTimeField(default=timezone.now)
#     end_date = models.DateTimeField()

#     def is_active(self):
#         return self.end_date > timezone.now()

#     def __str__(self):
#         return f"Subscription for {self.user.username} until {self.end_date}"

# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import hashlib

# Расширяем стандартного пользователя
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_verified = models.BooleanField(default=False)
    # УДАЛЯЕМ free_trial_used - он избыточен
    # УДАЛЯЕМ free_trial_start - используем date_joined вместо него
    free_trial_end = models.DateTimeField(null=True, blank=True)
    registration_ip = models.GenericIPAddressField(null=True, blank=True)
    device_hash = models.CharField(max_length=64, blank=True)
    
    # @property
    # def has_active_trial(self):
    #     """Есть ли активный trial (используем date_joined как дату начала)"""
    #     if self.date_joined and self.free_trial_end:
    #         return timezone.now() < self.free_trial_end
    #     return False
    
    # @property
    # def trial_days_remaining(self):
    #     """Сколько дней осталось trial"""
    #     if self.has_active_trial:
    #         return (self.free_trial_end - timezone.now()).days
    #     return 0
    
    # @property
    # def is_using_trial(self):
    #     """Использует ли пользователь trial (более понятное название)"""
    #     return self.free_trial_end is None and self.date_joined is not None

    @property
    def has_active_trial(self):
        """Есть ли активный trial (если free_trial_end NULL - trial активен)"""
        return self.free_trial_end is None
    
    @property
    def trial_days_remaining(self):
        """Сколько дней осталось trial (если NULL - показываем 7 дней)"""
        if self.free_trial_end is None:
            # Trial еще активен, считаем от даты регистрации
            days_passed = (timezone.now() - self.date_joined).days
            return max(7 - days_passed, 0)
        return 0
    
    @property
    def is_using_trial(self):
        """Использует ли пользователь trial"""
        return self.free_trial_end is None

# Модель подписки
class Subscription(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()

    def is_active(self):
        return self.end_date > timezone.now()

    def __str__(self):
        return f"Subscription for {self.user.username} until {self.end_date}"

# Модель для кодов подтверждения
class VerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def is_valid(self):
        return not self.is_used and (timezone.now() - self.created_at) < timedelta(minutes=10)
    
    @classmethod
    def generate_code(cls, email):
        # Удаляем старые коды для этого email
        cls.objects.filter(email=email).delete()
        
        # Генерируем новый код
        import random
        code = str(random.randint(100000, 999999))
        return cls.objects.create(email=email, code=code)

# Модель для отслеживания устройств
class DeviceFingerprint(models.Model):
    device_hash = models.CharField(max_length=64, unique=True)
    first_seen = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(CustomUser)
    is_blocked = models.BooleanField(default=False)
    
    def user_count(self):
        return self.users.count()