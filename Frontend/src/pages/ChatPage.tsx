import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

const MOCK_CONVERSATIONS = [
  {
    id: "1",
    name: "Riya Patel",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Hey, how’s the project going?",
    title: "Software Engineer, Google",
  },
  {
    id: "2",
    name: "Arjun Mehta",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    lastMessage: "Let's meet tomorrow.",
    title: "Data Analyst, Microsoft",
  },
  {
    id: "3",
    name: "Sneha Deshmukh",
    avatar: "https://randomuser.me/api/portraits/women/48.jpg",
    lastMessage: "Got your message!",
    title: "UI/UX Designer, Adobe",
  },
];

const CURRENT_USER_ID = "you";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { alumniId } = useParams<{ alumniId: string }>();

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: "1",
      text: "Hey there! How’s everything going?",
      timestamp: "10:15 AM",
    },
    {
      id: 2,
      senderId: CURRENT_USER_ID,
      text: "Hey Riya! All good, working on the alumni project.",
      timestamp: "10:16 AM",
    },
    {
      id: 3,
      senderId: "1",
      text: "That’s great! Need any help with design?",
      timestamp: "10:17 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const targetAlumnus =
    MOCK_CONVERSATIONS.find((conv) => conv.id === alumniId) ||
    MOCK_CONVERSATIONS[0];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      senderId: CURRENT_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen w-full bg-background max-w-7xl mx-auto border-x border-border/50 overflow-hidden">
      {/* Sidebar */}
      <Card className="hidden md:flex flex-col w-full max-w-xs border-r border-border bg-card shadow-lg">
        <div className="p-3 border-b border-border flex justify-between items-center bg-primary/10">
          <h3 className="font-semibold text-lg text-foreground">Chats</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/20 h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_CONVERSATIONS.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center p-3 space-x-3 cursor-pointer ${
                conv.id === alumniId
                  ? "bg-primary/20 border-l-4 border-primary"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => navigate(`/chat/${conv.id}`)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>{conv.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conv.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between bg-card flex-none">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="md:hidden h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={targetAlumnus.avatar} />
              <AvatarFallback>{targetAlumnus.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{targetAlumnus.name}</h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {targetAlumnus.title}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-muted/30 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === CURRENT_USER_ID
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 shadow-sm ${
                  msg.senderId === CURRENT_USER_ID
                    ? "bg-primary text-primary-foreground rounded-xl rounded-br-sm"
                    : "bg-card text-foreground rounded-xl rounded-tl-sm border border-border"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span
                  className={`block text-right mt-1 text-[10px] opacity-70 ${
                    msg.senderId === CURRENT_USER_ID
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border bg-card flex items-center space-x-3 p-3 flex-none">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/20 h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 h-9"
          />
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/80 h-9 w-9"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
