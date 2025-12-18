from django.urls import path
from .views import MaintenanceTicketCreateView, DashboardStatsView

urlpatterns = [
    path('ticket/', MaintenanceTicketCreateView.as_view(), name='ticket-create'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
