from django.urls import path
from .views import (
    MaintenanceTicketCreateView, MaintenanceTicketListView,
    MaintenanceTicketDetailView, MaintenanceTicketUpdateView,
    DashboardStatsView, RequestsSummaryView
)

urlpatterns = [
    # Maintenance Tickets
    path('ticket/', MaintenanceTicketCreateView.as_view(), name='ticket-create'),
    path('ticket/list/', MaintenanceTicketListView.as_view(), name='ticket-list'),
    path('ticket/<int:pk>/', MaintenanceTicketDetailView.as_view(), name='ticket-detail'),
    path('ticket/<int:pk>/update/', MaintenanceTicketUpdateView.as_view(), name='ticket-update'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/requests/', RequestsSummaryView.as_view(), name='requests-summary'),
]
