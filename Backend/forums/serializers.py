from rest_framework import serializers
from .models import Category, Discussion, Reply, DiscussionView, DiscussionLike
from accounts.serializers import UserProfileSerializer

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'post_count']

class ReplySerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Reply
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']

class DiscussionSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    reply_count = serializers.ReadOnlyField()
    view_count = serializers.ReadOnlyField()
    like_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    replies = ReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'content', 'author', 'category', 'category_id',
            'is_pinned', 'is_hot', 'reply_count', 'view_count', 'like_count',
            'is_liked', 'replies', 'created_at', 'updated_at'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return DiscussionLike.objects.filter(
                discussion=obj, user=request.user
            ).exists()
        return False