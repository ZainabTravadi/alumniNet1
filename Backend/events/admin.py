from django.contrib import admin
from .models import Event, EventRegistration

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'time', 'location', 'category', 'is_featured', 'attendee_count']
    list_filter = ['category', 'is_featured', 'is_virtual', 'date']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'date'

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'registered_at']
    list_filter = ['registered_at', 'event__category']
    search_fields = ['event__title', 'user__first_name', 'user__last_name']