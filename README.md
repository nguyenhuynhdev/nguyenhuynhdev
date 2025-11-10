# Nguyen Huynh Dev Portfolio

Next.js portfolio website với Cloudflare Pages và D1 Database.

## Development

### Setup Database (First Time)

```bash
# Tạo database (nếu chưa có)
npm run db:create

# Khởi tạo database local
npm run db:update
```

### Run Local Development

```bash
# Build và start dev server với D1 database
npm run dev:local
```

Server sẽ chạy tại `http://127.0.0.1:8788`

### Update Database Schema

```bash
# Update local database
npm run db:update

# Update remote database (sau khi deploy)
npm run db:deploy
```

## Deployment

### Deploy Pages & Functions

```bash
npm run deploy
```

### Deploy Database

```bash
npm run db:deploy
```

## Scripts

- `dev` - Next.js dev server (localhost:3000)
- `dev:local` - Build và start với Wrangler Pages dev (localhost:8788)
- `build` - Build Next.js app
- `deploy` - Deploy Pages và Functions lên Cloudflare
- `db:create` - Tạo D1 database mới
- `db:update` - Update local D1 database từ schema.sql
- `db:deploy` - Deploy database schema lên remote D1

## Tech Stack

- Next.js 15 (App Router)
- Cloudflare Pages
- Cloudflare D1 (SQLite)
- Cloudflare Functions (API endpoints)
- Cloudflare Images (Image hosting)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TipTap (Rich text editor)
- Recharts (Analytics charts)

## Features

### Blogs
- ✅ Full CRUD operations
- ✅ Rich text editor (TipTap)
- ✅ Tags and categories
- ✅ Gallery support
- ✅ Likes and views
- ✅ Comments (threaded)
- ✅ Publish workflow
- ✅ SEO optimization

### Works
- ✅ Full CRUD operations
- ✅ Timeline builder
- ✅ Gallery support
- ✅ Tags
- ✅ Likes and views
- ✅ Comments (threaded)
- ✅ Publish workflow

### Admin Dashboard
- ✅ Content management (Blogs, Works, Projects)
- ✅ Image manager (Cloudflare Images)
- ✅ Comment moderation
- ✅ Publish requests approval
- ✅ Analytics dashboard
- ✅ User management
- ✅ Settings

### Comments
- ✅ Threaded comments
- ✅ Guest comments (pending review)
- ✅ Moderation system
- ✅ Rate limiting
- ✅ Anti-spam filters

### Analytics
- ✅ Page views tracking
- ✅ Top pages
- ✅ Referrers
- ✅ Device types
- ✅ Export CSV

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare Images

Add to `wrangler.jsonc` or set as secrets:

```bash
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_API_TOKEN
```

### 3. Setup Database

```bash
# Create database (if needed)
npm run db:create

# Initialize database schema (includes all tables)
npm run db:update
```

### 4. Start Development

```bash
npm run dev:local
```

See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) for detailed implementation instructions.
