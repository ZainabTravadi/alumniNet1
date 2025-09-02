from django.urls import path
from . import views

urlpatterns = [
    path('mentors/', views.MentorListView.as_view(), name='mentor-list'),
    path('expertise/', views.ExpertiseAreaListView.as_view(), name='expertise-list'),
    path('requests/', views.MentorshipRequestListView.as_view(), name='mentorship-request-list'),
    path('requests/<int:pk>/', views.MentorshipRequestDetailView.as_view(), name='mentorship-request-detail'),
    path('stats/', views.mentorship_stats, name='mentorship-stats'),
]