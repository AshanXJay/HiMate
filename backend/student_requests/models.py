from django.db import models
from django.conf import settings

class RequestStatus(models.TextChoices):
    """Common status choices for all request types"""
    PENDING = 'PENDING', 'Pending'
    VIEWED = 'VIEWED', 'Viewed'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    WAITING = 'WAITING', 'Waiting'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class HostelRequestStatus(models.TextChoices):
    """Status choices specific to hostel requests"""
    PENDING = 'PENDING', 'Pending'          # Waiting for allocation
    ALLOCATED = 'ALLOCATED', 'Allocated'    # Successfully allocated (set by system)
    REJECTED = 'REJECTED', 'Rejected'       # Rejected by warden (requires reason)

class HostelRequest(models.Model):
    """Formal hostel accommodation request from student"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hostel_requests')
    academic_year = models.CharField(max_length=20, default='2025/2026')  # e.g., "2025/2026"
    semester = models.CharField(max_length=50, default='2025/2026 - Semester 1')  # Set dynamically from semester_utils
    status = models.CharField(max_length=20, choices=HostelRequestStatus.choices, default=HostelRequestStatus.PENDING)
    reason = models.TextField(blank=True, help_text="Why do you need hostel accommodation?")
    rejection_reason = models.TextField(blank=True, help_text="Warden's reason for rejection (required if rejected)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.semester} ({self.status})"

class SwapRequest(models.Model):
    class SwapStatus(models.TextChoices):
        PENDING_B_APPROVAL = 'PENDING_B', 'Waiting for Partner Approval'
        PENDING_WARDEN = 'PENDING_WARDEN', 'Waiting for Warden Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    student_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_swaps')
    student_b = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_swaps')
    student_b_enrollment = models.CharField(max_length=50, default='', help_text="Enrollment number of student to swap with")
    reason = models.TextField(blank=True)
    
    # Agreement workflow
    student_b_agreed = models.BooleanField(default=False)
    student_b_response_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=SwapStatus.choices, default=SwapStatus.PENDING_B_APPROVAL)
    warden_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Swap: {self.student_a.username} <-> {self.student_b.username} ({self.status})"

class OutPass(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='outpasses')
    leave_date = models.DateField()
    return_date = models.DateField()
    reason = models.TextField()
    destination = models.CharField(max_length=200, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    warden_notes = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # For QR code verification
    verification_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Outpass: {self.student.username} ({self.leave_date} to {self.return_date})"

class StatusHistory(models.Model):
    """Track status changes for any request type"""
    CONTENT_TYPES = (
        ('hostel_request', 'Hostel Request'),
        ('swap_request', 'Swap Request'),
        ('outpass', 'Outpass'),
        ('ticket', 'Maintenance Ticket'),
    )
    
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    object_id = models.PositiveIntegerField()
    
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Status histories'
    
    def __str__(self):
        return f"{self.content_type} #{self.object_id}: {self.old_status} -> {self.new_status}"
