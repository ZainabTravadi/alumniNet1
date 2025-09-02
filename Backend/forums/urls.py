from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('discussions/', views.DiscussionListView.as_view(), name='discussion-list'),
    path('discussions/<int:pk>/', views.DiscussionDetailView.as_view(), name='discussion-detail'),
    path('discussions/<int:discussion_id>/replies/', views.ReplyListView.as_view(), name='reply-list'),
    path('discussions/<int:discussion_id>/like/', views.toggle_like, name='toggle-like'),
    path('stats/', views.forum_stats, name='forum-stats'),
]