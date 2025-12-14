from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, ios_test  # ← добавь ios_test
from django.urls import path, include

router = DefaultRouter()
router.register(r'matches', MatchViewSet)

# urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
    path('ios-test/', ios_test, name='ios_test'),  # ← эту строку добавь
]