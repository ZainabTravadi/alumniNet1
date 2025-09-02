from django.contrib import admin
from .models import MentorProfile, ExpertiseArea, MentorExpertise, MentorshipRequest

@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_active', 'rating', 'mentee_count', 'created_at']
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'bio']

@admin.register(ExpertiseArea)
class ExpertiseAreaAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(MentorshipRequest)
class MentorshipRequestAdmin(admin.ModelAdmin):
    list_display = ['mentee', 'mentor', 'topic', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['topic', 'mentee__first_name', 'mentor__first_name']
    date_hierarchy = 'created_at'

admin.site.register(MentorExpertise)