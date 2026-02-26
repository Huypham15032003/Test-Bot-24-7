import {
  userProfiles, documents, comments, ratings, downloads,
  forumThreads, forumReplies, badges, userBadges, notifications, follows, shopItems, shopPurchases,
  type UserProfile, type InsertUserProfile,
  type Document, type InsertDocument,
  type Comment, type InsertComment,
  type Rating, type InsertRating,
  type Download,
  type ForumThread, type InsertForumThread,
  type ForumReply, type InsertForumReply,
  type Badge, type UserBadge,
  type Notification, type InsertNotification,
  type Follow, type InsertFollow,
  type ShopItem, type ShopPurchase, type InsertShopPurchase,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, desc, asc, ilike, or, and, sql, count } from "drizzle-orm";

export interface IStorage {
  getOrCreateProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile>;

  createDocument(data: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(filters: {
    faculty?: string;
    category?: string;
    sort?: string;
    status?: string;
  }): Promise<Document[]>;
  searchDocuments(query: string): Promise<Document[]>;
  getDocumentsByUploader(userId: string): Promise<Document[]>;
  getDownloadedDocuments(userId: string): Promise<Document[]>;
  approveDocument(id: string): Promise<Document>;
  rejectDocument(id: string, reason: string): Promise<Document>;
  incrementDownload(docId: string): Promise<void>;
  incrementDocumentViews(docId: string): Promise<void>;

  createComment(data: InsertComment): Promise<Comment>;
  getCommentsByDocument(documentId: string): Promise<(Comment & { userProfile?: UserProfile })[]>;

  createOrUpdateRating(data: InsertRating): Promise<Rating>;
  getUserRating(documentId: string, userId: string): Promise<Rating | undefined>;
  recalculateRating(documentId: string): Promise<void>;

  recordDownload(documentId: string, userId: string): Promise<void>;

  addPoints(userId: string, points: number): Promise<void>;

  getStats(): Promise<{ totalDocuments: number; totalDownloads: number; totalUsers: number }>;
  getAdminStats(): Promise<{ pending: number; approved: number; rejected: number; totalUsers: number; forumThreads: number }>;
  getPendingDocuments(): Promise<Document[]>;
  getAllDocumentsAdmin(): Promise<Document[]>;
  getRecentDocuments(): Promise<Document[]>;
  getPopularDocuments(): Promise<Document[]>;

  createForumThread(data: InsertForumThread): Promise<ForumThread>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  getForumThreads(filters: { faculty?: string; courseCode?: string; sort?: string }): Promise<ForumThread[]>;
  searchForumThreads(query: string): Promise<ForumThread[]>;
  createForumReply(data: InsertForumReply): Promise<ForumReply>;
  getForumReplies(threadId: string): Promise<(ForumReply & { userProfile?: UserProfile })[]>;
  markBestAnswer(replyId: string): Promise<ForumReply>;
  incrementThreadViews(threadId: string): Promise<void>;
  pinThread(threadId: string, isPinned: boolean): Promise<ForumThread>;
  lockThread(threadId: string, isLocked: boolean): Promise<ForumThread>;

  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  checkAndAwardBadges(userId: string): Promise<void>;

  createNotification(data: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  createFollow(data: InsertFollow): Promise<Follow>;
  removeFollow(userId: string, targetType: string, targetValue: string): Promise<void>;
  getUserFollows(userId: string): Promise<Follow[]>;
  isFollowing(userId: string, targetType: string, targetValue: string): Promise<boolean>;

  getShopItems(): Promise<ShopItem[]>;
  purchaseShopItem(userId: string, itemId: string): Promise<ShopPurchase>;
  getUserPurchases(userId: string): Promise<(ShopPurchase & { item: ShopItem })[]>;
}

export class DatabaseStorage implements IStorage {
  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (existing) return existing;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] : "User";
    
    const [profile] = await db.insert(userProfiles)
      .values({ userId, displayName })
      .onConflictDoNothing()
      .returning();
    
    if (profile) return profile;
    const [retried] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return retried;
  }

