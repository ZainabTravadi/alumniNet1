from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, UserSkill, CareerHistory

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Alumni Info', {
            'fields': ('batch', 'department', 'degree', 'current_position', 'current_company', 'location', 'bio', 'linkedin_url', 'website_url', 'phone', 'avatar')
        }),
        ('Privacy Settings', {
            'fields': ('show_email', 'show_phone', 'show_linkedin', 'show_career_history', 'allow_mentorship_requests', 'show_in_directory')
        }),
        ('Notifications', {
            'fields': ('email_updates', 'event_reminders', 'mentorship_requests', 'forum_replies', 'donation_receipts', 'monthly_newsletter')
        }),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Skill)
admin.site.register(UserSkill)
admin.site.register(CareerHistory)