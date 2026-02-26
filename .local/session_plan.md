# Objective
Upgrade HUMG Share into a full community platform similar to FuOverflow.com. Add forum/Q&A system, badge/title system, notification system, enhanced search, "shop" for spending points, follow subjects/faculties, verified member system, and admin announcements. Improve UI to match FuOverflow-style community feel with sidebar, badges, and shop.

# Tasks

### T001: Database Schema - Add Forum, Badges, Notifications, Follows, Shop Tables
- **Blocked By**: []
- **Details**:
  - Add `forum_threads` table: id, title, content, courseCode, faculty, authorId, viewCount, replyCount, isPinned, isLocked, createdAt, updatedAt
  - Add `forum_replies` table: id, threadId, userId, content, isBestAnswer, createdAt
  - Add `badges` table: id, name, description, icon, type (e.g. "upload", "rating", "verified"), requirement (JSON), color
  - Add `user_badges` table: id, userId, badgeId, earnedAt
  - Add `notifications` table: id, userId, type, title, message, link, isRead, createdAt
  - Add `follows` table: id, userId, targetType (faculty/subject/thread), targetValue, createdAt
  - Add `shop_items` table: id, name, description, cost (points), type, isActive
  - Add `shop_purchases` table: id, userId, itemId, pointsSpent, purchasedAt
  - Add `verified` boolean field to user_profiles
  - Update all insert schemas and types
  - Run db:push to sync
  - Files: `shared/schema.ts`
  - Acceptance: All new tables created in DB, types exported

### T002: Storage Layer - Forum Methods
- **Blocked By**: [T001]
- **Details**:
  - Add IStorage methods for forum: createThread, getThread, getThreads (with filters), searchThreads, createReply, getReplies, markBestAnswer, incrementThreadViews
  - Implement in DatabaseStorage
  - Files: `server/storage.ts`
  - Acceptance: All forum CRUD operations working

### T003: Storage Layer - Badges, Notifications, Follows, Shop Methods
- **Blocked By**: [T001]
- **Details**:
  - Badges: getAllBadges, getUserBadges, awardBadge, checkAndAwardBadges (auto-award logic)
  - Notifications: createNotification, getUserNotifications, markNotificationRead, markAllRead, getUnreadCount
  - Follows: followTarget, unfollowTarget, getUserFollows, isFollowing
  - Shop: getShopItems, purchaseItem, getUserPurchases
  - Add verified status toggle to profile update
  - Implement all in DatabaseStorage
  - Files: `server/storage.ts`
  - Acceptance: All storage methods implemented and callable

### T004: API Routes - Forum Endpoints
- **Blocked By**: [T002]
- **Details**:
  - `GET /api/forum/threads` - List threads with filters (faculty, courseCode, sort)
  - `GET /api/forum/threads/:id` - Get single thread with replies
  - `POST /api/forum/threads` - Create thread (auth required)
  - `POST /api/forum/threads/:id/replies` - Reply to thread (auth required)
  - `POST /api/forum/replies/:id/best-answer` - Mark best answer (thread author only)
  - `GET /api/forum/search?q=` - Search forum
  - Files: `server/routes.ts`
  - Acceptance: All endpoints return correct data

### T005: API Routes - Badges, Notifications, Follows, Shop Endpoints
- **Blocked By**: [T003]
- **Details**:
  - `GET /api/badges` - All available badges
  - `GET /api/badges/my` - Current user's badges
  - `GET /api/notifications` - User notifications
  - `POST /api/notifications/read/:id` - Mark read
  - `POST /api/notifications/read-all` - Mark all read
  - `GET /api/notifications/unread-count` - Unread count
  - `GET /api/follows` - User follows
  - `POST /api/follows` - Follow a faculty/subject/thread
  - `DELETE /api/follows/:id` - Unfollow
  - `GET /api/shop` - Shop items
  - `POST /api/shop/purchase` - Purchase item
  - `GET /api/shop/purchases` - User purchases
  - Files: `server/routes.ts`
  - Acceptance: All endpoints functional

