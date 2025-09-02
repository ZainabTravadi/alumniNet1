from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Skill, UserSkill, CareerHistory
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class AlumniDirectoryView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.filter(show_in_directory=True)
        
        search = self.request.query_params.get('search', None)
        batch = self.request.query_params.get('batch', None)
        department = self.request.query_params.get('department', None)
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(current_company__icontains=search) |
                Q(current_position__icontains=search)
            )
        
        if batch:
            queryset = queryset.filter(batch=batch)
            
        if department:
            queryset = queryset.filter(department=department)
        
        return queryset.order_by('first_name', 'last_name')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    total_alumni = User.objects.filter(show_in_directory=True).count()
    recent_alumni = User.objects.filter(show_in_directory=True).order_by('-date_joined')[:3]
    
    data = {
        'total_alumni': total_alumni,
        'recent_alumni': UserProfileSerializer(recent_alumni, many=True).data
    }
    
    return Response(data)