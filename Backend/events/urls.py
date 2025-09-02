from django.urls import path
from . import views

urlpatterns = [
    path('', views.EventListView.as_view(), name='event-list'),
    path('<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('register/', views.EventRegistrationView.as_view(), name='event-register'),
    path('<int:event_id>/unregister/', views.unregister_event, name='event-unregister'),
    path('stats/', views.event_stats, name='event-stats'),
]