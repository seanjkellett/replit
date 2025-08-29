import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User, MessageWithUser } from "@/lib/mattermost";

interface MessageBubbleProps {
  message: MessageWithUser;
  currentUser: User;
}

export default function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isOwnMessage = message.userId === currentUser.mattermostId;
  
  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || user.username[0];
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const displayName = message.user?.firstName 
    ? `${message.user.firstName} ${message.user.lastName}`.trim()
    : message.user?.username || "Unknown User";

  return (
    <div 
      className={cn(
        "flex items-start space-x-3 message-bubble-enter",
        isOwnMessage && "flex-row-reverse space-x-reverse"
      )}
      data-testid={`message-${message.id}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.user?.avatar} />
        <AvatarFallback>
          {message.user ? getInitials(message.user) : "?"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex-1", isOwnMessage && "text-right")}>
        <div className={cn(
          "flex items-center space-x-2 mb-1",
          isOwnMessage && "justify-end flex-row-reverse space-x-reverse"
        )}>
          <span className="text-sm font-medium text-foreground">
            {isOwnMessage ? "You" : displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>
        
        <Card className={cn(
          "max-w-md",
          isOwnMessage ? "ml-auto bg-primary" : "mr-auto bg-secondary"
        )}>
          <CardContent className="p-3">
            <p className={cn(
              "text-sm whitespace-pre-wrap break-words",
              isOwnMessage ? "text-primary-foreground" : "text-foreground"
            )}>
              {message.content}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
