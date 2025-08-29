import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mattermostId: text("mattermost_id").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  status: text("status").default("offline"), // online, offline, away, dnd
  sessionToken: text("session_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: text("channel_id").notNull(),
  userId1: text("user_id_1").notNull(),
  userId2: text("user_id_2").notNull(),
  lastMessageAt: timestamp("last_message_at"),
  unreadCount: text("unread_count").default("0"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mattermostId: text("mattermost_id").notNull().unique(),
  channelId: text("channel_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("text"), // text, file, system
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const mattermostConfig = pgTable("mattermost_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverUrl: text("server_url").notNull(),
  apiVersion: text("api_version").default("v4"),
  isActive: boolean("is_active").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMattermostConfigSchema = createInsertSchema(mattermostConfig).omit({
  id: true,
});

// Schemas for authentication
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  serverUrl: z.string().url("Valid server URL is required"),
});

export const sendMessageSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  content: z.string().min(1, "Message content is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMattermostConfig = z.infer<typeof insertMattermostConfigSchema>;
export type MattermostConfig = typeof mattermostConfig.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
