from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Subscription  # ← Убедись что импорт есть

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_null=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')

    def validate(self, attrs):
        if 'password' in attrs and attrs['password'] is not None:
            if 'password_confirm' not in attrs or attrs['password_confirm'] is None:
                raise serializers.ValidationError({"password_confirm": "This field is required when password is provided"})
            
            if attrs['password'] != attrs['password_confirm']:
                raise serializers.ValidationError({"password": "Passwords don't match"})
            
            try:
                validate_password(attrs['password'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"password": e.messages})
        
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        user = User.objects.create(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user

# ДОБАВЛЯЕМ ЭТОТ СЕРИАЛИЗАТОР ↓
class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['start_date', 'end_date', 'is_active']

    def get_is_active(self, obj):
        return obj.is_active()