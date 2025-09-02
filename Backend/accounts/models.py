from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    batch = models.CharField(max_length=4, blank=True)
    department = models.CharField(max_length=100, blank=True)
    degree = models.CharField(max_length=100, blank=True)
    current_position = models.CharField(max_length=200, blank=True)
    current_company = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Privacy settings
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    show_linkedin = models.BooleanField(default=True)
    show_career_history = models.BooleanField(default=True)
    allow_mentorship_requests = models.BooleanField(default=True)
    show_in_directory = models.BooleanField(default=True)
    
    # Notification preferences
    email_updates = models.BooleanField(default=True)
    event_reminders = models.BooleanField(default=True)
    mentorship_requests = models.BooleanField(default=True)
    forum_replies = models.BooleanField(default=False)
    donation_receipts = models.BooleanField(default=True)
    monthly_newsletter = models.BooleanField(default=True)

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('user', 'skill')

class CareerHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='career_history')
    position = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-start_date']