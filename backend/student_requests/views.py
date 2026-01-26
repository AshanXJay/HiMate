from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import HostelRequest, SwapRequest, OutPass, StatusHistory, RequestStatus
from .serializers import (
    HostelRequestSerializer, SwapRequestSerializer, SwapRequestCreateSerializer,
    OutPassSerializer, OutPassCreateSerializer, StatusHistorySerializer
)
from allocation.models import Allocation
from users.models import StudentProfile
import uuid

class IsOwnerOrWarden(permissions.BasePermission):
    """Allow access to owner or warden"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'WARDEN' or request.user.is_staff:
            return True
        if hasattr(obj, 'student'):
            return obj.student == request.user
        if hasattr(obj, 'student_a'):
            return obj.student_a == request.user or obj.student_b == request.user
        return False

def create_status_history(content_type, object_id, old_status, new_status, user, notes=''):
    """Utility to create status history entry"""
    StatusHistory.objects.create(
        content_type=content_type,
        object_id=object_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user,
        notes=notes
    )

# ================= Hostel Request Views =================

class HostelRequestCreateView(generics.CreateAPIView):
    """Student creates hostel accommodation request"""
    serializer_class = HostelRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        request_obj = serializer.save(student=self.request.user)
        create_status_history(
            'hostel_request', request_obj.id, '', 
            RequestStatus.PENDING, self.request.user, 
            'Request submitted'
        )

class HostelRequestListView(generics.ListAPIView):
    """List hostel requests - students see own, warden sees all"""
    serializer_class = HostelRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'WARDEN' or user.is_staff:
            queryset = HostelRequest.objects.all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return HostelRequest.objects.filter(student=user)

class HostelRequestDetailView(generics.RetrieveUpdateAPIView):
    """View/update hostel request"""
    serializer_class = HostelRequestSerializer
    permission_classes = [IsOwnerOrWarden]
    queryset = HostelRequest.objects.all()

class HostelRequestStatusView(views.APIView):
    """Warden updates hostel request status"""
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, pk):
        try:
            hostel_request = HostelRequest.objects.get(pk=pk)
            old_status = hostel_request.status
            new_status = request.data.get('status')
            notes = request.data.get('notes', '')
            
            if new_status not in RequestStatus.values:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            hostel_request.status = new_status
            hostel_request.save()
            
            create_status_history(
                'hostel_request', pk, old_status, new_status, request.user, notes
            )
            
            return Response({'message': 'Status updated', 'status': new_status})
        except HostelRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

# ================= Swap Request Views =================

class SwapRequestCreateView(generics.CreateAPIView):
    """Student creates swap request"""
    serializer_class = SwapRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Find student B by enrollment number
        enrollment = serializer.validated_data['student_b_enrollment']
        profile = StudentProfile.objects.get(enrollment_number=enrollment)
        
        swap = serializer.save(
            student_a=self.request.user,
            student_b=profile.user,
            status=SwapRequest.SwapStatus.PENDING_B_APPROVAL
        )
        
        create_status_history(
            'swap_request', swap.id, '', 
            SwapRequest.SwapStatus.PENDING_B_APPROVAL, 
            self.request.user, 'Swap request initiated'
        )

class SwapRequestListView(generics.ListAPIView):
    """List swap requests"""
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'WARDEN' or user.is_staff:
            queryset = SwapRequest.objects.all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        # Students see swaps they initiated or received
        return SwapRequest.objects.filter(
            student_a=user
        ) | SwapRequest.objects.filter(student_b=user)

class SwapRequestDetailView(generics.RetrieveAPIView):
    """View swap request details"""
    serializer_class = SwapRequestSerializer
    permission_classes = [IsOwnerOrWarden]
    queryset = SwapRequest.objects.all()

class SwapRequestRespondView(views.APIView):
    """Student B responds to swap request (agree/decline)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            swap = SwapRequest.objects.get(pk=pk)
            
            # Only student B can respond
            if swap.student_b != request.user:
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # Can only respond if pending
            if swap.status != SwapRequest.SwapStatus.PENDING_B_APPROVAL:
                return Response({'error': 'Cannot respond to this request'}, status=status.HTTP_400_BAD_REQUEST)
            
            agreed = request.data.get('agree', False)
            old_status = swap.status
            
            if agreed:
                swap.student_b_agreed = True
                swap.status = SwapRequest.SwapStatus.PENDING_WARDEN
                new_status = SwapRequest.SwapStatus.PENDING_WARDEN
                notes = 'Partner approved, awaiting warden'
            else:
                swap.status = SwapRequest.SwapStatus.REJECTED
                new_status = SwapRequest.SwapStatus.REJECTED
                notes = 'Partner declined the swap'
            
            swap.student_b_response_at = timezone.now()
            swap.save()
            
            create_status_history('swap_request', pk, old_status, new_status, request.user, notes)
            
            return Response({'message': 'Response recorded', 'status': swap.status})
        except SwapRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

