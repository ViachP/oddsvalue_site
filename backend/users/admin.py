# # users/admin.py
# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser, VerificationCode, DeviceFingerprint, Subscription

# # Регистрируем кастомную модель пользователя
# @admin.register(CustomUser)
# class CustomUserAdmin(UserAdmin):
#     list_display = ('username', 'email', 'date_joined', 'is_staff', 'free_trial_used', 'free_trial_end')
#     list_filter = ('is_staff', 'is_superuser', 'date_joined', 'free_trial_used')
#     fieldsets = UserAdmin.fieldsets + (
#         ('Additional Info', {
#             'fields': ('phone_verified', 'free_trial_used', 'free_trial_start', 'free_trial_end', 
#                       'registration_ip', 'device_hash')
#         }),
#     )

# # Регистрируем VerificationCode
# @admin.register(VerificationCode)
# class VerificationCodeAdmin(admin.ModelAdmin):
#     list_display = ('email', 'code', 'created_at', 'is_used')
#     list_filter = ('is_used', 'created_at')
#     search_fields = ('email',)

# # Регистрируем DeviceFingerprint
# @admin.register(DeviceFingerprint)
# class DeviceFingerprintAdmin(admin.ModelAdmin):
#     list_display = ('device_hash', 'first_seen', 'is_blocked', 'user_count')
#     list_filter = ('is_blocked', 'first_seen')

# # Регистрируем Subscription
# @admin.register(Subscription)
# class SubscriptionAdmin(admin.ModelAdmin):
#     list_display = ('user', 'start_date', 'end_date', 'is_active')
#     list_filter = ('start_date', 'end_date')
#     search_fields = ('user__username', 'user__email')

# # users/admin.py
# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser, VerificationCode, DeviceFingerprint, Subscription

# # Импорты для экспорта
# from import_export import resources
# from import_export.admin import ExportMixin
# from import_export.fields import Field

# # Ресурс для экспорта пользователей
# class CustomUserResource(resources.ModelResource):
#     # Кастомное поле для оставшихся дней trial
#     trial_days_remaining = Field()
    
#     class Meta:
#         model = CustomUser
#         fields = ('username', 'email', 'date_joined', 'is_staff', 'free_trial_used', 
#                  'free_trial_start', 'free_trial_end', 'phone_verified')
#         export_order = fields
    
#     def dehydrate_trial_days_remaining(self, user):
#         return user.trial_days_remaining

# # Регистрируем кастомную модель пользователя С функцией экспорта
# @admin.register(CustomUser)
# class CustomUserAdmin(ExportMixin, UserAdmin):  # Добавляем ExportMixin
#     resource_class = CustomUserResource  # Добавляем ресурс для экспорта
    
#     # Ваши оригинальные настройки
#     list_display = ('username', 'email', 'date_joined', 'is_staff', 'free_trial_used', 'free_trial_end')
#     list_filter = ('is_staff', 'is_superuser', 'date_joined', 'free_trial_used')
#     fieldsets = UserAdmin.fieldsets + (
#         ('Additional Info', {
#             'fields': ('phone_verified', 'free_trial_used', 'free_trial_start', 'free_trial_end', 
#                       'registration_ip', 'device_hash')
#         }),
#     )

# # Регистрируем VerificationCode
# @admin.register(VerificationCode)
# class VerificationCodeAdmin(admin.ModelAdmin):
#     list_display = ('email', 'code', 'created_at', 'is_used')
#     list_filter = ('is_used', 'created_at')
#     search_fields = ('email',)

# # Регистрируем DeviceFingerprint
# @admin.register(DeviceFingerprint)
# class DeviceFingerprintAdmin(admin.ModelAdmin):
#     list_display = ('device_hash', 'first_seen', 'is_blocked', 'user_count')
#     list_filter = ('is_blocked', 'first_seen')

# # Регистрируем Subscription
# @admin.register(Subscription)
# class SubscriptionAdmin(admin.ModelAdmin):
#     list_display = ('user', 'start_date', 'end_date', 'is_active')
#     list_filter = ('start_date', 'end_date')
#     search_fields = ('user__username', 'user__email')

# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, VerificationCode, DeviceFingerprint, Subscription
from import_export import resources
from import_export.admin import ExportMixin
from import_export.fields import Field

# Ресурс для экспорта пользователей
class CustomUserResource(resources.ModelResource):
    class Meta:
        model = CustomUser
        # ТОЛЬКО нужные поля: username, email, дата регистрации и окончание trial
        fields = ('username', 'email', 'date_joined', 'free_trial_end', 'phone_verified')
        export_order = fields

# Регистрируем кастомную модель пользователя
@admin.register(CustomUser)
class CustomUserAdmin(ExportMixin, UserAdmin):
    resource_class = CustomUserResource
    
    # ТОЛЬКО основные поля: username, email, дата регистрации и окончание trial
    list_display = ('username', 'email', 'date_joined', 'free_trial_end')
    
    # Убираем все лишние фильтры
    list_filter = ('date_joined', 'free_trial_end')
    
    # Fieldsets только с нужными полями
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_verified', 'free_trial_end', 'registration_ip', 'device_hash')
        }),
    )

# Остальные модели без изменений
@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email',)

@admin.register(DeviceFingerprint)
class DeviceFingerprintAdmin(admin.ModelAdmin):
    list_display = ('device_hash', 'first_seen', 'is_blocked', 'user_count')
    list_filter = ('is_blocked', 'first_seen')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'start_date', 'end_date', 'is_active')
    list_filter = ('start_date', 'end_date')
    search_fields = ('user__username', 'user__email')