from django.contrib import admin
from .models import Category, Discussion, Reply, DiscussionView, DiscussionLike

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'post_count', 'color']
    search_fields = ['name']

@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_pinned', 'is_hot', 'reply_count', 'created_at']
    list_filter = ['category', 'is_pinned', 'is_hot', 'created_at']
    search_fields = ['title', 'content', 'author__first_name', 'author__last_name']
    date_hierarchy = 'created_at'

@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['discussion', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__first_name', 'author__last_name']

admin.site.register(DiscussionView)
admin.site.register(DiscussionLike)