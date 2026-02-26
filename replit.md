# HUMG Share - Kho Tai Nguyen Hoc Tap

## Overview
HUMG Share is a community-driven resource sharing platform for students, lecturers and alumni of Hanoi University of Mining and Geology (HUMG). Inspired by FuOverflow.com, it combines document sharing with a full Q&A forum, badge/title system, point-based shop, and notifications.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)
- **File Upload**: Multer (local filesystem)
- **Routing**: wouter
- **State Management**: TanStack React Query v5

## Architecture
- `shared/schema.ts` - All Drizzle schemas, types, constants (faculties, categories, tags, course codes)
- `shared/models/auth.ts` - Auth-related schemas (users, sessions)
- `server/routes.ts` - All API endpoints (~50 routes)
- `server/storage.ts` - Database storage layer (DatabaseStorage) with ~40 methods
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data (12 documents, 8 badges, 6 shop items, 5 forum threads)
- `server/replit_integrations/auth/` - Replit Auth integration
- `client/src/pages/` - All page components (10 pages)
- `client/src/components/` - Shared components (layout, document-card, badge-display, theme-provider)
- `client/src/hooks/` - Custom hooks (use-auth, use-toast)

## Key Features
1. **Landing page** - For unauthenticated users with hero, features, stats
2. **Home page** - Dashboard with recent/popular docs, stats, forum threads, faculty/category links
3. **Browse** - Filter by faculty, category, sort order
4. **Search** - Full-text search with popular tags
5. **Upload** - File upload with metadata (faculty, category, tags, subject, year) + MIME type validation
6. **Document Detail** - View document info, download, rate (1-5 stars), comment, view count
7. **Forum/Q&A** - Discussion threads by faculty/course code, replies, best answer marking, pin/lock
8. **Profile** - User profile with uploads, downloads, points, badges, follows, title/rank
9. **Shop** - Point-based store for premium tools, courses, templates
10. **Admin** - Approve/reject documents, verify users, moderate forum, view stats
11. **Notifications** - Bell icon with real-time unread count, mark read
12. **Badges/Titles** - Achievement system (Coc Dong, Chuyen gia, etc.)
13. **Points System** - 10 points per approved document, spend in shop
14. **Follows** - Follow faculties and subjects
15. **Dark Mode** - Toggle via theme provider
16. **Responsive** - Mobile-first design

## API Routes

### Documents
- `GET /api/stats` - Site statistics
- `GET /api/documents` - Browse with filters (?faculty=&category=&sort=)
- `GET /api/documents/recent` - Recent approved documents
- `GET /api/documents/popular` - Popular documents by download count
- `GET /api/documents/search?q=` - Search documents
- `GET /api/documents/:id` - Get single document (increments view count)
- `POST /api/documents` - Upload document (multipart, validated)
- `POST /api/documents/:id/download` - Record download
- `GET /api/documents/:id/comments` - Get comments
- `POST /api/documents/:id/comments` - Add comment
- `POST /api/documents/:id/rate` - Rate document
- `GET /api/documents/:id/my-rating` - Get user's rating

### Forum
- `GET /api/forum/threads` - List threads (?faculty=&courseCode=&sort=)
- `GET /api/forum/threads/:id` - Get thread (increments view count)
- `POST /api/forum/threads` - Create thread
- `GET /api/forum/threads/:id/replies` - Get replies
- `POST /api/forum/threads/:id/replies` - Create reply
- `POST /api/forum/replies/:id/best-answer` - Mark best answer
- `GET /api/forum/search?q=` - Search forum

### Badges & Notifications
- `GET /api/badges` - All available badges
- `GET /api/badges/my` - Current user's badges
- `GET /api/notifications` - User notifications
- `GET /api/notifications/unread-count` - Unread count
- `POST /api/notifications/:id/read` - Mark read
- `POST /api/notifications/read-all` - Mark all read

### Follows
- `GET /api/follows` - User follows
- `POST /api/follows` - Follow a faculty/subject
- `DELETE /api/follows` - Unfollow

### Shop
- `GET /api/shop` - Shop items
- `POST /api/shop/purchase` - Purchase item with points
- `GET /api/shop/purchases` - User purchases

### Profile
- `GET /api/profile` - Get user profile
- `GET /api/profile/documents` - User's uploaded docs
- `GET /api/profile/downloads` - User's downloaded docs

### Admin (requires admin/moderator role)
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/pending` - Pending documents
- `GET /api/admin/all` - All documents
- `POST /api/admin/documents/:id/approve` - Approve document
- `POST /api/admin/documents/:id/reject` - Reject document
- `POST /api/admin/users/:id/verify` - Verify user
- `POST /api/admin/forum/threads/:id/pin` - Pin/unpin thread
- `POST /api/admin/forum/threads/:id/lock` - Lock/unlock thread

## Database Tables
- `users` - Auth users (Replit Auth)
- `sessions` - Auth sessions
- `user_profiles` - Extended profiles (display name, faculty, role, points, bio, verified)
- `documents` - Uploaded documents with metadata (includes viewCount)
- `comments` - Document comments
- `ratings` - Document ratings (1-5 stars)
- `downloads` - Download tracking
- `forum_threads` - Discussion threads (title, content, courseCode, faculty, pinned, locked)
- `forum_replies` - Thread replies (with best answer flag)
- `badges` - Badge definitions (name, icon, color, type, requirement)
- `user_badges` - Earned badges junction table
- `notifications` - User notifications
- `follows` - User follows (faculty/subject/thread)
- `shop_items` - Shop item definitions
- `shop_purchases` - Purchase records

## Theme
- Primary color: Green (142 hue) - representing mining/geology
- Clean, modern design with green accents on gray/white background
- Dark mode support

## Security
- Role-based authorization (admin/moderator) on all admin endpoints
- File type whitelist validation (PDF, Word, PowerPoint, ZIP, images, video)
- Required field validation on uploads
- Safe JSON parsing for tags
- Auth-protected file downloads
