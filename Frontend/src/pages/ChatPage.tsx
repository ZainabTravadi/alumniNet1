import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    ArrowLeft,
    MoreVertical,
    Paperclip,
    Send,
    Loader2,
    MessageSquare,
    X, // Added X for search clear button
} from "lucide-react";
// 🔹 Firebase imports
import { auth, db } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    doc, getDoc, setDoc,
    collection, query, orderBy, where, serverTimestamp, onSnapshot, addDoc,
    Timestamp,
} from 'firebase/firestore';


// --- CONSTANTS & INTERFACES ---
const CHATS_COLLECTION = "chats";
const USERS_COLLECTION = "users";

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Timestamp;
}

interface ChatListItem {
    id: string;
    alumniId: string;
    name: string;
    avatar: string;
    lastMessage: string;
    title: string;
    lastActivity: Timestamp;
}

interface CurrentUserProfile {
    uid: string;
    displayName: string;
    photoURL: string;
}

// --- UTILITY: Deterministic Chat ID ---
const getChatId = (uid1: string, uid2: string): string => {
    return [uid1, uid2].sort().join('_');
};

// --- UTILITY: Fetches a single user profile with defensive fallback ---
const fetchUserProfile = async (uid: string): Promise<Pick<ChatListItem, 'name' | 'avatar' | 'title'>> => {
    try {
        const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
        const data = snap.data();
        
        return {
            name: data?.displayName || data?.email || 'Alumnus',
            avatar: data?.avatarUrl || '/placeholder-avatar.jpg',
            title: data?.title || 'Alumnus',
        };
    } catch (e) {
        console.error("Failed to fetch profile for UID:", uid, e);
        return { name: 'Unknown User', avatar: '/placeholder-avatar.jpg', title: 'Error Loading Profile' };
    }
};


