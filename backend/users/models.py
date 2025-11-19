from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    phone_verified = models.BooleanField(default=False)
    registration_ip = models.GenericIPAddressField(null=True, blank=True)
    device_hash = models.CharField(max_length=64, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Access expires')

    # делаем стандартное поле username необязательным
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        null=True,
        help_text='Not required (filled automatically)',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_display_name(self):
        """Имя для отображения (админ или email)"""
        return 'admin' if self.is_superuser else self.email

    # ---------- ЛОГИКА ПОДПИСКИ ----------
    @property
    def has_active_trial(self):
        """Активен ли trial период (7 дней)"""
        if self.is_superuser:
            return True
        return self.expires_at and self.expires_at > timezone.now()

    @property
    def trial_days_remaining(self):
        """Сколько дней осталось до конца trial"""
        if self.is_superuser:
            return None  # У админа бесконечный доступ
        if not self.expires_at:
            return 0
        remaining = self.expires_at - timezone.now()
        return max(0, remaining.days)

    @property
    def is_using_trial(self):
        """Использует ли пользователь trial период"""
        return self.expires_at and self.expires_at > timezone.now()

    def set_trial_period(self, days=7):
        """Установить trial период"""
        if not self.is_superuser:
            self.expires_at = timezone.now() + timedelta(days=days)
            self.save()


class VerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_used and (timezone.now() - self.created_at) < timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.code}"

    @classmethod
    def generate_code(cls, email):
        cls.objects.filter(email=email).delete()
        import random
        code = str(random.randint(100000, 999999))
        return cls.objects.create(email=email, code=code)


class DeviceFingerprint(models.Model):
    device_hash = models.CharField(max_length=64, unique=True)
    first_seen = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(CustomUser)
    is_blocked = models.BooleanField(default=False)

    def user_count(self):
        return self.users.count()

    def __str__(self):
        return self.device_hash