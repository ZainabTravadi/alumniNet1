from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Sum
from django.utils import timezone
from .models import Campaign, Donation, CampaignUpdate
from .serializers import CampaignSerializer, DonationSerializer

class CampaignListView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Campaign.objects.filter(end_date__gte=timezone.now().date())
        
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('-is_featured', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

class DonationListView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(donor=self.request.user, status='completed')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def fundraising_stats(request):
    total_raised = Campaign.objects.aggregate(
        total=Sum('donations__amount')
    )['total'] or 0
    
    active_campaigns = Campaign.objects.filter(
        end_date__gte=timezone.now().date()
    ).count()
    
    total_donors = Donation.objects.filter(
        status='completed'
    ).values('donor').distinct().count()
    
    user_contributions = Donation.objects.filter(
        donor=request.user, status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    data = {
        'total_raised': total_raised,
        'active_campaigns': active_campaigns,
        'total_donors': total_donors,
        'user_contributions': user_contributions
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_donations(request):
    donations = Donation.objects.filter(
        status='completed'
    ).order_by('-created_at')[:10]
    
    return Response(DonationSerializer(donations, many=True).data)