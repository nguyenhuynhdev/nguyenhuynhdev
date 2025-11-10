# Implementation Guide - Blogs, Works, and Admin Dashboard

## 📋 Overview

This guide outlines the implementation of the extended features for the portfolio website:
- Complete Blogging System
- Works/Portfolio with Timeline
- Admin Dashboard
- Comment System
- Analytics
- Image Management (Cloudflare Images)

## 🗄️ Database Setup

### 1. Run Schema

```bash
# Local development
npm run db:update

# Production
npm run db:deploy
```

This will create all tables including:
- `works` table
- `timeline_items`, `timeline_tasks`, `timeline_tech`, `timeline_media` tables
- `comments` table (threaded)
- `blog_likes`, `work_likes` tables
- `publish_requests` table
- `analytics_events` table
- `blog_gallery`, `work_gallery` tables
- Extended `media` table with Cloudflare Images support

## 🔌 API Endpoints

### Works API
- `GET /api/v1/works` - List works (with filters, search, pagination)
- `GET /api/v1/works/[id]` - Get single work
- `POST /api/v1/works` - Create work
- `PUT /api/v1/works/[id]` - Update work
- `DELETE /api/v1/works/[id]` - Delete work
- `GET /api/v1/works/[id]/timeline` - Get timeline items
- `POST /api/v1/works/[id]/timeline` - Create timeline item
- `PUT /api/v1/works/[id]/timeline/[itemId]` - Update timeline item
- `DELETE /api/v1/works/[id]/timeline/[itemId]` - Delete timeline item

### Comments API
- `GET /api/v1/comments` - List comments (threaded)
- `POST /api/v1/comments` - Create comment
- `PUT /api/v1/comments/[id]` - Moderate comment
- `DELETE /api/v1/comments/[id]` - Delete comment

### Analytics API
- `GET /api/v1/analytics?type=summary` - Get analytics summary
- `GET /api/v1/analytics?type=page_views` - Get page views
- `GET /api/v1/analytics?type=top_pages` - Get top pages
- `POST /api/v1/analytics` - Track event

### Images API
- `GET /api/v1/images` - List images
- `POST /api/v1/images` - Upload image (Cloudflare Images)
- `GET /api/v1/images/[id]` - Get image details
- `PUT /api/v1/images/[id]` - Update image metadata
- `DELETE /api/v1/images/[id]` - Delete image

### Publish Requests API
- `GET /api/v1/publish-requests` - List publish requests
- `PUT /api/v1/publish-requests/[id]` - Approve/reject request

## 🎨 Frontend Components to Create

### 1. Rich Text Editor (TipTap)

Create `src/components/editor/rich-text-editor.tsx`:

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

export function RichTextEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Toolbar components here...

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 2. Timeline Builder

Create `src/components/dashboard/timeline-builder.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TimelineItem {
  id?: number;
  date_range_start: string;
  date_range_end: string;
  title: string;
  description: string;
  tasks: string[];
  tech: string[];
  media: number[];
  display_order: number;
}

export function TimelineBuilder({ 
  workId, 
  items, 
  onSave 
}: { 
  workId: number; 
  items: TimelineItem[]; 
  onSave: (items: TimelineItem[]) => void 
}) {
  // Timeline builder implementation
  // - Drag and drop reordering
  // - Add/Edit/Delete timeline items
  // - Manage tasks, tech stack, media for each item
}
```

### 3. Image Upload Component

Create `src/components/dashboard/image-upload.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api-client';

export function ImageUpload({ onUploaded }: { onUploaded: (image: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploaded(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center">
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : (
        <p>Drag & drop an image here, or click to select</p>
      )}
    </div>
  );
}
```

### 4. Comment System

Create `src/components/comments/comment-list.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  replies: Comment[];
}

export function CommentList({ 
  contentType, 
  contentId 
}: { 
  contentType: 'blog' | 'work' | 'project'; 
  contentId: number 
}) {
  // Fetch and display threaded comments
  // - Display comments in nested structure
  // - Reply functionality
  // - Like/dislike buttons
  // - Moderation controls (for admins)
}
```

### 5. Analytics Dashboard

Create `src/components/dashboard/analytics-chart.tsx`:

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { apiClient } from '@/lib/api-client';

