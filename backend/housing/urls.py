from django.urls import path
from .views import HostelListView, HostelRoomsListView

urlpatterns = [
    path('hostels/', HostelListView.as_view(), name='hostel-list'),
    path('hostels/<int:id>/rooms/', HostelRoomsListView.as_view(), name='hostel-rooms'),
]
