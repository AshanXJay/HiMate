from rest_framework import serializers
from .models import SwapRequest, OutPass

class SwapRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwapRequest
        fields = '__all__'
        read_only_fields = ('student_a', 'status')

class OutPassSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutPass
        fields = '__all__'
        read_only_fields = ('student', 'status')
