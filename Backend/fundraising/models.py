from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Campaign(models.Model):
    CATEGORY_CHOICES = [
        ('student_support', 'Student Support'),
        ('infrastructure', 'Infrastructure'),
        ('scholarships', 'Scholarships'),
        ('environment', 'Environment'),
        ('health_wellness', 'Health & Wellness'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    goal = models.DecimalField(max_digits=10, decimal_places=2)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_campaigns')
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    image = models.ImageField(upload_to='campaigns/', blank=True, null=True)
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def raised_amount(self):
        return sum(donation.amount for donation in self.donations.filter(status='completed'))
    
    @property
    def donor_count(self):
        return self.donations.filter(status='completed').values('donor').distinct().count()
    
    @property
    def progress_percentage(self):
        if self.goal > 0:
            return min((self.raised_amount / float(self.goal)) * 100, 100)
        return 0

class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_anonymous = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        donor_name = "Anonymous" if self.is_anonymous else self.donor.get_full_name()
        return f"{donor_name} - ${self.amount} to {self.campaign.title}"

class CampaignUpdate(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.campaign.title} - {self.title}"