import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, 
  Phone, 
  Video, 
  Info, 
  Send, 
  Paperclip,
  Circle
} from "lucide-react";
import { messagesApi } from "@/lib/mattermost";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/message-bubble";
import type { User, DirectMessageWithUser, MessageWithUser } from "@/lib/mattermost";
import { sendMessageSchema } from "@shared/schema";

interface ChatAreaProps {
  currentUser: User;
  directMessage: DirectMessageWithUser;
  onToggleSidebar: () => void;
}

export default function ChatArea({ currentUser, directMessage, onToggleSidebar }: ChatAreaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Poll for messages every 5 seconds to reduce flicker
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/channels", directMessage.channelId, "messages"],
    queryFn: () => messagesApi.getMessages(directMessage.channelId),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/channels", directMessage.channelId, "messages"] 
      });
      // Also refetch to get immediate feedback
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [messageContent]);

  const handleSendMessage = () => {
    const content = messageContent.trim();
    if (!content) return;

    const messageData = {
      channelId: directMessage.channelId,
      content,
    };

    try {
      sendMessageSchema.parse(messageData);
      sendMessageMutation.mutate(messageData);
    } catch (error) {
      toast({
        title: "Invalid message",
        description: "Please enter a valid message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || user.username[0];
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const otherUser = directMessage.otherUser;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b border-border p-4 flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
            data-testid="button-toggle-sidebar-chat"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>{getInitials(otherUser)}</AvatarFallback>
            </Avatar>
            <Circle 
              className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(otherUser.status || "offline")} rounded-full border-2 border-background fill-current`}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {otherUser.firstName 
                ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
                : otherUser.username
              }
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground capitalize">
                {otherUser.status || "offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-video-call"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-voice-call"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-chat-info"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1" data-testid="messages-container">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="w-48 h-16 bg-muted rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p>Send a message to get the conversation started!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <Card className="m-4 mt-0">
        <CardContent className="p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="resize-none min-h-[40px] max-h-[150px] pr-12"
                  data-testid="textarea-message"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  data-testid="button-attach-file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              className="px-4 py-2 h-auto"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>

          {/* Quick Reactions */}
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-xs text-muted-foreground">Quick reactions:</span>
            {["👍", "❤️", "😊", "👏"].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-lg hover:scale-110 transition-transform"
                data-testid={`reaction-${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