  async updateProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db.update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async getDocuments(filters: {
    faculty?: string;
    category?: string;
    sort?: string;
    status?: string;
  }): Promise<Document[]> {
    const conditions = [eq(documents.status, "approved")];
    if (filters.faculty) conditions.push(eq(documents.faculty, filters.faculty));
    if (filters.category) conditions.push(eq(documents.category, filters.category));

    let orderBy;
    switch (filters.sort) {
      case "popular": orderBy = desc(documents.downloadCount); break;
      case "rating": orderBy = desc(documents.averageRating); break;
      default: orderBy = desc(documents.createdAt);
    }

    return db.select().from(documents)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(50);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const searchTerm = `%${query}%`;
    return db.select().from(documents)
      .where(
        and(
          eq(documents.status, "approved"),
          or(
            ilike(documents.title, searchTerm),
            ilike(documents.description, searchTerm),
            ilike(documents.subject, searchTerm),
            ilike(documents.faculty, searchTerm),
          )
        )
      )
      .orderBy(desc(documents.createdAt))
      .limit(50);
  }

  async getDocumentsByUploader(userId: string): Promise<Document[]> {
    return db.select().from(documents)
      .where(eq(documents.uploaderId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async getDownloadedDocuments(userId: string): Promise<Document[]> {
    const downloadedDocs = await db
      .select({ documentId: downloads.documentId })
      .from(downloads)
      .where(eq(downloads.userId, userId))
      .orderBy(desc(downloads.downloadedAt));

    if (downloadedDocs.length === 0) return [];

    const docIds = downloadedDocs.map(d => d.documentId);
    const docs = await db.select().from(documents)
      .where(or(...docIds.map(id => eq(documents.id, id))));
    return docs;
  }

  async approveDocument(id: string): Promise<Document> {
    const [doc] = await db.update(documents)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    
    if (doc) {
      await this.addPoints(doc.uploaderId, 10);
    }
    return doc;
  }

  async rejectDocument(id: string, reason: string): Promise<Document> {
    const [doc] = await db.update(documents)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return doc;
  }

  async incrementDownload(docId: string): Promise<void> {
    await db.update(documents)
      .set({ downloadCount: sql`${documents.downloadCount} + 1` })
      .where(eq(documents.id, docId));
  }

  async incrementDocumentViews(docId: string): Promise<void> {
    await db.update(documents)
      .set({ viewCount: sql`${documents.viewCount} + 1` })
      .where(eq(documents.id, docId));
  }

  async createComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async getCommentsByDocument(documentId: string): Promise<(Comment & { userProfile?: UserProfile })[]> {
    const commentsList = await db.select().from(comments)
      .where(eq(comments.documentId, documentId))
      .orderBy(desc(comments.createdAt));

    const withProfiles = await Promise.all(
      commentsList.map(async (c) => {
        const [profile] = await db.select().from(userProfiles)
          .where(eq(userProfiles.userId, c.userId));
        return { ...c, userProfile: profile || undefined };
      })
    );
    return withProfiles;
  }

  async createOrUpdateRating(data: InsertRating): Promise<Rating> {
    const existing = await this.getUserRating(data.documentId, data.userId);
    if (existing) {
      const [updated] = await db.update(ratings)
        .set({ score: data.score })
        .where(eq(ratings.id, existing.id))
        .returning();
      return updated;
    }
    const [rating] = await db.insert(ratings).values(data).returning();
    return rating;
  }

  async getUserRating(documentId: string, userId: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings)
      .where(and(eq(ratings.documentId, documentId), eq(ratings.userId, userId)));
    return rating;
  }

  async recalculateRating(documentId: string): Promise<void> {
    const result = await db.select({
      avg: sql<number>`ROUND(AVG(${ratings.score}) * 10)`,
      count: count(),
    }).from(ratings).where(eq(ratings.documentId, documentId));

    const avg = result[0]?.avg || 0;
    const cnt = result[0]?.count || 0;

    await db.update(documents)
      .set({ averageRating: Number(avg), ratingCount: Number(cnt) })
      .where(eq(documents.id, documentId));
  }

  async recordDownload(documentId: string, userId: string): Promise<void> {
    await db.insert(downloads).values({ documentId, userId });
  }

  async addPoints(userId: string, points: number): Promise<void> {
    await db.update(userProfiles)
      .set({ points: sql`${userProfiles.points} + ${points}` })
      .where(eq(userProfiles.userId, userId));
  }

  async getStats(): Promise<{ totalDocuments: number; totalDownloads: number; totalUsers: number }> {
    const [docCount] = await db.select({ count: count() }).from(documents)
      .where(eq(documents.status, "approved"));
    const [dlCount] = await db.select({ total: sql<number>`COALESCE(SUM(${documents.downloadCount}), 0)` })
      .from(documents);
    const [userCount] = await db.select({ count: count() }).from(users);
    return {
      totalDocuments: Number(docCount?.count || 0),
      totalDownloads: Number(dlCount?.total || 0),
      totalUsers: Number(userCount?.count || 0),
    };
  }

  async getAdminStats(): Promise<{ pending: number; approved: number; rejected: number; totalUsers: number; forumThreads: number }> {
    const [pending] = await db.select({ count: count() }).from(documents).where(eq(documents.status, "pending"));
    const [approved] = await db.select({ count: count() }).from(documents).where(eq(documents.status, "approved"));
    const [rejected] = await db.select({ count: count() }).from(documents).where(eq(documents.status, "rejected"));
    const [userCount] = await db.select({ count: count() }).from(users);
    const [threadCount] = await db.select({ count: count() }).from(forumThreads);
    return {
      pending: Number(pending?.count || 0),
      approved: Number(approved?.count || 0),
      rejected: Number(rejected?.count || 0),
      totalUsers: Number(userCount?.count || 0),
      forumThreads: Number(threadCount?.count || 0),
    };
  }

  async getPendingDocuments(): Promise<Document[]> {
    return db.select().from(documents)
      .where(eq(documents.status, "pending"))
      .orderBy(asc(documents.createdAt));
  }

  async getAllDocumentsAdmin(): Promise<Document[]> {
    return db.select().from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(100);
  }

  async getRecentDocuments(): Promise<Document[]> {
    return db.select().from(documents)
      .where(eq(documents.status, "approved"))
      .orderBy(desc(documents.createdAt))
      .limit(10);
  }

  async getPopularDocuments(): Promise<Document[]> {
    return db.select().from(documents)
      .where(eq(documents.status, "approved"))
      .orderBy(desc(documents.downloadCount))
      .limit(10);
  }

  async createForumThread(data: InsertForumThread): Promise<ForumThread> {
    const [thread] = await db.insert(forumThreads).values(data).returning();
    return thread;
  }

  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    return thread;
  }

  async getForumThreads(filters: { faculty?: string; courseCode?: string; sort?: string }): Promise<ForumThread[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters.faculty) conditions.push(eq(forumThreads.faculty, filters.faculty));
    if (filters.courseCode) conditions.push(eq(forumThreads.courseCode, filters.courseCode));

    let orderBy;
    switch (filters.sort) {
      case "popular": orderBy = desc(forumThreads.viewCount); break;
      case "unanswered": {
        conditions.push(eq(forumThreads.replyCount, 0));
        orderBy = desc(forumThreads.createdAt);
        break;
      }
      default: orderBy = desc(forumThreads.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(forumThreads)
      .where(whereClause)
      .orderBy(desc(forumThreads.isPinned), orderBy)
      .limit(50);
  }

  async searchForumThreads(query: string): Promise<ForumThread[]> {
    const searchTerm = `%${query}%`;
    return db.select().from(forumThreads)
      .where(
        or(
          ilike(forumThreads.title, searchTerm),
          ilike(forumThreads.content, searchTerm),
        )
      )
      .orderBy(desc(forumThreads.createdAt))
      .limit(50);
  }

  async createForumReply(data: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(data).returning();
    await db.update(forumThreads)
      .set({
        replyCount: sql`${forumThreads.replyCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(forumThreads.id, data.threadId));
    return reply;
  }

  async getForumReplies(threadId: string): Promise<(ForumReply & { userProfile?: UserProfile })[]> {
    const repliesList = await db.select().from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(asc(forumReplies.createdAt));

    const withProfiles = await Promise.all(
      repliesList.map(async (r) => {
        const [profile] = await db.select().from(userProfiles)
          .where(eq(userProfiles.userId, r.userId));
        return { ...r, userProfile: profile || undefined };
      })
    );
    return withProfiles;
  }

  async markBestAnswer(replyId: string): Promise<ForumReply> {
    const [reply] = await db.update(forumReplies)
      .set({ isBestAnswer: true })
      .where(eq(forumReplies.id, replyId))
      .returning();
    return reply;
  }

  async incrementThreadViews(threadId: string): Promise<void> {
    await db.update(forumThreads)
      .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
      .where(eq(forumThreads.id, threadId));
  }

  async pinThread(threadId: string, isPinned: boolean): Promise<ForumThread> {
    const [thread] = await db.update(forumThreads)
      .set({ isPinned })
      .where(eq(forumThreads.id, threadId))
      .returning();
    return thread;
  }

  async lockThread(threadId: string, isLocked: boolean): Promise<ForumThread> {
    const [thread] = await db.update(forumThreads)
      .set({ isLocked })
      .where(eq(forumThreads.id, threadId))
      .returning();
    return thread;
  }

  async getAllBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadgesList = await db.select().from(userBadges)
      .where(eq(userBadges.userId, userId));

    const withBadges = await Promise.all(
      userBadgesList.map(async (ub) => {
        const [badge] = await db.select().from(badges)
          .where(eq(badges.id, ub.badgeId));
        return { ...ub, badge };
      })
    );
    return withBadges;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [existing] = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    if (existing) return existing;

    const [userBadge] = await db.insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return userBadge;
  }

  async checkAndAwardBadges(userId: string): Promise<void> {
    const allBadges = await this.getAllBadges();
    if (allBadges.length === 0) return;

    const [uploadCount] = await db.select({ count: count() }).from(documents)
      .where(and(eq(documents.uploaderId, userId), eq(documents.status, "approved")));
    const [ratingCount] = await db.select({ count: count() }).from(ratings)
      .where(eq(ratings.userId, userId));
    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    const userUploadCount = Number(uploadCount?.count || 0);
    const userRatingCount = Number(ratingCount?.count || 0);
    const userPoints = profile?.points || 0;

    for (const badge of allBadges) {
      let eligible = false;
      switch (badge.type) {
        case "upload":
          eligible = userUploadCount >= (badge.requirement || 0);
          break;
        case "rating":
          eligible = userRatingCount >= (badge.requirement || 0);
          break;
        case "points":
          eligible = userPoints >= (badge.requirement || 0);
          break;
        default:
          break;
      }
      if (eligible) {
        await this.awardBadge(userId, badge.id);
      }
    }
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result?.count || 0);
  }

  async createFollow(data: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(data).returning();
    return follow;
  }

  async removeFollow(userId: string, targetType: string, targetValue: string): Promise<void> {
    await db.delete(follows)
      .where(and(
        eq(follows.userId, userId),
        eq(follows.targetType, targetType),
        eq(follows.targetValue, targetValue),
      ));
  }

  async getUserFollows(userId: string): Promise<Follow[]> {
    return db.select().from(follows)
      .where(eq(follows.userId, userId));
  }

  async isFollowing(userId: string, targetType: string, targetValue: string): Promise<boolean> {
    const [result] = await db.select().from(follows)
      .where(and(
        eq(follows.userId, userId),
        eq(follows.targetType, targetType),
        eq(follows.targetValue, targetValue),
      ));
    return !!result;
  }

  async getShopItems(): Promise<ShopItem[]> {
    return db.select().from(shopItems)
      .where(eq(shopItems.isActive, true));
  }

  async purchaseShopItem(userId: string, itemId: string): Promise<ShopPurchase> {
    const [item] = await db.select().from(shopItems)
      .where(eq(shopItems.id, itemId));
    if (!item) throw new Error("Item not found");

    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    if (!profile || (profile.points || 0) < item.cost) {
      throw new Error("Not enough points");
    }

    await db.update(userProfiles)
      .set({ points: sql`${userProfiles.points} - ${item.cost}` })
      .where(eq(userProfiles.userId, userId));

    const [purchase] = await db.insert(shopPurchases)
      .values({ userId, itemId, pointsSpent: item.cost })
      .returning();
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<(ShopPurchase & { item: ShopItem })[]> {
    const purchasesList = await db.select().from(shopPurchases)
      .where(eq(shopPurchases.userId, userId))
      .orderBy(desc(shopPurchases.purchasedAt));

    const withItems = await Promise.all(
      purchasesList.map(async (p) => {
        const [item] = await db.select().from(shopItems)
          .where(eq(shopItems.id, p.itemId));
        return { ...p, item };
      })
    );
    return withItems;
  }
}

export const storage = new DatabaseStorage();
