# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.timezone import now
from .models import CustomUser, VerificationCode, DeviceFingerprint, Registration, WhitelistedDevice
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
    list_display = ('device_hash_short', 'first_seen', 'last_seen', 'is_blocked', 'skip_verification', 'registration_count', 'user_emails')
    list_filter = ('is_blocked', 'skip_verification', 'first_seen')
    search_fields = ('device_hash',)
    list_editable = ('is_blocked', 'skip_verification')
    actions = ['block_devices', 'unblock_devices', 'enable_verification_skip']

    @admin.display(description='Device Hash')
    def device_hash_short(self, obj):
        return f"{obj.device_hash[:16]}..." if obj.device_hash else ""

    @admin.display(description='Registrations')
    def registration_count(self, obj):
        return obj.registration_set.count()

    @admin.display(description='User Emails')
    def user_emails(self, obj):
        registrations = obj.registration_set.all()[:3]  # Показываем первые 3
        emails = [reg.email for reg in registrations]
        if len(emails) == 0:
            return "No registrations"
        result = ", ".join(emails)
        if obj.registration_set.count() > 3:
            result += f"... (+{obj.registration_set.count() - 3} more)"
        return result

    @admin.action(description="Block selected devices")
    def block_devices(self, request, queryset):
        queryset.update(is_blocked=True)
        self.message_user(request, f"{queryset.count()} devices blocked")

    @admin.action(description="Unblock selected devices")
    def unblock_devices(self, request, queryset):
        queryset.update(is_blocked=False)
        self.message_user(request, f"{queryset.count()} devices unblocked")

    @admin.action(description="Enable verification skip")
    def enable_verification_skip(self, request, queryset):
        queryset.update(skip_verification=True)
        self.message_user(request, f"{queryset.count()} devices can now skip verification")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('email', 'device_short', 'ip_address', 'created_at', 'has_user')
    list_filter = ('created_at',)
    search_fields = ('email', 'device__device_hash', 'ip_address')
    readonly_fields = ('created_at',)

    @admin.display(description='Device')
    def device_short(self, obj):
        return f"{obj.device.device_hash[:16]}..." if obj.device else ""

    @admin.display(description='Has User', boolean=True)
    def has_user(self, obj):
        return obj.user is not None


@admin.register(WhitelistedDevice)
class WhitelistedDeviceAdmin(admin.ModelAdmin):
    list_display = ('device_hash_short', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('device_hash',)

    @admin.display(description='Device Hash')
    def device_hash_short(self, obj):
        return f"{obj.device_hash[:16]}..." if obj.device_hash else ""