const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const { alumniId } = useParams<{ alumniId?: string }>();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
    const [targetAlumnus, setTargetAlumnus] = useState<ChatListItem | null>(null);
    const [conversations, setConversations] = useState<ChatListItem[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // 👇 State for search functionality
    const [searchQuery, setSearchQuery] = useState(""); 

    const currentChatId = alumniId && currentUser ? getChatId(currentUser.uid, alumniId) : null;


    // 1. AUTH & FETCH CURRENT USER PROFILE
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userSnap = await getDoc(doc(db, USERS_COLLECTION, user.uid));
                const data = userSnap.data();
                setCurrentUser({
                    uid: user.uid,
                    displayName: data?.displayName || user.email || 'You',
                    photoURL: data?.avatarUrl || user.photoURL || '/placeholder-avatar.jpg',
                });
            } else {
                navigate('/auth');
            }
        });
        return () => unsubscribeAuth();
    }, [navigate]);


    // 2. REAL-TIME CONVERSATION LISTENER (Populates Sidebar)
    useEffect(() => {
        if (!currentUser) return;

        setIsLoading(true);

        const chatsRef = collection(db, CHATS_COLLECTION);
        const q = query(
            chatsRef,
            where('participants', 'array-contains', currentUser.uid),
            orderBy('lastActivity', 'desc')
        );

        const unsubscribeConversations = onSnapshot(q, async (snapshot) => {
            const fetchedChatsPromises = snapshot.docs.map(async (docSnap) => {
                const chatData = docSnap.data();
                const partnerUid = chatData.participants.find((uid: string) => uid !== currentUser.uid);

                if (partnerUid) {
                    try {
                        const partnerProfile = await fetchUserProfile(partnerUid);

                        return {
                            id: docSnap.id,
                            alumniId: partnerUid,
                            name: partnerProfile.name,
                            avatar: partnerProfile.avatar,
                            title: partnerProfile.title,
                            lastMessage: chatData.lastMessage || '',
                            lastActivity: chatData.lastActivity as Timestamp,
                        } as ChatListItem;
                    } catch(e) {
                        console.error(`Skipping chat ${docSnap.id}: Failed to load partner profile ${partnerUid}`);
                        return null; 
                    }
                }
                return null;
            });

            const fetchedChats = (await Promise.all(fetchedChatsPromises)).filter(c => c !== null) as ChatListItem[];

            setConversations(fetchedChats);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore Conversation Listener Failed:", error);
            setIsLoading(false);
        });

        return () => unsubscribeConversations();
    }, [currentUser]);


    // 3. TARGET CHAT PROFILE AND MESSAGE LISTENER
    useEffect(() => {
        if (!alumniId || !currentUser) {
             setTargetAlumnus(null);
             setMessages([]);
             return;
        }

        const target = conversations.find(c => c.alumniId === alumniId);

        if (target) {
            setTargetAlumnus(target);
        } else {
            const fetchNewTarget = async () => {
                const profile = await fetchUserProfile(alumniId);
                setTargetAlumnus({
                    id: currentChatId || alumniId,
                    alumniId: alumniId,
                    name: profile.name,
                    avatar: profile.avatar,
                    title: profile.title,
                    lastMessage: '',
                    lastActivity: Timestamp.now(), 
                });
            };
            if (!targetAlumnus || targetAlumnus.alumniId !== alumniId) fetchNewTarget();
        }

        if (currentChatId) {
            const messagesRef = collection(db, CHATS_COLLECTION, currentChatId, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            const unsubscribeMessages = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp
                })) as Message[];
                setMessages(fetchedMessages);
            });
            return () => unsubscribeMessages();
        }
    }, [alumniId, currentUser, currentChatId, conversations]);


    // 4. CONVERSATIONS LIST (Filtering logic implemented here)
    const displayConversations = useMemo(() => {
        let list = conversations;

        // Apply search filtering
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter(conv => 
                conv.name.toLowerCase().includes(query) || 
                conv.lastMessage.toLowerCase().includes(query)
            );
        }
        
        // Ensure the currently viewed chat (if new) is at the top of the list
        if (alumniId && targetAlumnus && !list.some(c => c.alumniId === alumniId)) {
            // Create a temporary ChatListItem for the current target
            const currentChatDisplay: ChatListItem = {
                ...targetAlumnus,
                id: currentChatId || alumniId,
                lastActivity: targetAlumnus.lastActivity,
                lastMessage: messages.length > 0 ? messages[messages.length - 1].text : targetAlumnus.lastMessage
            };
            
            // Only prepend if it matches the current search query or if no query is active
            if (!searchQuery || currentChatDisplay.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return [currentChatDisplay, ...list];
            }
        }
        
        return list;
    }, [alumniId, targetAlumnus, currentChatId, messages, conversations, searchQuery]);


    // 5. SEND MESSAGE HANDLER
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !alumniId || !currentChatId) return;

        const trimmedMessage = newMessage.trim();
        const messagePayload = {
            senderId: currentUser.uid,
            text: trimmedMessage,
            timestamp: serverTimestamp(),
        };

        try {
            const messagesRef = collection(db, CHATS_COLLECTION, currentChatId, 'messages');
            await addDoc(messagesRef, messagePayload);

            const chatRef = doc(db, CHATS_COLLECTION, currentChatId);
            await setDoc(chatRef, {
                lastMessage: trimmedMessage,
                lastActivity: serverTimestamp(),
                participants: [currentUser.uid, alumniId],
            }, { merge: true });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message (Firestore write failed):", error);
            alert("Failed to send message. Please check the console for write errors.");
        }
    };


    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const displayTarget = targetAlumnus || { name: 'Alumni Chat Hub', title: 'Start a conversation', avatar: '/placeholder-avatar.jpg' };


    // --- RENDER ---
    return (
        <div className="flex h-screen w-full bg-background max-w-7xl mx-auto border-x border-border/50 overflow-hidden">

            {/* Sidebar: Shows ALL active conversations */}
            <Card className="hidden md:flex flex-col w-full max-w-xs border-r border-border bg-card shadow-lg">
                <div className="p-3 border-b border-border flex flex-col justify-between items-center bg-primary/10">
                    <h3 className="font-semibold text-lg text-foreground w-full text-left mb-2">Chats</h3>
                    
                    {/* Search Input Container */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats by name or message..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Clear Search Button */}
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {displayConversations.length > 0 ? (
                        displayConversations.map((conv) => (
                            <div
                                key={conv.alumniId}
                                className={`flex items-center p-3 space-x-3 cursor-pointer ${
                                    conv.alumniId === alumniId
                                        ? "bg-primary/20 border-l-4 border-primary"
                                        : "hover:bg-muted/50"
                                    }`}
                                onClick={() => navigate(`/chat/${conv.alumniId}`)}
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={conv.avatar} />
                                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{conv.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {conv.lastMessage || 'Start a conversation'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-muted-foreground text-sm">
                            {searchQuery ? `No chats found for "${searchQuery}"` : "No active chats. Start one from the Directory!"}
                        </p>
                    )}
                </div>
            </Card>

            {/* Main Chat Area (Dynamic Content) */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                {/* Header (Always visible) */}
                <div className="p-3 border-b border-border flex items-center justify-between bg-card flex-none">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => alumniId ? navigate("/chat") : navigate("/dashboard")}
                            className="md:hidden h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={displayTarget.avatar} />
                            <AvatarFallback>{displayTarget.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold text-sm">{displayTarget.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {displayTarget.title}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 py-3 bg-muted/30 space-y-3">
                    {alumniId ? (
                        <>
                            {messages.map((msg) => {
                                const isSender = msg.senderId === currentUser?.uid;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] p-3 shadow-sm ${
                                                isSender
                                                    ? "bg-primary text-primary-foreground rounded-xl rounded-br-sm"
                                                    : "bg-card text-foreground rounded-xl rounded-tl-sm border border-border"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            <span
                                                className={`block text-right mt-1 text-[10px] opacity-70 ${
                                                    isSender
                                                        ? "text-primary-foreground"
                                                        : "text-muted-foreground"
                                                    }`}
                                            >
                                                {msg.timestamp && typeof msg.timestamp.toDate === 'function'
                                                    ? msg.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                    : 'Sending...'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    ) : (
                        // --- Chat Home/Welcome View ---
                        <div className="flex items-center justify-center h-full flex-col space-y-4">
                            <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                            <p className="text-lg text-muted-foreground">Select a conversation from the sidebar to begin messaging.</p>
                            <Button onClick={() => navigate('/directory')}>Find Alumni</Button>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className="border-t border-border bg-card flex items-center space-x-3 p-3 flex-none">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 h-9 w-9" disabled={!alumniId}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        placeholder={alumniId ? "Type a message..." : "Select a user to chat"}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        className="flex-1 h-9"
                        disabled={!currentUser || !alumniId}
                    />
                    <Button
                        size="icon"
                        className="bg-primary hover:bg-primary/80 h-9 w-9"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !currentUser || !alumniId}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;