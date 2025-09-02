from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('directory/', views.AlumniDirectoryView.as_view(), name='alumni-directory'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
]