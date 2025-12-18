from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/', include('users.urls')),
    path('api/housing/', include('housing.urls')),
    path('api/allocation/', include('allocation.urls')),
    path('api/requests/', include('student_requests.urls')),
    path('api/operations/', include('operations.urls')),
]
