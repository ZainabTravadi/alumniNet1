from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MentorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    bio = models.TextField()
    availability = models.CharField(max_length=100)
    response_time = models.CharField(max_length=50)
    languages = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Mentor"
    
    @property
    def mentee_count(self):
        return MentorshipRequest.objects.filter(mentor=self.user, status='accepted').count()

class ExpertiseArea(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class MentorExpertise(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='expertise')
    area = models.ForeignKey(ExpertiseArea, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('mentor', 'area')

class MentorshipRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
    ]
    
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_mentorship_requests')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_mentorship_requests')
    topic = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.mentee.get_full_name()} -> {self.mentor.get_full_name()}: {self.topic}"