from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import StudentProfile
from .serializers import StudentProfileSerializer, GoogleAuthSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()

# Google Client ID from environment
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

    def perform_update(self, serializer):
        serializer.save()
        user = self.request.user
        if not user.is_profile_complete:
            user.is_profile_complete = True
            user.save()

class GoogleLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token with Google
            try:
                # Attempt real verification (will fail if token is not a valid Google JWT)
                idinfo = id_token.verify_oauth2_token(token, requests.Request(), clock_skew_in_seconds=10)
                email = idinfo['email']
                name = idinfo.get('name', '')
                first_name = idinfo.get('given_name', name.split()[0] if name else '')
                last_name = idinfo.get('family_name', name.split()[-1] if name and len(name.split()) > 1 else '')
                picture = idinfo.get('picture', '')

            except ValueError as e:
                return Response({'error': 'Invalid Google Token.'}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Logic for Role Determination
            warden_email = os.environ.get('WARDEN_EMAIL', 'warden@himate.com') # Default for dev
            
            role = None
            
            if email == warden_email:
                role = User.Role.WARDEN
            elif email.endswith('@std.uwu.ac.lk'):
                role = User.Role.STUDENT
            else:
                 return Response(
                    {"error": "Unauthorized email. Must be a University Student or authorized Staff."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # 2. Get or Create User
            try:
                user = User.objects.get(email=email)
                # Update name from Google if needed
                if first_name and (not user.first_name or user.first_name != first_name):
                    user.first_name = first_name
                    user.last_name = last_name
                    user.save()
                    
                    # Update profile full_name too
                    if hasattr(user, 'profile') and user.profile:
                        if not user.profile.full_name or user.profile.full_name == user.username:
                            user.profile.full_name = name
                            user.profile.save()
                
                # Ensure role matches
                if user.role != role:
                    user.role = role
                    if role == User.Role.WARDEN:
                        user.is_staff = True
                        user.is_superuser = True
                    user.save()
            except User.DoesNotExist:
                username = email.split('@')[0]
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='google_auth_placeholder_password',
                    first_name=first_name,
                    last_name=last_name
                )
                user.role = role
                if role == User.Role.WARDEN:
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                
                # Update profile with full name if student
                if role == User.Role.STUDENT and hasattr(user, 'profile') and user.profile:
                    user.profile.full_name = name
                    user.profile.save()
            
            # 3. Generate Token
            refresh = RefreshToken.for_user(user)
            
            # Get profile data
            profile_data = None
            enrollment_number = None
            full_name = name or first_name or user.username
            
            if hasattr(user, 'profile') and user.profile:
                enrollment_number = user.profile.enrollment_number
                full_name = user.profile.full_name or name or first_name or user.username
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'username': user.username,
                    'first_name': first_name or user.first_name or '',
                    'full_name': full_name,
                    'role': user.role,
                    'is_profile_complete': user.is_profile_complete,
                    'enrollment_number': enrollment_number
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(views.APIView):
    """Get current user's data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        profile_data = None
        if hasattr(user, 'profile') and user.profile:
            profile_data = StudentProfileSerializer(user.profile).data
        
        allocation_data = None
        if hasattr(user, 'allocation'):
            from allocation.serializers import AllocationSerializer
            allocation_data = AllocationSerializer(user.allocation).data
        
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'gender': user.gender,
            'is_profile_complete': user.is_profile_complete,
            'profile': profile_data,
            'allocation': allocation_data
        })

