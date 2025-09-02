from rest_framework import serializers
from .models import Event, EventRegistration
from accounts.serializers import UserProfileSerializer

class EventSerializer(serializers.ModelSerializer):
    organizer = UserProfileSerializer(read_only=True)
    attendee_count = serializers.ReadOnlyField()
    is_registered = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'location',
            'is_virtual', 'max_attendees', 'organizer', 'category',
            'is_featured', 'image', 'attendee_count', 'is_registered',
            'created_at', 'updated_at'
        ]
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventRegistration.objects.filter(
                event=obj, user=request.user
            ).exists()
        return False

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'user', 'registered_at']
        read_only_fields = ['user', 'registered_at']