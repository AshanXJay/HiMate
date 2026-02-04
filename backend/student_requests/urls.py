from django.urls import path
from .views import (
    # Hostel Requests
    HostelRequestCreateView, HostelRequestListView, 
    HostelRequestDetailView, HostelRequestStatusView, HostelEligibilityView,
    # Swap Requests
    SwapRequestCreateView, SwapRequestListView, 
    SwapRequestDetailView, SwapRequestRespondView, SwapRequestApprovalView,
    # Outpass
    OutPassCreateView, OutPassListView, 
    OutPassDetailView, OutPassApprovalView, OutPassVerifyView,
    # Status History
    StatusHistoryListView,
)

urlpatterns = [
    # Hostel Requests
    path('hostel/', HostelRequestCreateView.as_view(), name='hostel-request-create'),
    path('hostel/eligibility/', HostelEligibilityView.as_view(), name='hostel-eligibility'),
    path('hostel/list/', HostelRequestListView.as_view(), name='hostel-request-list'),
    path('hostel/<int:pk>/', HostelRequestDetailView.as_view(), name='hostel-request-detail'),
    path('hostel/<int:pk>/status/', HostelRequestStatusView.as_view(), name='hostel-request-status'),
    
    # Swap Requests
    path('swap/', SwapRequestCreateView.as_view(), name='swap-create'),
    path('swap/list/', SwapRequestListView.as_view(), name='swap-list'),
    path('swap/<int:pk>/', SwapRequestDetailView.as_view(), name='swap-detail'),
    path('swap/<int:pk>/respond/', SwapRequestRespondView.as_view(), name='swap-respond'),
    path('swap/<int:pk>/approve/', SwapRequestApprovalView.as_view(), name='swap-approve'),
    
    # Outpass
    path('outpass/', OutPassCreateView.as_view(), name='outpass-create'),
    path('outpass/list/', OutPassListView.as_view(), name='outpass-list'),
    path('outpass/<int:pk>/', OutPassDetailView.as_view(), name='outpass-detail'),
    path('outpass/<int:pk>/approve/', OutPassApprovalView.as_view(), name='outpass-approve'),
    path('outpass/verify/<str:code>/', OutPassVerifyView.as_view(), name='outpass-verify'),
    
    # Status History
    path('history/', StatusHistoryListView.as_view(), name='status-history'),
]
