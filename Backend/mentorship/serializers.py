from rest_framework import serializers
from .models import MentorProfile, ExpertiseArea, MentorExpertise, MentorshipRequest
from accounts.serializers import UserProfileSerializer

class ExpertiseAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertiseArea
        fields = ['id', 'name']

class MentorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    expertise = ExpertiseAreaSerializer(many=True, read_only=True, source='expertise.area')
    mentee_count = serializers.ReadOnlyField()
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'bio', 'availability', 'response_time',
            'languages', 'is_active', 'rating', 'mentee_count',
            'expertise', 'created_at'
        ]

class MentorshipRequestSerializer(serializers.ModelSerializer):
    mentee = UserProfileSerializer(read_only=True)
    mentor = UserProfileSerializer(read_only=True)
    mentor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MentorshipRequest
        fields = [
            'id', 'mentee', 'mentor', 'mentor_id', 'topic', 'message',
            'status', 'created_at', 'updated_at'
        ]