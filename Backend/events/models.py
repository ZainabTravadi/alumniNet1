from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('networking', 'Networking'),
        ('educational', 'Educational'),
        ('career', 'Career'),
        ('sports', 'Sports'),
        ('social', 'Social'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    is_virtual = models.BooleanField(default=False)
    max_attendees = models.PositiveIntegerField(null=True, blank=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'time']
    
    def __str__(self):
        return self.title
    
    @property
    def attendee_count(self):
        return self.attendees.count()

class EventRegistration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('event', 'user')