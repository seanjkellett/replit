import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { authApi, getAuthToken } from "@/lib/mattermost";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/sidebar";
import ChatArea from "@/components/chat-area";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import type { DirectMessageWithUser } from "@/lib/mattermost";

export default function Chat() {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [activeChat, setActiveChat] = useState<DirectMessageWithUser | null>(null);

  // Check authentication
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token || error) {
      navigate("/login");
    }
  }, [error, navigate]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChatSelect = (chat: DirectMessageWithUser) => {
    setActiveChat(chat);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to Mattermost...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isMobile ? "fixed" : "relative"
        } z-50 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          currentUser={currentUser}
          onChatSelect={handleChatSelect}
          activeChat={activeChat}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              data-testid="button-toggle-sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            {activeChat && (
              <h1 className="font-semibold truncate">
                {activeChat.otherUser.firstName || activeChat.otherUser.username}
              </h1>
            )}
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Chat Content */}
        {activeChat ? (
          <ChatArea 
            currentUser={currentUser} 
            directMessage={activeChat}
            onToggleSidebar={toggleSidebar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h2 className="text-xl font-semibold mb-2">Welcome to Mattermost Chat</h2>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
