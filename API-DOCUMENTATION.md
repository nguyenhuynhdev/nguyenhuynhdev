# API Documentation

All API endpoints are located in `functions/api/v1/` and are deployed as Cloudflare Pages Functions.

Base URL: `/api/v1`

## 📋 Users API

### GET /api/v1/users
List all users with pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "viewer",
      "avatar_url": null,
      "is_active": 1,
      "last_login_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

### GET /api/v1/users/[id]
Get a single user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "viewer",
    "avatar_url": null,
    "is_active": 1,
    "last_login_at": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/v1/users
Create a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password_hash": "$2a$10$...",
  "name": "New User",
  "role": "viewer"
}
```

### PUT /api/v1/users/[id]
Update a user.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "role": "editor",
  "avatar_url": "https://...",
  "is_active": 1,
  "password_hash": "$2a$10$..."
}
```

### DELETE /api/v1/users/[id]
Delete a user.

---

## 📝 Projects API

### GET /api/v1/projects
List all projects with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Project Title",
      "slug": "project-slug",
      "description": "...",
      "content": "...",
      "cover_image": null,
      "featured": 0,
      "status": "published",
      "tags": ["tag1", "tag2"],
      "created_by": 1,
      "created_by_name": "User Name",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /api/v1/projects/[id]
Get a single project by ID.

### POST /api/v1/projects
Create a new project.

**Request Body:**
```json
{
  "title": "Project Title",
  "slug": "project-slug",
  "description": "Description",
  "content": "Content",
  "cover_image": "https://...",
  "featured": false,
  "status": "draft",
  "tags": ["tag1", "tag2"],
  "created_by": 1
}
```

### PUT /api/v1/projects/[id]
Update a project.

### DELETE /api/v1/projects/[id]
Delete a project.

---

## 📰 Blogs API

### GET /api/v1/blogs
List all blogs with pagination and sorting.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sortBy` (string) - `publish_date` (default), `view_count`, `status`
- `status` (string) - Filter by status: `draft`, `scheduled`, `published`, `archived`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Blog Title",
      "slug": "blog-slug",
      "excerpt": "...",
      "content": "...",
      "cover_image": null,
      "meta_title": "...",
      "meta_description": "...",
      "category_id": 1,
      "category_name": "Category",
      "featured": 0,
      "status": "published",
      "author_id": 1,
      "author_name": "Author Name",
      "reading_time": 5,
      "view_count": 0,
      "publish_date": "2024-01-01T00:00:00Z",
      "tags": [
        {"id": 1, "name": "Tag", "slug": "tag-slug"}
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /api/v1/blogs/[id]
Get a single blog by ID (includes tags and category).

### GET /api/v1/blogs/slug/[slug]
Get a blog by slug.

### POST /api/v1/blogs
Create a new blog post.

**Request Body:**
```json
{
  "title": "Blog Title",
  "slug": "blog-slug",
  "excerpt": "Short excerpt",
  "content": "Full markdown content...",
  "cover_image": "https://...",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "category_id": 1,
  "tags": [1, 2, 3],
  "status": "draft",
  "featured": false,
  "publish_date": "2024-01-01T00:00:00Z",
  "author_id": 1
}
```

**Note:** Reading time is automatically calculated based on content length (~200 words per minute).

### PUT /api/v1/blogs/[id]
Update a blog post.

### DELETE /api/v1/blogs/[id]
Delete a blog post.

### POST /api/v1/blogs/[id]/view
Increment the view count for a blog post.

---

## 🏷️ Categories API

### GET /api/v1/categories
List all categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Description"
}
```

---

## 🏷️ Tags API

### GET /api/v1/tags
List all tags.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "React",
      "slug": "react",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/tags
Create a new tag.

**Request Body:**
```json
{
  "name": "Tag Name",
  "slug": "tag-slug"
}
```

---

## 📁 Media API

### GET /api/v1/media
List all media files with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "image.jpg",
      "original_filename": "My Image.jpg",
      "file_type": "image/jpeg",
      "file_size": 12345,
      "url": "https://...",
      "uploaded_by": 1,
      "uploaded_by_name": "User Name",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /api/v1/media
Create a media entry.

**Request Body:**
```json
{
  "filename": "image.jpg",
  "original_filename": "My Image.jpg",
  "file_type": "image/jpeg",
  "file_size": 12345,
  "url": "https://cdn.example.com/image.jpg",
  "uploaded_by": 1
}
```

### DELETE /api/v1/media/[id]
Delete a media entry.

---

## ⚙️ Settings API

### GET /api/v1/settings
Get all settings as a key-value object.

**Response:**
```json
{
  "success": true,
  "data": {
    "site_name": "My Site",
    "site_description": "Description",
    "site_url": "https://example.com",
    "social_twitter": "https://twitter.com/...",
    "social_facebook": "https://facebook.com/...",
    "social_linkedin": "https://linkedin.com/...",
    "social_github": "https://github.com/..."
  }
}
```

### PUT /api/v1/settings
Update settings.

**Request Body:**
```json
{
  "site_name": "Updated Site Name",
  "site_url": "https://newsite.com"
}
```

**Note:** Settings support different types (string, number, boolean, json) which are automatically handled.

---

## 🔔 Notifications API

### GET /api/v1/notifications
Get notifications.

**Query Parameters:**
- `user_id` (number) - Filter by user ID
- `unread` (boolean, "true"/"false") - Filter unread notifications only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Notification Title",
      "message": "Notification message",
      "type": "info",
      "read": 0,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/notifications
Create a notification.

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info"
}
```

**Types:** `info`, `success`, `warning`, `error`

### PUT /api/v1/notifications
Mark notifications as read/unread.

**Request Body:**
```json
{
  "ids": [1, 2, 3],
  "read": true,
  "user_id": 1
}
```

---

## 🔒 Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (unique constraint violation)
- `500` - Internal Server Error

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination is supported for list endpoints
- Foreign key relationships are automatically joined (blogs → users, categories, tags)
- Tags for blogs are stored in a junction table and automatically included
- Reading time for blogs is calculated automatically (~200 words per minute)
- View count can be incremented using the `/blogs/[id]/view` endpoint
- Settings support multiple types (string, number, boolean, json)

