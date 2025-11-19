from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from subscriptions.models import Subscription

User = get_user_model()

# --------------------------------------------------
# 1. Регистрация
# --------------------------------------------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )

# --------------------------------------------------
# 2. Логин (для удобства, если захочешь свою view)
# --------------------------------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

# --------------------------------------------------
# 3. Профиль пользователя
# --------------------------------------------------
class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('email', 'role')

    def get_role(self, obj):
        return 'admin' if obj.is_superuser else 'user'

# --------------------------------------------------
# 4. Подписка
# --------------------------------------------------
class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['trial_end', 'paid_until', 'is_active']

    def get_is_active(self, obj):
        return obj.is_active