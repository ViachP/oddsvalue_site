# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.timezone import now
from .models import CustomUser, VerificationCode, DeviceFingerprint
from import_export.admin import ExportMixin


@admin.register(CustomUser)
class CustomUserAdmin(ExportMixin, UserAdmin):
    list_display = (
        'email',
        'get_date_joined',
        'get_expires_at', 
        'days_left',
        'get_subscription_status',  # 1 = платная подписка, 0 = нет подписки
    )
    list_filter = ('date_joined', 'expires_at')
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)

    @admin.display(description='date joined')
    def get_date_joined(self, obj: CustomUser):
        return obj.date_joined.strftime('%d.%m.%Y') if obj.date_joined else '-'

    @admin.display(description='expires_at')
    def get_expires_at(self, obj: CustomUser):
        if obj.expires_at:
            return obj.expires_at.strftime('%d.%m.%Y')
        return '-'

    @admin.display(description='days_left')
    def days_left(self, obj: CustomUser) -> int:
        if not obj.expires_at:
            return 0
        return max((obj.expires_at - now()).days, 0)

    @admin.display(description='subscription')
    def get_subscription_status(self, obj: CustomUser):
        if obj.is_superuser:
            return '-'  # прочерк для админа
        
        # ЛОГИКА:
        # - Если expires_at в будущем И пользователь имеет платную подписку → 1
        # - Во всех остальных случаях → 0
        
        # Сейчас у нас нет отдельного поля для платной подписки,
        # поэтому пока ВСЕГДА возвращаем False (кроме админа)
        # Когда добавишь логику платных подписок, измени эту часть
        return 0

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_verified', 'registration_ip', 'device_hash', 'expires_at')
        }),
    )


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email',)


@admin.register(DeviceFingerprint)
class DeviceFingerprintAdmin(admin.ModelAdmin):
    list_display = ('device_hash', 'first_seen', 'is_blocked', 'user_count')
    list_filter = ('is_blocked', 'first_seen')