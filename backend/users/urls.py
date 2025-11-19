from django.urls import path
from .views import (
    UserRegistrationView,
    LoginView,          # новая JWT-ручка
    MeView,             # новая JWT-ручка
    SubscriptionDetailView,
    send_verification_code_view,
    verify_code_and_register,
    check_auth_status,
    send_login_code,        
    verify_login_code, 
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),      # JWT
    path('me/', MeView.as_view(), name='user-me'),               # JWT
    path('subscription/', SubscriptionDetailView.as_view(), name='user-subscription'),

     # новые ручки входа по коду
    path('send-login-code/', send_login_code, name='send-login-code'),
    path('verify-login-code/', verify_login_code, name='verify-login-code'),

    # без-парольные ручки (уже были)
    path('send-verification-code/', send_verification_code_view, name='send-verification-code'),
    path('verify-code-register/', verify_code_and_register, name='verify-code-register'),
    path('check-auth-status/', check_auth_status, name='check-auth-status'),
]
