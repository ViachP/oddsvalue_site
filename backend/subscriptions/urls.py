from django.urls import path
from .views import create_payment_request

app_name = 'subscriptions'

urlpatterns = [
    path('api/create-payment/', create_payment_request, name='create_payment'),
]

