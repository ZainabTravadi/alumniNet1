from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import MentorProfile, ExpertiseArea, MentorshipRequest
from .serializers import MentorProfileSerializer, ExpertiseAreaSerializer, MentorshipRequestSerializer

class MentorListView(generics.ListAPIView):
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MentorProfile.objects.filter(is_active=True)
        
        search = self.request.query_params.get('search', None)
        expertise = self.request.query_params.get('expertise', None)
        
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__current_company__icontains=search) |
                Q(user__current_position__icontains=search)
            )
        
        if expertise:
            queryset = queryset.filter(expertise__area__name__icontains=expertise)
        
        return queryset.order_by('-rating', 'user__first_name')

class ExpertiseAreaListView(generics.ListAPIView):
    queryset = ExpertiseArea.objects.all()
    serializer_class = ExpertiseAreaSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentorshipRequestListView(generics.ListCreateAPIView):
    serializer_class = MentorshipRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MentorshipRequest.objects.filter(mentee=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(mentee=self.request.user)

class MentorshipRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MentorshipRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MentorshipRequest.objects.filter(
            Q(mentee=self.request.user) | Q(mentor=self.request.user)
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mentorship_stats(request):
    available_mentors = MentorProfile.objects.filter(is_active=True).count()
    active_mentorships = MentorshipRequest.objects.filter(status='accepted').count()
    user_requests = MentorshipRequest.objects.filter(mentee=request.user).count()
    
    data = {
        'available_mentors': available_mentors,
        'active_mentorships': active_mentorships,
        'user_requests': user_requests
    }
    
    return Response(data)