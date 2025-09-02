from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Skill, UserSkill, CareerHistory

User = get_user_model()

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class CareerHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerHistory
        fields = ['id', 'position', 'company', 'location', 'start_date', 'end_date', 'is_current', 'description']

class UserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True, source='skills.skill')
    career_history = CareerHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'batch', 'department', 'degree', 'current_position', 'current_company',
            'location', 'bio', 'linkedin_url', 'website_url', 'phone', 'avatar',
            'show_email', 'show_phone', 'show_linkedin', 'show_career_history',
            'allow_mentorship_requests', 'show_in_directory',
            'email_updates', 'event_reminders', 'mentorship_requests',
            'forum_replies', 'donation_receipts', 'monthly_newsletter',
            'skills', 'career_history'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

class UserProfileSerializer(serializers.ModelSerializer):
    skills = serializers.StringRelatedField(many=True, read_only=True, source='skills.skill')
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'batch', 'department',
            'current_position', 'current_company', 'location', 'bio',
            'linkedin_url', 'avatar', 'skills'
        ]