from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from .models import Allocation
from .serializers import AllocationSerializer, AllocationPreviewSerializer
from .services import run_allocation, get_allocation_preview
from django.shortcuts import get_object_or_404

class RunAllocationView(views.APIView):
    """Run the smart allocation algorithm"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        semester = request.data.get('semester', 'Fall 2025')
        count = run_allocation(semester=semester)
        return Response({
            "message": f"Successfully allocated {count} students",
            "count": count,
            "semester": semester
        }, status=status.HTTP_200_OK)

class AllocationPreviewView(views.APIView):
    """Preview allocation without committing"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        semester = request.query_params.get('semester', 'Fall 2025')
        preview = get_allocation_preview(semester)
        return Response(preview)

class MyRoomView(generics.RetrieveAPIView):
    """Get current user's room allocation"""
    serializer_class = AllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Allocation, student=self.request.user)

class AllocationListView(generics.ListAPIView):
    """List all allocations (Warden only)"""
    serializer_class = AllocationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Allocation.objects.all().select_related(
            'student', 'room', 'room__hostel', 'bed', 'student__profile'
        )
        
        # Filter by semester
        semester = self.request.query_params.get('semester')
        if semester:
            queryset = queryset.filter(semester=semester)
        
        # Filter by hostel
        hostel_id = self.request.query_params.get('hostel')
        if hostel_id:
            queryset = queryset.filter(room__hostel_id=hostel_id)
        
        return queryset

class AllocationStatsView(views.APIView):
    """Get allocation statistics"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        from users.models import CustomUser
        from housing.models import Room, Bed
        
        total_students = CustomUser.objects.filter(role=CustomUser.Role.STUDENT).count()
        profile_complete = CustomUser.objects.filter(
            role=CustomUser.Role.STUDENT, 
            is_profile_complete=True
        ).count()
        allocated = Allocation.objects.count()
        pending = profile_complete - allocated
        
        total_beds = Bed.objects.count()
        occupied_beds = Bed.objects.filter(is_occupied=True).count()
        available_beds = total_beds - occupied_beds
        
        return Response({
            'students': {
                'total': total_students,
                'profile_complete': profile_complete,
                'allocated': allocated,
                'pending': pending
            },
            'beds': {
                'total': total_beds,
                'occupied': occupied_beds,
                'available': available_beds
            }
        })


class ResetAllocationsView(views.APIView):
    """
    Reset all allocations for a semester.
    This clears allocations, resets bed occupancy, and resets hostel request statuses.
    Students will need to request hostel again.
    """
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        from housing.models import Bed, Room
        from student_requests.models import HostelRequest, HostelRequestStatus
        from django.db import transaction
        
        semester = request.data.get('semester')
        confirm = request.data.get('confirm', False)
        
        if not confirm:
            return Response({
                'error': 'Please confirm reset by setting confirm=true'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Get allocations to reset
            if semester:
                allocations = Allocation.objects.filter(semester=semester)
            else:
                allocations = Allocation.objects.all()
            
            allocation_count = allocations.count()
            
            # Get bed IDs to reset
            bed_ids = list(allocations.values_list('bed_id', flat=True))
            
            # Delete allocations
            allocations.delete()
            
            # Reset beds to unoccupied
            Bed.objects.filter(id__in=bed_ids).update(is_occupied=False)
            
            # Update room occupancy status
            Room.objects.all().update(status=Room.Status.AVAILABLE)
            for room in Room.objects.all():
                room.update_occupancy()
            
            # Reset hostel request statuses to allow new requests
            # Only reset ALLOCATED requests back to allow re-request
            HostelRequest.objects.filter(
                status=HostelRequestStatus.ALLOCATED
            ).update(status=HostelRequestStatus.PENDING)
            
            # Count pending requests that were reset
            pending_reset = HostelRequest.objects.filter(
                status=HostelRequestStatus.PENDING
            ).count()
        
        return Response({
            'message': f'Successfully reset {allocation_count} allocations',
            'allocations_cleared': allocation_count,
            'beds_freed': len(bed_ids),
            'pending_requests': pending_reset,
            'semester': semester or 'all'
        })
