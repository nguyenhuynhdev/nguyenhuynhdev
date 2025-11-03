# Dashboard Application

A full-featured dashboard application built with Next.js, Cloudflare Pages Functions, and D1 Database.

## Features

### Authentication
- ✅ Email + Password login
- ✅ "Stay logged in" checkbox (persistent session via cookie)
- ✅ "Forgot password?" flow (fake API for now)
- ✅ JWT/Bearer token authentication
- ✅ Passwords encrypted using bcrypt

### Role-Based Access Control (RBAC)
- **Admin**: FULL CRUD (Users, Blogs, Projects, Media, Settings)
- **Editor**: CRUD (Blogs, Projects, Media)
- **Viewer**: Read only
- RBAC enforced via middleware in both UI + API layers

### Dashboard Pages
- ✅ Overview (stats, quick actions)
- ✅ Projects/Works CRUD
- ✅ Blog CRUD with Markdown/Editor support
- ✅ Media Manager
- ✅ Users Management (Admin only)
- ✅ Settings (General, Account, Security)
- ✅ Notifications (read/unread)
- ✅ Analytics page (placeholder with fake data)

### Dashboard UI Features
- ✅ Sidebar navigation with icons
- ✅ Breadcrumbs
- ✅ Table sorting & filtering
- ✅ Modal confirmations for delete actions
- ✅ Toast notifications
- ✅ Pagination for large lists
- ✅ Fully responsive design
- ✅ Dark/Light mode toggle (stored in localStorage)

### Blog Features
- ✅ Title, Slug
- ✅ SEO Meta Title, Meta Description
- ✅ Cover Image
- ✅ Excerpt
- ✅ Rich Content Editor (Markdown with preview)
- ✅ Category (one)
- ✅ Tags (multiple)
- ✅ Author (linked to Users table)
- ✅ Reading Time (auto-calculated)
- ✅ View Count (increment from frontend)
- ✅ Publish Status: draft | scheduled | published | archived
- ✅ Publish Date / Modify Date
- ✅ Featured Article flag
- ✅ Article history logs

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Static Export
- **UI**: shadcn/ui with Tailwind CSS
- **API**: Cloudflare Pages Functions (RESTful API)
- **Database**: Cloudflare D1 Database (SQLite)
- **Auth**: JWT tokens stored in localStorage
- **Markdown**: react-markdown with remark-gfm

## Setup

### 1. Environment Variables

Create a `.dev.vars` file in the root directory:

```env
JWT_SECRET=your-secret-key-change-in-production
```

Make sure `.dev.vars` is in `.gitignore` (already added).

### 2. Database Setup

The D1 database schema is already defined. Make sure your database is connected via `wrangler.jsonc`.

### 3. Create Admin User

To create an admin user, you'll need to hash a password first:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

Then insert into the database:

```sql
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@example.com', '<hashed-password>', 'Admin User', 'admin');
```

## API Routes

All API routes are under `/api/v1/`:

- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Forgot password (fake)
- `GET /api/v1/users` - List users (Admin only)
- `GET /api/v1/blogs` - List blogs
- `POST /api/v1/blogs` - Create blog (Admin/Editor)
- `PUT /api/v1/blogs/[id]` - Update blog
- `DELETE /api/v1/blogs/[id]` - Delete blog
- `GET /api/v1/projects` - List projects
- `GET /api/v1/media` - List media
- `GET /api/v1/categories` - List categories
- `GET /api/v1/tags` - List tags
- `GET /api/v1/settings` - Get settings
- `PUT /api/v1/settings` - Update settings (Admin only)
- `GET /api/v1/notifications` - Get notifications

All routes support:
- JWT authentication via `Authorization: Bearer <token>` header
- Pagination via `?page=1&limit=20` query params
- Mock data fallback when database is empty

## Routing

Dashboard routes are under `[locale]/dashboard/`:
- `/vi/dashboard` or `/en/dashboard` - Overview
- `/vi/dashboard/blogs` - Blog list
- `/vi/dashboard/blogs/new` - New blog
- `/vi/dashboard/blogs/[id]/edit` - Edit blog
- `/vi/dashboard/projects` - Projects
- `/vi/dashboard/media` - Media library
- `/vi/dashboard/users` - Users (Admin only)
- `/vi/dashboard/settings` - Settings (Admin only)
- `/vi/dashboard/notifications` - Notifications
- `/vi/dashboard/analytics` - Analytics
- `/vi/dashboard/login` - Login
- `/vi/dashboard/forgot-password` - Forgot password

## Security

- ✅ JWT/Bearer token authentication
- ✅ Passwords encrypted using bcrypt
- ✅ XSS protection (React auto-escaping)
- ✅ CSRF protection (SameSite cookies)
- ✅ Role-based access control
- ✅ Login logs tracking

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run build
npm run deploy
```

The build will create a static export compatible with Cloudflare Pages.

## Notes

- All dashboard pages are fully responsive
- Mock data is used as fallback when database has no records
- Theme preference is stored in localStorage
- Authentication token is stored in localStorage (with cookie option for "stay logged in")

