# from django.urls import path
# from .views import UserRegistrationView, SubscriptionDetailView, login_view  # ← ИМПОРТИРУЙТЕ login_view

# urlpatterns = [
#     path('register/', UserRegistrationView.as_view(), name='user-register'),
#     path('login/', login_view, name='user-login'),  # ← ДОБАВЬТЕ ЭТУ СТРОКУ
#     path('subscription/', SubscriptionDetailView.as_view(), name='user-subscription'),
# ]

# users/urls.py
from django.urls import path
from .views import (
    UserRegistrationView, 
    SubscriptionDetailView, 
    login_view,
    # ДОБАВЛЯЕМ НОВЫЕ ИМПОРТЫ
    send_verification_code_view,
    verify_code_and_register,
    check_auth_status
)

urlpatterns = [
    # СУЩЕСТВУЮЩИЕ URLs
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', login_view, name='user-login'),
    path('subscription/', SubscriptionDetailView.as_view(), name='user-subscription'),
    
    # НОВЫЕ URLs ДЛЯ БЕСПАРОЛЬНОЙ РЕГИСТРАЦИИ
    path('send-verification-code/', send_verification_code_view, name='send-verification-code'),
    path('verify-code-register/', verify_code_and_register, name='verify-code-register'),
    path('check-auth-status/', check_auth_status, name='check-auth-status'),
]