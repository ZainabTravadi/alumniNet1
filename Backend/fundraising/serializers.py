from rest_framework import serializers
from .models import Campaign, Donation, CampaignUpdate
from accounts.serializers import UserProfileSerializer

class CampaignUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignUpdate
        fields = ['id', 'title', 'content', 'created_at']

class CampaignSerializer(serializers.ModelSerializer):
    organizer = UserProfileSerializer(read_only=True)
    raised_amount = serializers.ReadOnlyField()
    donor_count = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    updates = CampaignUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'category', 'goal', 'organizer',
            'is_featured', 'is_urgent', 'image', 'end_date',
            'raised_amount', 'donor_count', 'progress_percentage',
            'updates', 'created_at', 'updated_at'
        ]

class DonationSerializer(serializers.ModelSerializer):
    donor = UserProfileSerializer(read_only=True)
    campaign = CampaignSerializer(read_only=True)
    campaign_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Donation
        fields = [
            'id', 'campaign', 'campaign_id', 'donor', 'amount',
            'status', 'is_anonymous', 'message', 'created_at'
        ]