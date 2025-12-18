from django.urls import path
from .views import ProfileUpdateView, GoogleLoginView

urlpatterns = [
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
]
