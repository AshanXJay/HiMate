from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HostelViewSet, RoomViewSet, HostelListView, HostelRoomsListView

router = DefaultRouter()
router.register(r'hostels', HostelViewSet, basename='hostel')
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
    # Legacy endpoints for backward compatibility
    path('list/', HostelListView.as_view(), name='hostel-list-legacy'),
    path('<int:id>/rooms/', HostelRoomsListView.as_view(), name='hostel-rooms-legacy'),
]
