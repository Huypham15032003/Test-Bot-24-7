import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected"]);
export const userRoleEnum = pgEnum("user_role", ["student", "lecturer", "alumni", "moderator", "admin"]);

export const userProfiles = pgTable("user_profiles", {
  userId: varchar("user_id").primaryKey(),
  displayName: text("display_name"),
  faculty: text("faculty"),
  role: userRoleEnum("role").default("student"),
  points: integer("points").default(0),
  bio: text("bio"),
  studentId: text("student_id"),
  verified: boolean("verified").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const userProfileRelations = relations(userProfiles, ({ many }) => ({
  documents: many(documents),
  comments: many(comments),
  ratings: many(ratings),
  badges: many(userBadges),
  notifications: many(notifications),
  follows: many(follows),
  forumThreads: many(forumThreads),
  forumReplies: many(forumReplies),
}));

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  faculty: text("faculty").notNull(),
  subject: text("subject"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  uploaderId: varchar("uploader_id").notNull(),
  status: documentStatusEnum("status").default("pending"),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  averageRating: integer("average_rating").default(0),
  ratingCount: integer("rating_count").default(0),
  year: text("year"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  rejectionReason: text("rejection_reason"),
});

export const documentRelations = relations(documents, ({ one, many }) => ({
  uploader: one(userProfiles, { fields: [documents.uploaderId], references: [userProfiles.userId] }),
  comments: many(comments),
  ratings: many(ratings),
}));

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentRelations = relations(comments, ({ one }) => ({
  document: one(documents, { fields: [comments.documentId], references: [documents.id] }),
  user: one(userProfiles, { fields: [comments.userId], references: [userProfiles.userId] }),
}));

export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratingRelations = relations(ratings, ({ one }) => ({
  document: one(documents, { fields: [ratings.documentId], references: [documents.id] }),
  user: one(userProfiles, { fields: [ratings.userId], references: [userProfiles.userId] }),
}));

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

export const downloadRelations = relations(downloads, ({ one }) => ({
  document: one(documents, { fields: [downloads.documentId], references: [documents.id] }),
  user: one(userProfiles, { fields: [downloads.userId], references: [userProfiles.userId] }),
}));

export const forumThreads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  courseCode: text("course_code"),
  faculty: text("faculty"),
  authorId: varchar("author_id").notNull(),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumThreadRelations = relations(forumThreads, ({ one, many }) => ({
  author: one(userProfiles, { fields: [forumThreads.authorId], references: [userProfiles.userId] }),
  replies: many(forumReplies),
}));

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  isBestAnswer: boolean("is_best_answer").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumReplyRelations = relations(forumReplies, ({ one }) => ({
  thread: one(forumThreads, { fields: [forumReplies.threadId], references: [forumThreads.id] }),
  user: one(userProfiles, { fields: [forumReplies.userId], references: [userProfiles.userId] }),
}));

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),
  requirement: integer("requirement").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  badgeId: varchar("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(userProfiles, { fields: [userBadges.userId], references: [userProfiles.userId] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(userProfiles, { fields: [notifications.userId], references: [userProfiles.userId] }),
}));

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetValue: text("target_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followRelations = relations(follows, ({ one }) => ({
  user: one(userProfiles, { fields: [follows.userId], references: [userProfiles.userId] }),
}));

export const shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(),
  type: text("type").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
});

export const shopPurchases = pgTable("shop_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemId: varchar("item_id").notNull(),
  pointsSpent: integer("points_spent").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const shopPurchaseRelations = relations(shopPurchases, ({ one }) => ({
  user: one(userProfiles, { fields: [shopPurchases.userId], references: [userProfiles.userId] }),
  item: one(shopItems, { fields: [shopPurchases.itemId], references: [shopItems.id] }),
}));

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ joinedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true, downloadCount: true, viewCount: true, averageRating: true, ratingCount: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true, replyCount: true, isPinned: true, isLocked: true });
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ id: true, createdAt: true, isBestAnswer: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertShopPurchaseSchema = createInsertSchema(shopPurchases).omit({ id: true, purchasedAt: true });

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type ShopItem = typeof shopItems.$inferSelect;
export type ShopPurchase = typeof shopPurchases.$inferSelect;
export type InsertShopPurchase = z.infer<typeof insertShopPurchaseSchema>;

export const FACULTIES = [
  "Khoa Mo",
  "Khoa Dia chat",
  "Khoa Dau khi",
  "Khoa Moi truong",
  "Khoa Trac dia - Ban do",
  "Khoa Cong nghe khoang san",
  "Khoa Co - Dien",
  "Khoa Cong nghe thong tin",
  "Khoa Kinh te - QTKD",
  "Khoa Khoa hoc co ban",
] as const;

export const CATEGORIES = [
  "Slide bai giang",
  "De cuong mon hoc",
  "Bai tap lon",
  "Do an tot nghiep",
  "Luan van",
  "Sach giao trinh",
  "De thi cu",
  "Phan mem chuyen nganh",
  "Tai lieu tieng Anh",
  "Khac",
] as const;

export const POPULAR_TAGS = [
  "Dia chat cong trinh",
  "Khai thac lo thien",
  "Khai thac ham lo",
  "GIS mo",
  "Dia chat dau khi",
  "An toan mo",
  "Trac dia mo",
  "Dia chat dai cuong",
  "Surpac",
  "MineSight",
  "ArcGIS",
  "AutoCAD",
  "Petrel",
  "Petromod",
  "Dia chat thuy van",
  "Khoang vat hoc",
  "Co hoc dat da",
  "Thach hoc",
] as const;

export const COURSE_CODES = [
  "DCC101", "DCC201", "DCC301",
  "KTM101", "KTM201", "KTM301",
  "DKH101", "DKH201", "DKH301",
  "MTR101", "MTR201",
  "TDB101", "TDB201",
  "CNK101", "CNK201",
  "CDI101", "CDI201",
  "CTT101", "CTT201", "CTT301",
  "KTE101", "KTE201",
  "KCB101", "KCB201",
] as const;
