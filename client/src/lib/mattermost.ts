import { apiRequest } from "./queryClient";
import type { User, LoginRequest, SendMessageRequest } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DirectMessageWithUser {
  id: string;
  channelId: string;
  userId1: string;
  userId2: string;
  lastMessageAt: Date | null;
  unreadCount: string;
  otherUser: User;
}

export interface MessageWithUser {
  id: string;
  mattermostId: string;
  channelId: string;
  userId: string;
  content: string;
  type: string;
  metadata: any;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/api/users");
    return response.json();
  },
};

export const directMessagesApi = {
  getDirectMessages: async (): Promise<DirectMessageWithUser[]> => {
    const response = await apiRequest("GET", "/api/direct-messages");
    return response.json();
  },

  createDirectMessage: async (otherUserId: string): Promise<DirectMessageWithUser> => {
    const response = await apiRequest("POST", "/api/direct-messages", { otherUserId });
    return response.json();
  },
};

export const messagesApi = {
  getMessages: async (channelId: string): Promise<MessageWithUser[]> => {
    const response = await apiRequest("GET", `/api/channels/${channelId}/messages`);
    return response.json();
  },

  sendMessage: async (message: SendMessageRequest): Promise<MessageWithUser> => {
    const response = await apiRequest("POST", "/api/messages", message);
    return response.json();
  },
};

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem("mattermost_token", token);
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  authToken = localStorage.getItem("mattermost_token");
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("mattermost_token");
};

