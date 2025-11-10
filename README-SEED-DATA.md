# Seed Data Guide

This guide explains how to populate your database with sample data for development and testing.

## Quick Start

```bash
# Initialize database schema
npm run db:update

# Seed database with sample data
npm run db:seed

# For production (remote database)
npm run db:deploy:seed
```

## What Gets Seeded

The seed script (`scripts/seed-data.sql`) creates:

### 1. Categories (6 categories)
- Technology
- Web Development
- Mobile Development
- Design
- Business
- Tutorials

### 2. Tags (48 tags)
Common development tags including:
- Frontend: React, Next.js, Vue.js, Angular, Tailwind CSS
- Backend: Node.js, Python, PHP, Laravel
- Databases: MongoDB, PostgreSQL, MySQL, SQL
- DevOps: Docker, Kubernetes, AWS, Cloudflare
- Mobile: React Native, Flutter, iOS, Android
- Tools: Git, GitHub, Figma, Photoshop
- And more...

### 3. Sample Blogs (3 blog posts)
- "Getting Started with Next.js 15"
- "Mastering TypeScript for React Developers"
- "Building Scalable APIs with Node.js"

Each blog includes:
- Full content with markdown
- Associated tags
- Category assignment
- Published status
- Cover images

### 4. Sample Works (3 portfolio works)
- "E-Commerce Platform"
- "Portfolio Website"
- "Task Management App"

Each work includes:
- Full content
- Associated tags
- Timeline items (for E-Commerce Platform)
- Tasks, tech stack, and media for timeline items
- Published status

### 5. Sample Projects (3 projects)
- "Open Source Library"
- "Design System"
- "Mobile App"

Each project includes:
- Description and content
- Tags (stored as JSON)
- Featured status
- Published status

### 6. Sample Media (3 images)
- Placeholder images for blogs
- Note: In production, these would be actual Cloudflare Images URLs

## Database Structure

The seed data demonstrates:
- **Many-to-many relationships**: Blogs ↔ Tags, Works ↔ Tags
- **One-to-many relationships**: Categories → Blogs, Users → Blogs/Works
- **JSON storage**: Projects store tags as JSON array
- **Timeline relationships**: Works → Timeline Items → Tasks/Tech/Media

## Using Seed Data

After seeding:

1. **Login to Dashboard**
   - Email: `admin@example.com`
   - Password: `password123`

2. **View Content**
   - Blogs: `/dashboard/blogs`
   - Works: `/dashboard/works`
   - Projects: `/dashboard/projects`
   - Tags: `/dashboard/tags`

3. **Manage Tags**
   - View all tags with usage counts
   - Create, edit, delete tags
   - See which blogs/works/projects use each tag

## Customizing Seed Data

To customize the seed data:

1. Edit `scripts/seed-data.sql`
2. Modify the INSERT statements
3. Run `npm run db:seed` again (or `npm run db:update` to reset)

## Notes

- The seed script uses `INSERT OR IGNORE` to prevent duplicates
- All dates are relative to the current time (using `datetime('now')`)
- Images use Unsplash placeholder URLs - replace with actual Cloudflare Images in production
- The admin user is created in `schema.sql`, not in the seed script

## Troubleshooting

If seed data doesn't appear:

1. **Check database connection**
   ```bash
   npm run db:update
   ```

2. **Verify seed script ran**
   ```bash
   wrangler d1 execute database --local --command "SELECT COUNT(*) FROM tags;"
   ```

3. **Check for errors**
   - Look for SQL syntax errors in the seed script
   - Verify all table names match the schema

4. **Reset and reseed**
   ```bash
   # Clear and reset (WARNING: This deletes all data)
   npm run db:update
   npm run db:seed
   ```

## Production Deployment

For production:

```bash
# Deploy schema
npm run db:deploy

# Deploy seed data (optional - usually skip for production)
npm run db:deploy:seed
```

**Note**: In production, you typically want to seed data manually or through an admin interface, not via scripts.