### T006: Frontend - Forum Page (Q&A / Discussion)
- **Blocked By**: [T004]
- **Details**:
  - Create `client/src/pages/forum.tsx` - Full forum page with:
    - Thread list with filters (faculty, course code, sort by: recent/most-viewed/unanswered)
    - Thread detail view with replies, best answer highlighting
    - Create thread form (title, content, course code, faculty)
    - Reply form with text area
    - Pin/lock indicators for admin threads
  - Add Forum nav item to layout
  - Register `/forum` and `/forum/:id` routes in App.tsx
  - Files: `client/src/pages/forum.tsx`, `client/src/components/layout.tsx`, `client/src/App.tsx`
  - Acceptance: Forum fully navigable, threads can be created and replied to

### T007: Frontend - Badges & Titles System UI
- **Blocked By**: [T005]
- **Details**:
  - Create badge display component showing earned badges with icons/colors
  - Add badges section to profile page
  - Show badges on user comments and forum replies
  - Add badge collection page or modal
  - Badge types: "Cóc Đồng" (quality uploader), "Thành viên tích cực" (active member), "Đã xác thực" (verified), "Chuyên gia" (expert), etc.
  - Files: `client/src/components/badge-display.tsx`, `client/src/pages/profile.tsx`
  - Acceptance: Badges displayed on profile and in comments

### T008: Frontend - Notification Bell & Panel
- **Blocked By**: [T005]
- **Details**:
  - Add notification bell icon to header with unread count badge
  - Dropdown panel showing recent notifications
  - Click notification to navigate to relevant page
  - Mark as read on click, mark all as read button
  - Files: `client/src/components/layout.tsx`
  - Acceptance: Notifications visible in header, clickable, count updates

### T009: Frontend - Shop Page
- **Blocked By**: [T005]
- **Details**:
  - Create `client/src/pages/shop.tsx` with:
    - Grid of shop items with point costs
    - User's current points displayed prominently
    - Purchase confirmation dialog
    - Purchase history tab
  - Add Shop nav item to layout
  - Register `/shop` route
  - Files: `client/src/pages/shop.tsx`, `client/src/components/layout.tsx`, `client/src/App.tsx`
  - Acceptance: Shop browsable, items purchasable with points

### T010: Frontend - Enhanced Search & Browse Filters
- **Blocked By**: [T004]
- **Details**:
  - Add "Xem nhieu" (most viewed), "De thi moi" (new exams), "Hoi dap lien quan" (related Q&A) filter tabs to browse
  - Add view count to documents display
  - Link related forum threads to document detail page
  - Improve search to include forum results alongside documents
  - Files: `client/src/pages/browse.tsx`, `client/src/pages/search.tsx`, `client/src/pages/document-detail.tsx`
  - Acceptance: New filter tabs work, cross-reference between docs and forum

### T011: Frontend - Enhanced Profile with Badges, Follows, Purchase History
- **Blocked By**: [T007, T009]
- **Details**:
  - Add badges collection tab to profile
  - Add followed subjects/faculties section
  - Add purchase history section
  - Show verified badge next to name
  - Show title/rank based on points
  - Files: `client/src/pages/profile.tsx`
  - Acceptance: Profile shows all new sections

### T012: Seed Data - Forum Threads, Badges, Shop Items
- **Blocked By**: [T001]
- **Details**:
  - Seed 5-8 predefined badges with names, descriptions, icons
  - Seed 5-8 shop items (premium doc access, AI quiz tools, course subscriptions)
  - Seed 3-5 sample forum threads across different faculties
  - Files: `server/seed.ts`
  - Acceptance: App launches with pre-populated content

### T013: Admin Enhancements - Announcements & Moderation
- **Blocked By**: [T004, T005]
- **Details**:
  - Add announcement creation (pinned forum threads) to admin page
  - Add user verification toggle in admin
  - Add forum moderation (pin/lock/delete threads)
  - Admin stats include forum activity
  - Files: `client/src/pages/admin.tsx`, `server/routes.ts`
  - Acceptance: Admin can create announcements, verify users, moderate forum
