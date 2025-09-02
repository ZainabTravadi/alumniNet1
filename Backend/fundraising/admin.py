from django.contrib import admin
from .models import Campaign, Donation, CampaignUpdate

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'goal', 'raised_amount', 'donor_count', 'is_featured', 'end_date']
    list_filter = ['category', 'is_featured', 'is_urgent', 'end_date']
    search_fields = ['title', 'description']
    date_hierarchy = 'end_date'

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'donor', 'amount', 'status', 'is_anonymous', 'created_at']
    list_filter = ['status', 'is_anonymous', 'created_at']
    search_fields = ['campaign__title', 'donor__first_name', 'donor__last_name']
    date_hierarchy = 'created_at'

@admin.register(CampaignUpdate)
class CampaignUpdateAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'title', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'content', 'campaign__title']