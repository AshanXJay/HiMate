from django.urls import path
from .views import RunAllocationView, MyRoomView

urlpatterns = [
    path('run/', RunAllocationView.as_view(), name='run-allocation'),
    path('my-room/', MyRoomView.as_view(), name='my-room'),
]
