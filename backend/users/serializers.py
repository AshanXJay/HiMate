from rest_framework import serializers
from .models import CustomUser, StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'email', 'username', 'full_name', 'enrollment_number', 
                  'wake_up_time', 'requires_darkness', 'cleanliness', 
                  'guest_tolerance', 'dominance']
        read_only_fields = ('enrollment_number',)

class UserSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'role', 'gender', 'is_profile_complete', 'profile')

class GoogleAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(required=False)
    picture = serializers.URLField(required=False)
