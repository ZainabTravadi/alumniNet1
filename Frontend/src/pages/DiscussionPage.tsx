"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Heart,
  Clock,
  Reply,
  Loader2,
  ArrowLeft,
  Eye,
} from "lucide-react";

const FORUM_THREADS_COLLECTION = "forum_threads";
const FORUM_REPLIES_COLLECTION = "thread_replies";

interface ReplyItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likesCount: number;
  createdAt: Date;
}

interface FullThread {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  content: string;
  viewsCount: number;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
}

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const DiscussionPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<FullThread | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);

  // Logged in user info
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    name: string;
    avatar: string;
  } | null>(null);

  // --- Listen to Auth State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentUser({
              uid: user.uid,
              name: data.displayName || user.email || "User",
              avatar: data.avatarUrl || "/placeholder-avatar.jpg",
            });
          } else {
            setCurrentUser({
              uid: user.uid,
              name: user.email || "User",
              avatar: "/placeholder-avatar.jpg",
            });
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Fetch Thread Once ---
  const fetchThreadData = useCallback(async () => {
    if (!threadId) return;
    setIsLoading(true);
    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const threadSnap = await getDoc(threadRef);
      if (threadSnap.exists()) {
        const data = threadSnap.data();
        const threadData: FullThread = {
          id: threadSnap.id,
          title: data.title || "Untitled",
          authorName: data.authorName || "Anonymous",
          authorAvatar: data.authorAvatar || "/placeholder-avatar.jpg",
          category: data.categoryId || "General",
          content: data.content || "",
          viewsCount: data.viewsCount || 0,
          likesCount: data.likesCount || 0,
          repliesCount: data.repliesCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        setThread(threadData);
      } else {
        setThread(null);
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  // --- Live Replies ---
  useEffect(() => {
    if (!threadId) return;
    const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
    const repliesRef = collection(threadRef, FORUM_REPLIES_COLLECTION);
    const q = query(repliesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ReplyItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorName: data.authorName || "Anonymous",
          authorAvatar: data.authorAvatar || "/placeholder-avatar.jpg",
          content: data.content || "",
          likesCount: data.likesCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setReplies(fetched);
    });

    return () => unsubscribe();
  }, [threadId]);

  useEffect(() => {
    fetchThreadData();
  }, [fetchThreadData]);

  // --- Post New Reply ---
  const handlePostReply = async () => {
    if (!newReplyContent.trim() || !threadId || !currentUser) return;

    setIsPostingReply(true);
    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const repliesRef = collection(threadRef, FORUM_REPLIES_COLLECTION);

      await addDoc(repliesRef, {
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: newReplyContent.trim(),
        likesCount: 0,
        createdAt: serverTimestamp(),
      });

      await updateDoc(threadRef, { repliesCount: increment(1) });
      setNewReplyContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Check console for details.");
    } finally {
      setIsPostingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-lg text-primary mt-2">Loading discussion...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center mt-20 text-xl text-red-500">
        Discussion not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Forums
      </Button>

      {/* --- Thread Header --- */}
      <Card className="glass-card shadow-lg border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">{thread.title}</CardTitle>
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30"
            >
              {thread.category}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center gap-1">
              <Avatar className="w-6 h-6">
                <AvatarImage src={thread.authorAvatar} />
              </Avatar>
              by{" "}
              <span className="font-medium text-foreground">
                {thread.authorName}
              </span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(thread.createdAt)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {thread.content}
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-4 border-t border-border">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              {thread.likesCount} Likes
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {thread.viewsCount} Views
            </span>
            <span className="flex items-center gap-1">
              <Reply className="w-4 h-4" />
              {thread.repliesCount} Replies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* --- Reply Input --- */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Post a Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your thoughtful reply here..."
            value={newReplyContent}
            onChange={(e) => setNewReplyContent(e.target.value)}
            rows={4}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {currentUser
                ? `Posting as ${currentUser.name}`
                : "Sign in to post a reply"}
            </span>
            <Button
              onClick={handlePostReply}
              disabled={!newReplyContent.trim() || isPostingReply || !currentUser}
            >
              {isPostingReply ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {isPostingReply ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Replies List --- */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{replies.length} Replies</h2>
        {replies.map((reply) => (
          <Card key={reply.id} className="glass-card">
            <CardContent className="p-4 flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={reply.authorAvatar} />
                <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{reply.authorName}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-foreground/90">{reply.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-primary">
                    <Heart className="w-3 h-3" /> {reply.likesCount}
                  </span>
                  <span className="cursor-pointer hover:text-primary">Reply</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscussionPage;
