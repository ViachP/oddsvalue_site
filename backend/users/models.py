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
    last_seen = models.DateTimeField(auto_now=True)  # Добавил для отслеживания активности
    is_blocked = models.BooleanField(default=False)
    skip_verification = models.BooleanField(default=False)  # Для админов и тестирования

    def user_count(self):
        """Количество пользователей, зарегистрированных с этого устройства"""
        return self.registration_set.count()  # Используем связанные регистрации

    def __str__(self):
        status = "BLOCKED" if self.is_blocked else "ACTIVE"
        return f"{self.device_hash[:16]}... ({status})"


class Registration(models.Model):
    """
    Модель для отслеживания регистраций с устройств
    Каждая запись = одна регистрация (одна почта + одно устройство)
    """
    device = models.ForeignKey(DeviceFingerprint, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()  # Email использованный при регистрации
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Уникальность комбинации устройство-email не требуется, 
        # так как одна почта может быть только у одного пользователя
        indexes = [
            models.Index(fields=['device', 'created_at']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.email} via {self.device.device_hash[:16]}..."


class WhitelistedDevice(models.Model):
    """
    Белый список устройств, которые пропускают проверку
    (для админов, тестирования и исключений)
    """
    device_hash = models.CharField(max_length=64, unique=True)
    reason = models.CharField(max_length=100, default="admin", 
                             help_text="Причина добавления в белый список")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.device_hash[:16]}... ({self.reason})"