export function AnalyticsChart() {
  // Fetch analytics data
  // Display charts using recharts
  // - Page views over time
  // - Top pages
  // - Referrers
  // - Device types
}
```

## 📄 Pages to Create

### Frontend Pages

1. **Blog List Page** (`src/app/[locale]/blog/page.tsx`)
   - Filter by tags, date, author
   - Search functionality
   - Pagination
   - Sort options

2. **Blog Detail Page** (`src/app/[locale]/blog/[slug]/page.tsx`)
   - Full blog content
   - Author info
   - Tags
   - Related posts
   - Comments
   - Share buttons
   - Like/dislike

3. **Works List Page** (`src/app/[locale]/works/page.tsx`)
   - Filter by tags
   - Search
   - Grid/List view

4. **Work Detail Page** (`src/app/[locale]/works/[slug]/page.tsx`)
   - Full content
   - Timeline display
   - Gallery
   - Comments
   - Share buttons

### Dashboard Pages

1. **Dashboard Home** (`src/app/dashboard/page.tsx`)
   - Summary cards
   - Recent activity
   - Pending requests
   - Quick stats

2. **Blog Management** (`src/app/dashboard/blogs/page.tsx`)
   - List blogs
   - Create/Edit/Delete
   - Publish/Approve
   - Rich text editor

3. **Works Management** (`src/app/dashboard/works/page.tsx`)
   - List works
   - Create/Edit/Delete
   - Timeline builder
   - Gallery management

4. **Image Manager** (`src/app/dashboard/media/page.tsx`)
   - Grid view
   - Upload images
   - Delete images
   - Search/Filter
   - Usage tracking

5. **Analytics** (`src/app/dashboard/analytics/page.tsx`)
   - Charts and graphs
   - Page views
   - Top pages
   - Export CSV

6. **Comments Moderation** (`src/app/dashboard/comments/page.tsx`)
   - List all comments
   - Approve/Reject/Spam
   - Thread view

7. **Publish Requests** (`src/app/dashboard/requests/page.tsx`)
   - List pending requests
   - Approve/Reject
   - Admin notes

8. **Settings** (`src/app/dashboard/settings/page.tsx`)
   - Site settings
   - SEO defaults
   - Image upload rules
   - Social links

## 🔧 Configuration

### Cloudflare Images

Add to `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
    "CLOUDFLARE_API_TOKEN": "your-api-token"
  }
}
```

Or set as secrets:

```bash
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_API_TOKEN
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=/api/v1
JWT_SECRET=your-secret-key
```

## 🚀 Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Database Migration**
   ```bash
   npm run db:extend
   ```

3. **Start Development**
   ```bash
   npm run dev:local
   ```

4. **Implement Components**
   - Create rich text editor
   - Create timeline builder
   - Create image upload
   - Create comment system
   - Create analytics charts

5. **Create Pages**
   - Blog list/detail pages
   - Works list/detail pages
   - Dashboard pages
   - Settings page

6. **Test Features**
   - Test blog CRUD
   - Test works CRUD with timeline
   - Test comments
   - Test image upload
   - Test analytics tracking

7. **Deploy**
   ```bash
   npm run deploy
   npm run db:deploy:extend
   ```

## 📚 Resources

- [TipTap Documentation](https://tiptap.dev/)
- [Cloudflare Images API](https://developers.cloudflare.com/images/)
- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🐛 Troubleshooting

### Database Errors
- Make sure to run `npm run db:extend` before starting dev server
- Check database connection in `wrangler.jsonc`

### Cloudflare Images Errors
- Verify account ID and API token
- Check CORS settings
- Verify image upload limits

### API Errors
- Check authentication tokens
- Verify user roles
- Check request payloads

## ✅ Checklist

- [x] Database schema extended
- [x] Works API endpoints created
- [x] Comments API endpoints created
- [x] Analytics API endpoints created
- [x] Images API endpoints created
- [x] Publish requests API created
- [ ] Rich text editor component
- [ ] Timeline builder component
- [ ] Image upload component
- [ ] Comment system component
- [ ] Analytics charts component
- [ ] Blog frontend pages
- [ ] Works frontend pages
- [ ] Dashboard pages
- [ ] Settings page
- [ ] Cloudflare Images integration
- [ ] Testing
- [ ] Deployment

