import { type User, type InsertUser, type DirectMessage, type InsertDirectMessage, type Message, type InsertMessage, type MattermostConfig, type InsertMattermostConfig } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByMattermostId(mattermostId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Direct message methods
  getDirectMessage(channelId: string): Promise<DirectMessage | undefined>;
  getDirectMessagesByUser(userId: string): Promise<DirectMessage[]>;
  createDirectMessage(dm: InsertDirectMessage): Promise<DirectMessage>;
  updateDirectMessage(id: string, updates: Partial<DirectMessage>): Promise<DirectMessage | undefined>;

  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByChannel(channelId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined>;

  // Config methods
  getMattermostConfig(): Promise<MattermostConfig | undefined>;
  createMattermostConfig(config: InsertMattermostConfig): Promise<MattermostConfig>;
  updateMattermostConfig(id: string, updates: Partial<MattermostConfig>): Promise<MattermostConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private directMessages: Map<string, DirectMessage>;
  private messages: Map<string, Message>;
  private mattermostConfigs: Map<string, MattermostConfig>;

  constructor() {
    this.users = new Map();
    this.directMessages = new Map();
    this.messages = new Map();
    this.mattermostConfigs = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByMattermostId(mattermostId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.mattermostId === mattermostId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Direct message methods
  async getDirectMessage(channelId: string): Promise<DirectMessage | undefined> {
    return Array.from(this.directMessages.values()).find(
      (dm) => dm.channelId === channelId,
    );
  }

  async getDirectMessagesByUser(userId: string): Promise<DirectMessage[]> {
    return Array.from(this.directMessages.values()).filter(
      (dm) => dm.userId1 === userId || dm.userId2 === userId,
    );
  }

  async createDirectMessage(insertDm: InsertDirectMessage): Promise<DirectMessage> {
    const id = randomUUID();
    const dm: DirectMessage = { ...insertDm, id };
    this.directMessages.set(id, dm);
    return dm;
  }

  async updateDirectMessage(id: string, updates: Partial<DirectMessage>): Promise<DirectMessage | undefined> {
    const dm = this.directMessages.get(id);
    if (!dm) return undefined;
    
    const updatedDm = { ...dm, ...updates };
    this.directMessages.set(id, updatedDm);
    return updatedDm;
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByChannel(channelId: string, limit = 50): Promise<Message[]> {
    const channelMessages = Array.from(this.messages.values())
      .filter((message) => message.channelId === channelId)
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return aTime - bTime;
      });
    
    return channelMessages.slice(-limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { 
      ...message, 
      ...updates, 
      updatedAt: new Date(),
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Config methods
  async getMattermostConfig(): Promise<MattermostConfig | undefined> {
    return Array.from(this.mattermostConfigs.values()).find(
      (config) => config.isActive === true,
    );
  }

  async createMattermostConfig(insertConfig: InsertMattermostConfig): Promise<MattermostConfig> {
    const id = randomUUID();
    const config: MattermostConfig = { ...insertConfig, id };
    this.mattermostConfigs.set(id, config);
    return config;
  }

  async updateMattermostConfig(id: string, updates: Partial<MattermostConfig>): Promise<MattermostConfig | undefined> {
    const config = this.mattermostConfigs.get(id);
    if (!config) return undefined;
    
    const updatedConfig = { ...config, ...updates };
    this.mattermostConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
}

export const storage = new MemStorage();
