from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from .models import MaintenanceTicket
from .serializers import (
    MaintenanceTicketSerializer, MaintenanceTicketCreateSerializer,
    MaintenanceTicketUpdateSerializer
)
from users.models import CustomUser
from housing.models import Room, Hostel, Bed
from allocation.models import Allocation
from student_requests.models import HostelRequest, SwapRequest, OutPass, StatusHistory, RequestStatus

def create_status_history(object_id, old_status, new_status, user, notes=''):
    """Utility to create status history for tickets"""
    StatusHistory.objects.create(
        content_type='ticket',
        object_id=object_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user,
        notes=notes
    )

class IsOwnerOrWarden(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'WARDEN' or request.user.is_staff:
            return True
        return obj.student == request.user

# ================= Maintenance Ticket Views =================

class MaintenanceTicketCreateView(generics.CreateAPIView):
    """Student creates maintenance ticket"""
    serializer_class = MaintenanceTicketCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Auto-assign room from student's allocation
        room = None
        if hasattr(self.request.user, 'allocation'):
            room = self.request.user.allocation.room
        
        ticket = serializer.save(student=self.request.user, room=room)
        create_status_history(
            ticket.id, '', MaintenanceTicket.Status.OPEN,
            self.request.user, 'Ticket created'
        )

class MaintenanceTicketListView(generics.ListAPIView):
    """List maintenance tickets"""
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = MaintenanceTicket.objects.all()
        
        if not (user.role == 'WARDEN' or user.is_staff):
            queryset = queryset.filter(student=user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset

class MaintenanceTicketDetailView(generics.RetrieveAPIView):
    """View ticket details"""
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [IsOwnerOrWarden]
    queryset = MaintenanceTicket.objects.all()

class MaintenanceTicketUpdateView(views.APIView):
    """Warden updates ticket status/feedback"""
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, pk):
        try:
            ticket = MaintenanceTicket.objects.get(pk=pk)
            old_status = ticket.status
            
            new_status = request.data.get('status')
            feedback = request.data.get('feedback')
            assigned_to = request.data.get('assigned_to')
            priority = request.data.get('priority')
            
            notes_parts = []
            
            if new_status and new_status != old_status:
                if new_status not in MaintenanceTicket.Status.values:
                    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                ticket.status = new_status
                notes_parts.append(f'Status: {old_status} → {new_status}')
                
                if new_status in [MaintenanceTicket.Status.RESOLVED, MaintenanceTicket.Status.CLOSED]:
                    ticket.resolved_at = timezone.now()
            
            if feedback:
                ticket.feedback = feedback
                notes_parts.append('Feedback added')
            
            if assigned_to:
                ticket.assigned_to = assigned_to
                notes_parts.append(f'Assigned to: {assigned_to}')
            
            if priority:
                ticket.priority = priority
            
            ticket.save()
            
            if notes_parts:
                create_status_history(
                    pk, old_status, ticket.status, 
                    request.user, '; '.join(notes_parts)
                )
            
            return Response({
                'message': 'Ticket updated',
                'status': ticket.status
            })
        except MaintenanceTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

# ================= Dashboard Stats View =================

class DashboardStatsView(views.APIView):
    """Comprehensive dashboard statistics for warden"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Student stats
        total_students = CustomUser.objects.filter(role=CustomUser.Role.STUDENT).count()
        profile_complete = CustomUser.objects.filter(
            role=CustomUser.Role.STUDENT, 
            is_profile_complete=True
        ).count()
        allocated_students = Allocation.objects.count()
        
        # Room stats
        total_rooms = Room.objects.count()
        available_rooms = Room.objects.filter(status=Room.Status.AVAILABLE).count()
        full_rooms = Room.objects.filter(status=Room.Status.FULL).count()
        maintenance_rooms = Room.objects.filter(status=Room.Status.MAINTENANCE).count()
        
        # Bed stats
        total_beds = Bed.objects.count()
        occupied_beds = Bed.objects.filter(is_occupied=True).count()
        
        # Hostel stats
        hostels = Hostel.objects.annotate(
            room_count=Count('rooms'),
            occupied_beds=Count('rooms__beds', filter=Q(rooms__beds__is_occupied=True))
        ).values('id', 'name', 'gender_type', 'room_count', 'occupied_beds')
        
        # Request stats
        pending_hostel_requests = HostelRequest.objects.filter(status=RequestStatus.PENDING).count()
        pending_swaps = SwapRequest.objects.filter(
            status__in=[SwapRequest.SwapStatus.PENDING_B_APPROVAL, SwapRequest.SwapStatus.PENDING_WARDEN]
        ).count()
        pending_outpasses = OutPass.objects.filter(status=RequestStatus.PENDING).count()
        
        # Ticket stats
        open_tickets = MaintenanceTicket.objects.filter(status=MaintenanceTicket.Status.OPEN).count()
        in_progress_tickets = MaintenanceTicket.objects.filter(status=MaintenanceTicket.Status.IN_PROGRESS).count()
        
        # Tickets by category
        tickets_by_category = MaintenanceTicket.objects.filter(
            status__in=[MaintenanceTicket.Status.OPEN, MaintenanceTicket.Status.IN_PROGRESS]
        ).values('category').annotate(count=Count('id'))
        
        return Response({
            'students': {
                'total': total_students,
                'profile_complete': profile_complete,
                'allocated': allocated_students,
                'pending_allocation': profile_complete - allocated_students
            },
            'rooms': {
                'total': total_rooms,
                'available': available_rooms,
                'full': full_rooms,
                'maintenance': maintenance_rooms
            },
            'beds': {
                'total': total_beds,
                'occupied': occupied_beds,
                'available': total_beds - occupied_beds,
                'occupancy_rate': round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0
            },
            'hostels': list(hostels),
            'requests': {
                'pending_hostel': pending_hostel_requests,
                'pending_swaps': pending_swaps,
                'pending_outpasses': pending_outpasses
            },
            'tickets': {
                'open': open_tickets,
                'in_progress': in_progress_tickets,
                'total_active': open_tickets + in_progress_tickets,
                'by_category': list(tickets_by_category)
            }
        })

class RequestsSummaryView(views.APIView):
    """Summary of all pending requests for warden"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        from student_requests.serializers import (
            HostelRequestSerializer, SwapRequestSerializer, OutPassSerializer
        )
        
        # Recent pending hostel requests
        hostel_requests = HostelRequest.objects.filter(
            status=RequestStatus.PENDING
        ).order_by('-created_at')[:10]
        
        # Pending swaps (both stages)
        swaps = SwapRequest.objects.filter(
            status__in=[SwapRequest.SwapStatus.PENDING_B_APPROVAL, SwapRequest.SwapStatus.PENDING_WARDEN]
        ).order_by('-created_at')[:10]
        
        # Pending outpasses
        outpasses = OutPass.objects.filter(
            status=RequestStatus.PENDING
        ).order_by('-created_at')[:10]
        
        # Recent tickets
        tickets = MaintenanceTicket.objects.filter(
            status__in=[MaintenanceTicket.Status.OPEN, MaintenanceTicket.Status.IN_PROGRESS]
        ).order_by('-created_at')[:10]
        
        return Response({
            'hostel_requests': HostelRequestSerializer(hostel_requests, many=True).data,
            'swap_requests': SwapRequestSerializer(swaps, many=True).data,
            'outpasses': OutPassSerializer(outpasses, many=True).data,
            'tickets': MaintenanceTicketSerializer(tickets, many=True).data
        })
