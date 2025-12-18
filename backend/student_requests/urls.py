from django.urls import path
from .views import SwapRequestCreateView, OutPassCreateView

urlpatterns = [
    path('swap/', SwapRequestCreateView.as_view(), name='swap-create'),
    path('outpass/', OutPassCreateView.as_view(), name='outpass-create'),
]
