from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import Event, EventRegistration
from .serializers import EventSerializer, EventRegistrationSerializer

class EventListView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        upcoming = self.request.query_params.get('upcoming', None)
        if upcoming == 'true':
            queryset = queryset.filter(date__gte=timezone.now().date())
        elif upcoming == 'false':
            queryset = queryset.filter(date__lt=timezone.now().date())
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('date', 'time')
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

class EventRegistrationView(generics.CreateAPIView):
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def unregister_event(request, event_id):
    try:
        registration = EventRegistration.objects.get(
            event_id=event_id, user=request.user
        )
        registration.delete()
        return Response({'message': 'Successfully unregistered'})
    except EventRegistration.DoesNotExist:
        return Response(
            {'error': 'Registration not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def event_stats(request):
    upcoming_events = Event.objects.filter(date__gte=timezone.now().date()).count()
    total_attendees = EventRegistration.objects.count()
    user_registrations = EventRegistration.objects.filter(user=request.user).count()
    
    data = {
        'upcoming_events': upcoming_events,
        'total_attendees': total_attendees,
        'user_registrations': user_registrations
    }
    
    return Response(data)