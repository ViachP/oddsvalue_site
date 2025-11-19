from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_request(request):
    """Пользователь выбирает 1 или 3 месяца – создаём запись"""
    months = int(request.data.get('months', 1))
    if months not in (1, 3):
        return Response({'error': 'Неверный срок'}, status=400)
    # одна неподтверждённая заявка на пользователя
    if request.user.payments.filter(status=Payment.PENDING).exists():
        return Response({'error': 'У вас уже есть непроверенная заявка'}, status=409)

    pay = Payment.objects.create(user=request.user, months=months)
    return Response({
        'id': pay.id,
        'months': pay.months,
        'usdt_amount': pay.usdt_amount,
        'wallet': pay.wallet,
    })