class SwapRequestApprovalView(views.APIView):
    """Warden approves/rejects swap request"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            swap = SwapRequest.objects.get(pk=pk)
            
            if swap.status != SwapRequest.SwapStatus.PENDING_WARDEN:
                return Response({'error': 'Cannot process this request'}, status=status.HTTP_400_BAD_REQUEST)
            
            approved = request.data.get('approve', False)
            notes = request.data.get('notes', '')
            old_status = swap.status
            
            with transaction.atomic():
                if approved:
                    # Perform the actual swap
                    try:
                        alloc_a = Allocation.objects.get(student=swap.student_a)
                        alloc_b = Allocation.objects.get(student=swap.student_b)
                        
                        # Swap rooms and beds
                        alloc_a.room, alloc_b.room = alloc_b.room, alloc_a.room
                        alloc_a.bed, alloc_b.bed = alloc_b.bed, alloc_a.bed
                        
                        alloc_a.save()
                        alloc_b.save()
                        
                        swap.status = SwapRequest.SwapStatus.APPROVED
                        swap.warden_notes = notes
                        swap.save()
                        
                        create_status_history(
                            'swap_request', pk, old_status, 
                            SwapRequest.SwapStatus.APPROVED, request.user, 
                            f'Swap approved. {notes}'
                        )
                        
                        return Response({'message': 'Swap approved and executed'})
                    except Allocation.DoesNotExist:
                        return Response(
                            {'error': 'One or both students are not allocated'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    swap.status = SwapRequest.SwapStatus.REJECTED
                    swap.warden_notes = notes
                    swap.save()
                    
                    create_status_history(
                        'swap_request', pk, old_status, 
                        SwapRequest.SwapStatus.REJECTED, request.user, 
                        f'Swap rejected. {notes}'
                    )
                    
                    return Response({'message': 'Swap rejected'})
                    
        except SwapRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

# ================= Outpass Views =================

class OutPassCreateView(generics.CreateAPIView):
    """Student creates outpass request"""
    serializer_class = OutPassCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        outpass = serializer.save(student=self.request.user)
        create_status_history(
            'outpass', outpass.id, '', 
            RequestStatus.PENDING, self.request.user, 
            'Outpass requested'
        )

class OutPassListView(generics.ListAPIView):
    """List outpasses"""
    serializer_class = OutPassSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'WARDEN' or user.is_staff:
            queryset = OutPass.objects.all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return OutPass.objects.filter(student=user)

class OutPassDetailView(generics.RetrieveAPIView):
    """View outpass details"""
    serializer_class = OutPassSerializer
    permission_classes = [IsOwnerOrWarden]
    queryset = OutPass.objects.all()

class OutPassApprovalView(views.APIView):
    """Warden approves/rejects outpass"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            outpass = OutPass.objects.get(pk=pk)
            
            if outpass.status not in [RequestStatus.PENDING, RequestStatus.VIEWED]:
                return Response({'error': 'Cannot process this request'}, status=status.HTTP_400_BAD_REQUEST)
            
            approved = request.data.get('approve', False)
            notes = request.data.get('notes', '')
            old_status = outpass.status
            
            if approved:
                outpass.status = RequestStatus.APPROVED
                outpass.approved_at = timezone.now()
                outpass.verification_code = str(uuid.uuid4())[:8].upper()
                message = 'Outpass approved'
            else:
                outpass.status = RequestStatus.REJECTED
                message = 'Outpass rejected'
            
            outpass.warden_notes = notes
            outpass.save()
            
            create_status_history(
                'outpass', pk, old_status, outpass.status, 
                request.user, f'{message}. {notes}'
            )
            
            return Response({
                'message': message, 
                'status': outpass.status,
                'verification_code': outpass.verification_code if approved else None
            })
        except OutPass.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

class OutPassVerifyView(views.APIView):
    """Verify outpass by verification code (for authorities)"""
    permission_classes = [permissions.AllowAny]  # Authorities may not be logged in
    
    def get(self, request, code):
        try:
            outpass = OutPass.objects.get(verification_code=code)
            
            if outpass.status != RequestStatus.APPROVED:
                return Response({'valid': False, 'error': 'Outpass not approved'})
            
            return Response({
                'valid': True,
                'student_name': outpass.student.profile.full_name if hasattr(outpass.student, 'profile') else outpass.student.username,
                'enrollment': outpass.student.profile.enrollment_number if hasattr(outpass.student, 'profile') else None,
                'leave_date': outpass.leave_date,
                'return_date': outpass.return_date,
                'destination': outpass.destination,
                'approved_at': outpass.approved_at
            })
        except OutPass.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid verification code'})

# ================= Status History View =================

class StatusHistoryListView(generics.ListAPIView):
    """Get status history for a specific item"""
    serializer_class = StatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        content_type = self.request.query_params.get('type')
        object_id = self.request.query_params.get('id')
        
        if content_type and object_id:
            return StatusHistory.objects.filter(
                content_type=content_type,
                object_id=object_id
            )
        return StatusHistory.objects.none()
