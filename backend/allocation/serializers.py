from rest_framework import serializers
from .models import Allocation
from housing.serializers import RoomSerializer
from users.serializers import UserSerializer

class AllocationSerializer(serializers.ModelSerializer):
    room = RoomSerializer()
    student = UserSerializer() 
    
    class Meta:
        model = Allocation
        fields = '__all__'
