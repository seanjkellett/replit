import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MattermostService } from "./services/mattermost";
import { loginSchema, sendMessageSchema } from "@shared/schema";

const mattermostServices = new Map<string, MattermostService>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, serverUrl } = loginSchema.parse(req.body);
      
      const mattermostService = new MattermostService(serverUrl);
      const { user: mattermostUser, token } = await mattermostService.login(username, password);
      
      // Check if user exists in our storage
      let user = await storage.getUserByMattermostId(mattermostUser.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          mattermostId: mattermostUser.id,
          username: mattermostUser.username,
          email: mattermostUser.email,
          firstName: mattermostUser.first_name,
          lastName: mattermostUser.last_name,
          sessionToken: token,
          status: "online",
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          sessionToken: token,
          status: "online",
          firstName: mattermostUser.first_name,
          lastName: mattermostUser.last_name,
          email: mattermostUser.email,
        });
      }

      // Store service instance
      mattermostServices.set(user.id, mattermostService);

      // Store or update Mattermost config
      let config = await storage.getMattermostConfig();
      if (!config) {
        await storage.createMattermostConfig({
          serverUrl,
          apiVersion: "v4",
          isActive: true,
        });
      }

      res.json({
        user,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ 
        message: error instanceof Error ? error.message : "Authentication failed" 
      });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const user = users.find(u => u.sessionToken === token);

      if (user) {
        await storage.updateUser(user.id, {
          sessionToken: null,
          status: "offline",
        });
        mattermostServices.delete(user.id);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const user = users.find(u => u.sessionToken === token);

      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get users for direct messages
  app.get("/api/users", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const currentUser = users.find(u => u.sessionToken === token);

      if (!currentUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const mattermostService = mattermostServices.get(currentUser.id);
      if (!mattermostService) {
        return res.status(401).json({ message: "Mattermost service not available" });
      }

      const mattermostUsers = await mattermostService.getUsers();
      
      // Sync users with our storage
      const syncedUsers = [];
      for (const mmUser of mattermostUsers) {
        let user = await storage.getUserByMattermostId(mmUser.id);
        if (!user && mmUser.id !== currentUser.mattermostId) {
          user = await storage.createUser({
            mattermostId: mmUser.id,
            username: mmUser.username,
            email: mmUser.email,
            firstName: mmUser.first_name,
            lastName: mmUser.last_name,
            status: "offline",
          });
        }
        if (user && mmUser.id !== currentUser.mattermostId) {
          syncedUsers.push(user);
        }
      }

      res.json(syncedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Get direct messages
  app.get("/api/direct-messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const currentUser = users.find(u => u.sessionToken === token);

      if (!currentUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const directMessages = await storage.getDirectMessagesByUser(currentUser.mattermostId);
      
      // Get user details for each DM
      const dmWithUsers = await Promise.all(
        directMessages.map(async (dm) => {
          const otherUserId = dm.userId1 === currentUser.mattermostId ? dm.userId2 : dm.userId1;
          const otherUser = await storage.getUserByMattermostId(otherUserId);
          return {
            ...dm,
            otherUser,
          };
        })
      );

      res.json(dmWithUsers);
    } catch (error) {
      console.error("Get direct messages error:", error);
      res.status(500).json({ message: "Failed to get direct messages" });
    }
  });

  // Create or get direct message channel
  app.post("/api/direct-messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const currentUser = users.find(u => u.sessionToken === token);

      if (!currentUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { otherUserId } = req.body;
      const otherUser = await storage.getUserByMattermostId(otherUserId);
      
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const mattermostService = mattermostServices.get(currentUser.id);
      if (!mattermostService) {
        return res.status(401).json({ message: "Mattermost service not available" });
      }

      // Check if DM already exists
      const existingDMs = await storage.getDirectMessagesByUser(currentUser.mattermostId);
      let existingDM = existingDMs.find(dm => 
        (dm.userId1 === currentUser.mattermostId && dm.userId2 === otherUserId) ||
        (dm.userId2 === currentUser.mattermostId && dm.userId1 === otherUserId)
      );

      if (existingDM) {
        return res.json({
          ...existingDM,
          otherUser,
        });
      }

      // Create new direct channel in Mattermost
      const channel = await mattermostService.createDirectChannel(currentUser.mattermostId, otherUserId);
      
      // Store in our database
      const dm = await storage.createDirectMessage({
        channelId: channel.id,
        userId1: currentUser.mattermostId,
        userId2: otherUserId,
        lastMessageAt: new Date(),
        unreadCount: "0",
      });

      res.json({
        ...dm,
        otherUser,
      });
    } catch (error) {
      console.error("Create direct message error:", error);
      res.status(500).json({ message: "Failed to create direct message" });
    }
  });

  // Get messages for a channel
  app.get("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const currentUser = users.find(u => u.sessionToken === token);

      if (!currentUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { channelId } = req.params;
      const mattermostService = mattermostServices.get(currentUser.id);
      
      if (!mattermostService) {
        return res.status(401).json({ message: "Mattermost service not available" });
      }

      // Get posts from Mattermost
      const postsData = await mattermostService.getChannelPosts(channelId);
      
      // Convert posts to our message format and sync with storage
      const messages = [];
      for (const postId of postsData.order) {
        const post = postsData.posts[postId];
        if (!post) continue;

        // Look for existing message by Mattermost ID
        let message;
        const existingMessages = Array.from(storage['messages'].values());
        message = existingMessages.find(m => m.mattermostId === post.id);
        
        if (!message) {
          message = await storage.createMessage({
            mattermostId: post.id,
            channelId: post.channel_id,
            userId: post.user_id,
            content: post.message,
            type: "text",
            metadata: post.props,
            createdAt: new Date(post.create_at),
            updatedAt: new Date(post.update_at || post.create_at),
          });
        }

        // Get user info
        const user = await storage.getUserByMattermostId(post.user_id);
        messages.push({
          ...message,
          user,
        });
      }

      // Sort messages by creation time (oldest first)
      messages.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });

      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const users = Array.from(storage['users'].values());
      const currentUser = users.find(u => u.sessionToken === token);

      if (!currentUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { channelId, content } = sendMessageSchema.parse(req.body);
      const mattermostService = mattermostServices.get(currentUser.id);
      
      if (!mattermostService) {
        return res.status(401).json({ message: "Mattermost service not available" });
      }

      // Send message to Mattermost
      const post = await mattermostService.createPost(channelId, content);
      
      // Store in our database
      const message = await storage.createMessage({
        mattermostId: post.id,
        channelId: post.channel_id,
        userId: post.user_id,
        content: post.message,
        type: "text",
        metadata: post.props,
        createdAt: new Date(post.create_at),
        updatedAt: new Date(post.update_at || post.create_at),
      });

      res.json({
        ...message,
        user: currentUser,
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
