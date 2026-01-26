from django.urls import path
from .views import (
    RunAllocationView, AllocationPreviewView, MyRoomView,
    AllocationListView, AllocationStatsView
)

urlpatterns = [
    path('run/', RunAllocationView.as_view(), name='run-allocation'),
    path('preview/', AllocationPreviewView.as_view(), name='allocation-preview'),
    path('my-room/', MyRoomView.as_view(), name='my-room'),
    path('list/', AllocationListView.as_view(), name='allocation-list'),
    path('stats/', AllocationStatsView.as_view(), name='allocation-stats'),
]
