# matches/serializers.py
from rest_framework import serializers
from .models import MainLeague

class MainLeagueSerializer(serializers.ModelSerializer): 
    outcome = serializers.CharField(read_only=True)  
    class Meta:
        model = MainLeague
        fields = '__all__' # Включаем все поля модели

