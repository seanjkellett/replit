import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  LogOut, 
  X, 
  MessageSquare, 
  Users,
  Circle
} from "lucide-react";
import { authApi, usersApi, directMessagesApi, clearAuthToken } from "@/lib/mattermost";
import { useToast } from "@/hooks/use-toast";
import type { User, DirectMessageWithUser } from "@/lib/mattermost";

interface SidebarProps {
  currentUser: User;
  onChatSelect: (chat: DirectMessageWithUser) => void;
  activeChat: DirectMessageWithUser | null;
  onClose: () => void;
}

export default function Sidebar({ currentUser, onChatSelect, activeChat, onClose }: SidebarProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"dms" | "users">("dms");

  // Get all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: usersApi.getUsers,
  });

  // Get direct messages
  const { data: directMessages = [], isLoading: dmsLoading } = useQuery({
    queryKey: ["/api/direct-messages"],
    queryFn: directMessagesApi.getDirectMessages,
  });

  // Create direct message mutation
  const createDmMutation = useMutation({
    mutationFn: directMessagesApi.createDirectMessage,
    onSuccess: (newDm) => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages"] });
      onChatSelect(newDm);
      toast({
        title: "Direct message created",
        description: `Started conversation with ${newDm.otherUser.username}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create direct message",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthToken();
      queryClient.clear();
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      // Even if API fails, clear local state
      clearAuthToken();
      queryClient.clear();
      navigate("/login");
    },
  });

  const handleUserSelect = (user: User) => {
    // Check if DM already exists
    const existingDm = directMessages.find(dm => 
      dm.otherUser.mattermostId === user.mattermostId
    );
    
    if (existingDm) {
      onChatSelect(existingDm);
    } else {
      createDmMutation.mutate(user.mattermostId);
    }
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

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || user.username[0];
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  return (
    <Card className="w-64 h-full rounded-none border-r border-l-0 border-t-0 border-b-0 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Mattermost Chat</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="lg:hidden"
            data-testid="button-close-sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Current User Profile */}
        <div className="mt-3 flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser.firstName 
                ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
                : currentUser.username
              }
            </p>
            <div className="flex items-center space-x-1">
              <Circle className={`w-2 h-2 ${getStatusColor(currentUser.status || "offline")} rounded-full fill-current`} />
              <span className="text-xs text-muted-foreground capitalize">
                {currentUser.status || "offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-3 border-b border-border">
        <div className="flex space-x-1">
          <Button
            variant={selectedTab === "dms" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("dms")}
            className="flex-1"
            data-testid="tab-direct-messages"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            DMs
          </Button>
          <Button
            variant={selectedTab === "users" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("users")}
            className="flex-1"
            data-testid="tab-users"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {selectedTab === "dms" && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Direct Messages
              </h3>
              {dmsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-muted rounded animate-pulse mb-1" />
                        <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : directMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No direct messages yet</p>
              ) : (
                directMessages.map((dm) => (
                  <Button
                    key={dm.id}
                    variant={activeChat?.id === dm.id ? "secondary" : "ghost"}
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => onChatSelect(dm)}
                    data-testid={`dm-${dm.otherUser.username}`}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dm.otherUser.avatar} />
                          <AvatarFallback>{getInitials(dm.otherUser)}</AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(dm.otherUser.status || "offline")} rounded-full border-2 border-background fill-current`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {dm.otherUser.firstName 
                              ? `${dm.otherUser.firstName} ${dm.otherUser.lastName}`.trim()
                              : dm.otherUser.username
                            }
                          </p>
                          {dm.unreadCount !== "0" && (
                            <Badge variant="default" className="ml-2 text-xs">
                              {dm.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{dm.otherUser.username}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          )}

          {selectedTab === "users" && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                All Users
              </h3>
              {usersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-muted rounded animate-pulse mb-1" />
                        <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                users.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => handleUserSelect(user)}
                    disabled={createDmMutation.isPending}
                    data-testid={`user-${user.username}`}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status || "offline")} rounded-full border-2 border-background fill-current`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.firstName 
                            ? `${user.firstName} ${user.lastName}`.trim()
                            : user.username
                          }
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
