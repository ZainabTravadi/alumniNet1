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
  Timestamp,
  arrayUnion,
  arrayRemove,
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

// --- CONSTANTS ---
const FORUM_THREADS_COLLECTION = "forum_threads";
const FORUM_REPLIES_COLLECTION = "thread_replies";

// --- INTERFACES ---
interface ReplyItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likesCount: number;
  likedBy: string[];
  createdAt: Date;
}

interface FullThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  content: string;
  viewsCount: number;
  likesCount: number;
  likedBy: string[];
  repliesCount: number;
  createdAt: Date;
}

interface ThreadReplyNotificationData {
  threadId: string;
  threadTitle: string;
  threadAuthorId: string;
  replyAuthorId: string;
  replyAuthorName: string;
  replyAuthorAvatar: string;
}

interface ThreadLikeNotificationData {
  threadId: string;
  threadTitle: string;
  threadAuthorId: string;
  likerUserId: string;
  likerUserName: string;
  likerUserAvatar: string;
}

interface ReplyLikeNotificationData {
  threadId: string;
  replyId: string;
  replyAuthorId: string;
  replyContent: string;
  likerUserId: string;
  likerUserName: string;
  likerUserAvatar: string;
}

// --- FORUM NOTIFICATION UTILITY FUNCTIONS ---
const createForumReplyNotification = async (data: ThreadReplyNotificationData) => {
  const {
    threadAuthorId,
    replyAuthorId,
    replyAuthorName,
    threadTitle,
    threadId,
    replyAuthorAvatar,
  } = data;

  if (threadAuthorId === replyAuthorId) {
    console.log("Reply by thread author. Notification skipped.");
    return;
  }

  const cleanTitle =
    threadTitle.substring(0, 40) + (threadTitle.length > 40 ? "..." : "");

  const notificationPayload = {
    type: "forum",
    category: "forums",
    title: "New Reply in Your Discussion",
    message: `${replyAuthorName} replied to your discussion: "${cleanTitle}"`,
    avatar: replyAuthorAvatar || null,
    timestamp: Timestamp.now(),
    isRead: false,
    actionable: true,
    linkToId: threadId,
    senderName: replyAuthorName,
  };

  try {
    const notifCollectionRef = collection(
      db,
      "users",
      threadAuthorId,
      "notifications"
    );
    await addDoc(notifCollectionRef, notificationPayload);
    console.log(
      `✅ Forum reply notification sent to thread author (UID: ${threadAuthorId})`
    );
  } catch (error) {
    console.error("❌ Error creating forum reply notification:", error);
  }
};

const createThreadLikeNotification = async (data: ThreadLikeNotificationData) => {
  const {
    threadAuthorId,
    likerUserId,
    likerUserName,
    threadTitle,
    threadId,
    likerUserAvatar,
  } = data;

  if (threadAuthorId === likerUserId) {
    console.log("Self-like. Notification skipped.");
    return;
  }

  const cleanTitle =
    threadTitle.substring(0, 40) + (threadTitle.length > 40 ? "..." : "");

  const notificationPayload = {
    type: "forum",
    category: "forums",
    title: "Someone Liked Your Discussion",
    message: `${likerUserName} liked your discussion: "${cleanTitle}"`,
    avatar: likerUserAvatar || null,
    timestamp: Timestamp.now(),
    isRead: false,
    actionable: true,
    linkToId: threadId,
    senderName: likerUserName,
  };

  try {
    const notifCollectionRef = collection(
      db,
      "users",
      threadAuthorId,
      "notifications"
    );
    await addDoc(notifCollectionRef, notificationPayload);
    console.log(
      `✅ Thread like notification sent to thread author (UID: ${threadAuthorId})`
    );
  } catch (error) {
    console.error("❌ Error creating thread like notification:", error);
  }
};

const createReplyLikeNotification = async (data: ReplyLikeNotificationData) => {
  const {
    replyAuthorId,
    likerUserId,
    likerUserName,
    replyContent,
    threadId,
    likerUserAvatar,
  } = data;

  if (replyAuthorId === likerUserId) {
    console.log("Self-like on reply. Notification skipped.");
    return;
  }

  const cleanContent =
    replyContent.substring(0, 40) + (replyContent.length > 40 ? "..." : "");

  const notificationPayload = {
    type: "forum",
    category: "forums",
    title: "Someone Liked Your Reply",
    message: `${likerUserName} liked your reply: "${cleanContent}"`,
    avatar: likerUserAvatar || null,
    timestamp: Timestamp.now(),
    isRead: false,
    actionable: true,
    linkToId: threadId,
    senderName: likerUserName,
  };

  try {
    const notifCollectionRef = collection(
      db,
      "users",
      replyAuthorId,
      "notifications"
    );
    await addDoc(notifCollectionRef, notificationPayload);
    console.log(
      `✅ Reply like notification sent to reply author (UID: ${replyAuthorId})`
    );
  } catch (error) {
    console.error("❌ Error creating reply like notification:", error);
  }
};

// --- TIME FORMATTING UTILITY ---
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

