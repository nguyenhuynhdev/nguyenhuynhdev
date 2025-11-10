-- Dashboard Database Schema for Cloudflare D1
PRAGMA foreign_keys = OFF;

-- Drop all tables to start fresh
DROP TABLE IF EXISTS timeline_media;
DROP TABLE IF EXISTS timeline_tech;
DROP TABLE IF EXISTS timeline_tasks;
DROP TABLE IF EXISTS timeline_items;
DROP TABLE IF EXISTS work_gallery;
DROP TABLE IF EXISTS blog_gallery;
DROP TABLE IF EXISTS work_tags;
DROP TABLE IF EXISTS work_likes;
DROP TABLE IF EXISTS blog_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS publish_requests;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS blog_tags;
DROP TABLE IF EXISTS blog_history;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS works;
DROP TABLE IF EXISTS users;

PRAGMA foreign_keys = ON;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT, -- JSON array stored as text
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- MEDIA/ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  url TEXT NOT NULL,
  cloudflare_image_id TEXT,
  cloudflare_variant TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  used_in_blogs INTEGER DEFAULT 0,
  used_in_works INTEGER DEFAULT 0,
  used_in_projects INTEGER DEFAULT 0,
  uploaded_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ============================================
-- BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  summary TEXT,
  content TEXT NOT NULL, -- Rich text content
  cover_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  category_id INTEGER,
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'scheduled', 'published', 'archived')),
  author_id INTEGER NOT NULL,
  reading_time INTEGER DEFAULT 0, -- in minutes
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  gallery_enabled INTEGER DEFAULT 0,
  publish_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- ============================================
-- BLOG TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (blog_id, tag_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================
-- BLOG GALLERY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blog_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE CASCADE
);

-- ============================================
-- WORKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL, -- Rich text content
  cover_image_id INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  author_id INTEGER NOT NULL,
  featured INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (cover_image_id) REFERENCES media(id)
);

-- ============================================
-- WORK TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS work_tags (
  work_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (work_id, tag_id),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================
-- WORK GALLERY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS work_gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE CASCADE
);

-- ============================================
-- TIMELINE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL,
  date_range_start TEXT,
  date_range_end TEXT,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- ============================================
-- TIMELINE TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timeline_item_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (timeline_item_id) REFERENCES timeline_items(id) ON DELETE CASCADE
);

-- ============================================
-- TIMELINE TECH STACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_tech (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timeline_item_id INTEGER NOT NULL,
  tech_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (timeline_item_id) REFERENCES timeline_items(id) ON DELETE CASCADE
);

-- ============================================
-- TIMELINE MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timeline_item_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (timeline_item_id) REFERENCES timeline_items(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE CASCADE
);

-- ============================================
-- COMMENTS TABLE (Threaded)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'work', 'project')),
  content_id INTEGER NOT NULL,
  parent_id INTEGER, -- For threaded comments
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_website TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  ip_address TEXT,
  user_agent TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- ============================================
-- BLOG LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blog_id INTEGER NOT NULL,
  user_id INTEGER,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(blog_id, user_id, ip_address),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- WORK LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS work_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL,
  user_id INTEGER,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(work_id, user_id, ip_address),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- PUBLISH REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS publish_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'work')),
  content_id INTEGER NOT NULL,
  requested_by INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by INTEGER,
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'blog_view', 'work_view', 'project_view', 'download', 'click')),
  content_type TEXT CHECK (content_type IN ('blog', 'work', 'project', 'page')),
  content_id INTEGER,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  session_id TEXT,
  user_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  updated_by INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- LOGIN LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- BLOG HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blog_id INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  changed_by INTEGER,
  change_type TEXT DEFAULT 'update',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_author ON works(author_id);
CREATE INDEX IF NOT EXISTS idx_works_slug ON works(slug);
CREATE INDEX IF NOT EXISTS idx_timeline_items_work ON timeline_items(work_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_order ON timeline_items(work_id, display_order);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_content ON analytics_events(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_publish_requests_status ON publish_requests(status);
CREATE INDEX IF NOT EXISTS idx_publish_requests_content ON publish_requests(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_work_likes_work ON work_likes(work_id);
CREATE INDEX IF NOT EXISTS idx_work_gallery_work ON work_gallery(work_id);
CREATE INDEX IF NOT EXISTS idx_blog_gallery_blog ON blog_gallery(blog_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- SAMPLE ADMIN USER
-- ============================================
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'admin@example.com', 
  '$2b$10$QKO4M0Mf1xk4Dv37vgwxp.VtOTWAOyt8bPZKBkcuDmu6TWuUfBKA2', 
  'Admin User', 
  'admin'
);
