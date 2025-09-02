from django.urls import path
from . import views

urlpatterns = [
    path('campaigns/', views.CampaignListView.as_view(), name='campaign-list'),
    path('campaigns/<int:pk>/', views.CampaignDetailView.as_view(), name='campaign-detail'),
    path('donations/', views.DonationListView.as_view(), name='donation-list'),
    path('stats/', views.fundraising_stats, name='fundraising-stats'),
    path('recent-donations/', views.recent_donations, name='recent-donations'),
]