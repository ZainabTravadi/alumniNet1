from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Discussion, Reply, DiscussionView, DiscussionLike
from .serializers import CategorySerializer, DiscussionSerializer, ReplySerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class DiscussionListView(generics.ListCreateAPIView):
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Discussion.objects.all()
        
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        discussion = self.get_object()
        # Record view
        DiscussionView.objects.get_or_create(
            discussion=discussion, user=request.user
        )
        return super().retrieve(request, *args, **kwargs)

class ReplyListView(generics.ListCreateAPIView):
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        discussion_id = self.kwargs['discussion_id']
        return Reply.objects.filter(discussion_id=discussion_id)
    
    def perform_create(self, serializer):
        discussion_id = self.kwargs['discussion_id']
        serializer.save(
            author=self.request.user,
            discussion_id=discussion_id
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, discussion_id):
    try:
        discussion = Discussion.objects.get(id=discussion_id)
        like, created = DiscussionLike.objects.get_or_create(
            discussion=discussion, user=request.user
        )
        
        if not created:
            like.delete()
            return Response({'liked': False, 'like_count': discussion.like_count})
        
        return Response({'liked': True, 'like_count': discussion.like_count})
    
    except Discussion.DoesNotExist:
        return Response(
            {'error': 'Discussion not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def forum_stats(request):
    total_discussions = Discussion.objects.count()
    total_replies = Reply.objects.count()
    user_discussions = Discussion.objects.filter(author=request.user).count()
    
    data = {
        'total_discussions': total_discussions,
        'total_replies': total_replies,
        'user_discussions': user_discussions
    }
    
    return Response(data)