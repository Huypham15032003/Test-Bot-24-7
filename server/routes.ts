import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, express.static(uploadDir));

  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (profile.role !== "admin" && profile.role !== "moderator") {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  };

  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/documents/recent", async (_req, res) => {
    try {
      const docs = await storage.getRecentDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.get("/api/documents/popular", async (_req, res) => {
    try {
      const docs = await storage.getPopularDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.get("/api/documents/search", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q || q.length < 2) return res.json([]);
      const docs = await storage.searchDocuments(q);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const filters = {
        faculty: req.query.faculty as string | undefined,
        category: req.query.category as string | undefined,
        sort: req.query.sort as string | undefined,
      };
      const docs = await storage.getDocuments(filters);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const doc = await storage.getDocument(req.params.id as string);
      if (!doc) return res.status(404).json({ message: "Not found" });

      await storage.incrementDocumentViews(req.params.id as string);

      let uploaderProfile;
      try {
        uploaderProfile = await storage.getOrCreateProfile(doc.uploaderId);
      } catch {}
      res.json({ ...doc, uploaderProfile });
    } catch (error) {
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  app.post("/api/documents", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.getOrCreateProfile(userId);

      if (!req.body.title || !req.body.faculty || !req.body.category) {
        return res.status(400).json({ message: "Thieu thong tin bat buoc (title, faculty, category)" });
      }

      if (req.file && !ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Dinh dang file khong duoc ho tro" });
      }

      let tags: string[] = [];
      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      } catch {
        tags = [];
      }

      const doc = await storage.createDocument({
        title: req.body.title,
        description: req.body.description || null,
        faculty: req.body.faculty,
        subject: req.body.subject || null,
        category: req.body.category,
        tags,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
        fileName: req.file?.originalname || null,
        fileSize: req.file?.size || null,
        fileType: req.file?.mimetype || null,
        uploaderId: userId,
        status: "pending",
        year: req.body.year || null,
      });
      res.json(doc);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post("/api/documents/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doc = await storage.getDocument(req.params.id as string);
      if (!doc) return res.status(404).json({ message: "Not found" });

      await storage.recordDownload(doc.id, userId);
      await storage.incrementDownload(doc.id);

      res.json({ fileUrl: doc.fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  app.get("/api/documents/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByDocument(req.params.id as string);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/documents/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.getOrCreateProfile(userId);
      const comment = await storage.createComment({
        documentId: req.params.id,
        userId,
        content: req.body.content,
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/documents/:id/rate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const score = parseInt(req.body.score);
      if (score < 1 || score > 5) return res.status(400).json({ message: "Invalid score" });

      await storage.createOrUpdateRating({
        documentId: req.params.id,
        userId,
        score,
      });
      await storage.recalculateRating(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Rating failed" });
    }
  });

  app.get("/api/documents/:id/my-rating", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rating = await storage.getUserRating(req.params.id, userId);
      res.json(rating || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rating" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getOrCreateProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.get("/api/profile/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docs = await storage.getDocumentsByUploader(userId);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.get("/api/profile/downloads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docs = await storage.getDownloadedDocuments(userId);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get downloads" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/pending", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const docs = await storage.getPendingDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending docs" });
    }
  });

  app.get("/api/admin/all", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const docs = await storage.getAllDocumentsAdmin();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get docs" });
    }
  });

  app.post("/api/admin/documents/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const doc = await storage.approveDocument(req.params.id as string);
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Approve failed" });
    }
  });

  app.post("/api/admin/documents/:id/reject", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const doc = await storage.rejectDocument(req.params.id as string, req.body.reason || "");
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Reject failed" });
    }
  });

  app.post("/api/admin/users/:id/verify", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const profile = await storage.updateProfile(req.params.id as string, { verified: true });
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Verify failed" });
    }
  });

  app.get("/api/forum/threads", async (req, res) => {
    try {
      const filters = {
        faculty: req.query.faculty as string | undefined,
        courseCode: req.query.courseCode as string | undefined,
        sort: req.query.sort as string | undefined,
      };
      const threads = await storage.getForumThreads(filters);
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: "Failed to get threads" });
    }
  });

  app.get("/api/forum/threads/:id", async (req, res) => {
    try {
      const thread = await storage.getForumThread(req.params.id as string);
      if (!thread) return res.status(404).json({ message: "Not found" });

      await storage.incrementThreadViews(req.params.id as string);

      let authorProfile;
      try {
        authorProfile = await storage.getOrCreateProfile(thread.authorId);
      } catch {}
      res.json({ ...thread, authorProfile });
    } catch (error) {
      res.status(500).json({ message: "Failed to get thread" });
    }
  });

  app.post("/api/forum/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.getOrCreateProfile(userId);

      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ message: "Title and content are required" });
      }

      const thread = await storage.createForumThread({
        title: req.body.title,
        content: req.body.content,
        courseCode: req.body.courseCode || null,
        faculty: req.body.faculty || null,
        authorId: userId,
      });
      res.json(thread);
    } catch (error) {
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  app.get("/api/forum/threads/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.id as string);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Failed to get replies" });
    }
  });

  app.post("/api/forum/threads/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.getOrCreateProfile(userId);

      if (!req.body.content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const reply = await storage.createForumReply({
        threadId: req.params.id,
        userId,
        content: req.body.content,
      });
      res.json(reply);
    } catch (error) {
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  app.post("/api/forum/replies/:id/best-answer", isAuthenticated, async (req: any, res) => {
    try {
      const reply = await storage.markBestAnswer(req.params.id as string);
      res.json(reply);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark best answer" });
    }
  });

  app.get("/api/forum/search", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q || q.length < 2) return res.json([]);
      const threads = await storage.searchForumThreads(q);
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.post("/api/admin/forum/threads/:id/pin", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const thread = await storage.pinThread(req.params.id as string, req.body.isPinned !== false);
      res.json(thread);
    } catch (error) {
      res.status(500).json({ message: "Pin failed" });
    }
  });

  app.post("/api/admin/forum/threads/:id/lock", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const thread = await storage.lockThread(req.params.id as string, req.body.isLocked !== false);
      res.json(thread);
    } catch (error) {
      res.status(500).json({ message: "Lock failed" });
    }
  });

  app.get("/api/badges", async (_req, res) => {
    try {
      const allBadges = await storage.getAllBadges();
      res.json(allBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get badges" });
    }
  });

  app.get("/api/badges/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get badges" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifs = await storage.getUserNotifications(userId);
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get count" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all read" });
    }
  });

  app.get("/api/follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userFollows = await storage.getUserFollows(userId);
      res.json(userFollows);
    } catch (error) {
      res.status(500).json({ message: "Failed to get follows" });
    }
  });

  app.post("/api/follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const follow = await storage.createFollow({
        userId,
        targetType: req.body.targetType,
        targetValue: req.body.targetValue,
      });
      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow" });
    }
  });

  app.delete("/api/follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFollow(userId, req.body.targetType, req.body.targetValue);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow" });
    }
  });

  app.get("/api/shop", async (_req, res) => {
    try {
      const items = await storage.getShopItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get shop items" });
    }
  });

  app.post("/api/shop/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchase = await storage.purchaseShopItem(userId, req.body.itemId);
      res.json(purchase);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Purchase failed" });
    }
  });

  app.get("/api/shop/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get purchases" });
    }
  });

  return httpServer;
}