// --- MAIN COMPONENT ---
const DiscussionPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<FullThread | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isLikingThread, setIsLikingThread] = useState(false);

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

  // --- Fetch Thread Once (and increment view count) ---
  const fetchThreadData = useCallback(async () => {
    if (!threadId) return;
    setIsLoading(true);
    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const threadSnap = await getDoc(threadRef);
      if (threadSnap.exists()) {
        const data = threadSnap.data();

        // Increment view count
        await updateDoc(threadRef, { viewsCount: increment(1) });

        const threadData: FullThread = {
          id: threadSnap.id,
          title: data.title || "Untitled",
          authorId: data.authorId || "unknown",
          authorName: data.authorName || "Anonymous",
          authorAvatar: data.authorAvatar || "/placeholder-avatar.jpg",
          category: data.categoryId || "General",
          content: data.content || "",
          viewsCount: (data.viewsCount || 0) + 1,
          likesCount: data.likesCount || 0,
          likedBy: data.likedBy || [],
          repliesCount: data.repliesCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        setThread(threadData);
      } else {
        setThread(null);
      }
    } catch (error) {
      console.error("Error fetching thread or incrementing views:", error);
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
          authorId: data.authorId || "unknown",
          authorName: data.authorName || "Anonymous",
          authorAvatar: data.authorAvatar || "/placeholder-avatar.jpg",
          content: data.content || "",
          likesCount: data.likesCount || 0,
          likedBy: data.likedBy || [],
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

  // --- Toggle Like Thread ---
  const handleLikeThread = async () => {
    if (!currentUser || !thread || !threadId) {
      alert("Please sign in to like this discussion.");
      return;
    }

    setIsLikingThread(true);
    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const hasLiked = thread.likedBy.includes(currentUser.uid);

      if (hasLiked) {
        // Unlike
        await updateDoc(threadRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        });
        setThread({
          ...thread,
          likesCount: thread.likesCount - 1,
          likedBy: thread.likedBy.filter((uid) => uid !== currentUser.uid),
        });
      } else {
        // Like
        await updateDoc(threadRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        });
        setThread({
          ...thread,
          likesCount: thread.likesCount + 1,
          likedBy: [...thread.likedBy, currentUser.uid],
        });

        // Send notification
        await createThreadLikeNotification({
          threadId: thread.id,
          threadTitle: thread.title,
          threadAuthorId: thread.authorId,
          likerUserId: currentUser.uid,
          likerUserName: currentUser.name,
          likerUserAvatar: currentUser.avatar,
        });
      }
    } catch (error) {
      console.error("Error toggling thread like:", error);
      alert("Failed to like thread. Please try again.");
    } finally {
      setIsLikingThread(false);
    }
  };

  // --- Toggle Like Reply ---
  const handleLikeReply = async (reply: ReplyItem) => {
    if (!currentUser || !threadId) {
      alert("Please sign in to like this reply.");
      return;
    }

    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const replyRef = doc(threadRef, FORUM_REPLIES_COLLECTION, reply.id);
      const hasLiked = reply.likedBy.includes(currentUser.uid);

      if (hasLiked) {
        // Unlike
        await updateDoc(replyRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        });
      } else {
        // Like
        await updateDoc(replyRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        });

        // Send notification
        await createReplyLikeNotification({
          threadId: threadId,
          replyId: reply.id,
          replyAuthorId: reply.authorId,
          replyContent: reply.content,
          likerUserId: currentUser.uid,
          likerUserName: currentUser.name,
          likerUserAvatar: currentUser.avatar,
        });
      }
    } catch (error) {
      console.error("Error toggling reply like:", error);
      alert("Failed to like reply. Please try again.");
    }
  };

  // --- Post New Reply (with Notification Logic) ---
  const handlePostReply = async () => {
    if (!newReplyContent.trim() || !threadId || !currentUser || !thread) {
      alert(
        "Cannot post reply. Please ensure you are signed in and the thread is fully loaded."
      );
      return;
    }

    setIsPostingReply(true);
    try {
      const threadRef = doc(db, FORUM_THREADS_COLLECTION, threadId);
      const repliesRef = collection(threadRef, FORUM_REPLIES_COLLECTION);

      // Add reply
      await addDoc(repliesRef, {
        authorId: currentUser.uid,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: newReplyContent.trim(),
        likesCount: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });

      // Update thread counts
      await updateDoc(threadRef, {
        repliesCount: increment(1),
        lastActivity: serverTimestamp(),
      });

      // Send notification
      await createForumReplyNotification({
        threadId: thread.id,
        threadTitle: thread.title,
        threadAuthorId: thread.authorId,
        replyAuthorId: currentUser.uid,
        replyAuthorName: currentUser.name,
        replyAuthorAvatar: currentUser.avatar,
      });

      setNewReplyContent("");
    } catch (error) {
      console.error("Error posting reply or sending notification:", error);
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

  const isThreadLikedByCurrentUser = currentUser
    ? thread.likedBy.includes(currentUser.uid)
    : false;

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
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button
                onClick={handleLikeThread}
                disabled={isLikingThread || !currentUser}
                className={`flex items-center gap-1 transition-colors ${
                  isThreadLikedByCurrentUser
                    ? "text-red-500"
                    : "hover:text-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isThreadLikedByCurrentUser ? "fill-current" : ""
                  }`}
                />
                {thread.likesCount} {thread.likesCount === 1 ? "Like" : "Likes"}
              </button>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {thread.viewsCount} Views
              </span>
              <span className="flex items-center gap-1">
                <Reply className="w-4 h-4" />
                {thread.repliesCount} Replies
              </span>
            </div>
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
              disabled={
                !newReplyContent.trim() || isPostingReply || !currentUser
              }
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
        {replies.map((reply) => {
          const isReplyLikedByCurrentUser = currentUser
            ? reply.likedBy.includes(currentUser.uid)
            : false;

          return (
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
                    <button
                      onClick={() => handleLikeReply(reply)}
                      disabled={!currentUser}
                      className={`flex items-center gap-1 transition-colors ${
                        isReplyLikedByCurrentUser
                          ? "text-red-500"
                          : "hover:text-primary"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          isReplyLikedByCurrentUser ? "fill-current" : ""
                        }`}
                      />
                      {reply.likesCount}
                    </button>
                    <span className="cursor-pointer hover:text-primary">
                      Reply
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionPage;