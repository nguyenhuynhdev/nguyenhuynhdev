-- Seed Data Script for Database
-- Run this after schema.sql to populate initial data

-- ============================================
-- CATEGORIES
-- ============================================
INSERT OR IGNORE INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Technology related articles'),
  ('Web Development', 'web-development', 'Web development tutorials and guides'),
  ('Mobile Development', 'mobile-development', 'Mobile app development'),
  ('Design', 'design', 'UI/UX design articles'),
  ('Business', 'business', 'Business and entrepreneurship'),
  ('Tutorials', 'tutorials', 'Step-by-step tutorials');

-- ============================================
-- TAGS
-- ============================================
INSERT OR IGNORE INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('TypeScript', 'typescript'),
  ('JavaScript', 'javascript'),
  ('Node.js', 'nodejs'),
  ('Python', 'python'),
  ('PHP', 'php'),
  ('Laravel', 'laravel'),
  ('Vue.js', 'vuejs'),
  ('Angular', 'angular'),
  ('Tailwind CSS', 'tailwindcss'),
  ('CSS', 'css'),
  ('HTML', 'html'),
  ('Database', 'database'),
  ('SQL', 'sql'),
  ('MongoDB', 'mongodb'),
  ('PostgreSQL', 'postgresql'),
  ('MySQL', 'mysql'),
  ('Docker', 'docker'),
  ('Kubernetes', 'kubernetes'),
  ('AWS', 'aws'),
  ('Cloudflare', 'cloudflare'),
  ('Git', 'git'),
  ('GitHub', 'github'),
  ('API', 'api'),
  ('REST', 'rest'),
  ('GraphQL', 'graphql'),
  ('Mobile', 'mobile'),
  ('iOS', 'ios'),
  ('Android', 'android'),
  ('React Native', 'react-native'),
  ('Flutter', 'flutter'),
  ('UI/UX', 'uiux'),
  ('Design', 'design'),
  ('Figma', 'figma'),
  ('Photoshop', 'photoshop'),
  ('Illustrator', 'illustrator'),
  ('Web Design', 'web-design'),
  ('Frontend', 'frontend'),
  ('Backend', 'backend'),
  ('Full Stack', 'fullstack'),
  ('DevOps', 'devops'),
  ('Testing', 'testing'),
  ('Performance', 'performance'),
  ('Security', 'security'),
  ('SEO', 'seo'),
  ('Marketing', 'marketing'),
  ('E-commerce', 'ecommerce'),
  ('Blogging', 'blogging');

-- ============================================
-- SAMPLE BLOGS
-- ============================================
INSERT OR IGNORE INTO blogs (title, slug, excerpt, summary, content, cover_image, meta_title, meta_description, category_id, status, author_id, reading_time, view_count, likes_count, publish_date, featured) VALUES
  (
    'Getting Started with Next.js 15',
    'getting-started-with-nextjs-15',
    'Learn how to build modern web applications with Next.js 15',
    'This comprehensive guide will walk you through the fundamentals of Next.js 15, including the App Router, Server Components, and new features.',
    '# Getting Started with Next.js 15

Next.js 15 introduces many exciting features and improvements. In this tutorial, we will explore the key concepts and build a sample application.

## Key Features

- **App Router**: The new routing system based on the file system
- **Server Components**: Components that run on the server by default
- **Improved Performance**: Faster builds and runtime performance
- **Better Developer Experience**: Enhanced tooling and debugging

## Installation

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

## Conclusion

Next.js 15 makes it easier than ever to build fast, scalable web applications.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    'Getting Started with Next.js 15 - Complete Guide',
    'Learn how to build modern web applications with Next.js 15. Comprehensive tutorial covering App Router, Server Components, and more.',
    2,
    'published',
    1,
    10,
    0,
    0,
    datetime('now', '-5 days'),
    1
  ),
  (
    'Mastering TypeScript for React Developers',
    'mastering-typescript-for-react-developers',
    'A deep dive into TypeScript patterns and best practices for React development',
    'Learn advanced TypeScript techniques specifically tailored for React developers. We will cover type safety, component patterns, and more.',
    '# Mastering TypeScript for React Developers

TypeScript brings type safety to React applications, helping catch errors early and improving developer experience.

## Type Safety Benefits

- **Early Error Detection**: Catch bugs before runtime
- **Better IDE Support**: Autocomplete and refactoring
- **Self-Documenting Code**: Types serve as documentation
- **Improved Maintainability**: Easier to understand and modify code

## React Type Patterns

```typescript
interface UserProps {
  name: string;
  age: number;
  email?: string;
}

const User: React.FC<UserProps> = ({ name, age, email }) => {
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
      {email && <p>Email: {email}</p>}
    </div>
  );
};
```

## Best Practices

1. Use interfaces for props
2. Leverage type inference
3. Use generics for reusable components
4. Avoid `any` type

## Conclusion

TypeScript is an essential tool for modern React development.',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    'Mastering TypeScript for React Developers - Complete Guide',
    'Learn advanced TypeScript techniques for React development. Covering type safety, component patterns, and best practices.',
    2,
    'published',
    1,
    12,
    0,
    0,
    datetime('now', '-3 days'),
    1
  ),
  (
    'Building Scalable APIs with Node.js',
    'building-scalable-apis-with-nodejs',
    'Learn how to build robust and scalable REST APIs using Node.js and Express',
    'This guide covers everything you need to know about building production-ready APIs with Node.js, including authentication, error handling, and database integration.',
    '# Building Scalable APIs with Node.js

Node.js is a powerful platform for building server-side applications and APIs. In this guide, we will explore best practices for creating scalable APIs.

## API Design Principles

- **RESTful Architecture**: Follow REST principles
- **Consistent Response Format**: Standardize API responses
- **Error Handling**: Proper error handling and status codes
- **Authentication**: Secure API endpoints
- **Rate Limiting**: Prevent abuse

## Project Structure

```
project/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
└── package.json
```

## Authentication

Implement JWT-based authentication for secure API access.

## Database Integration

Connect to databases using ORMs like Prisma or Sequelize.

## Conclusion

Building scalable APIs requires careful planning and following best practices.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    'Building Scalable APIs with Node.js - Complete Guide',
    'Learn how to build robust and scalable REST APIs using Node.js. Covering authentication, error handling, and database integration.',
    1,
    'published',
    1,
    15,
    0,
    0,
    datetime('now', '-1 days'),
    0
  );

-- Link tags to blogs
INSERT OR IGNORE INTO blog_tags (blog_id, tag_id) VALUES
  (1, (SELECT id FROM tags WHERE slug = 'nextjs')),
  (1, (SELECT id FROM tags WHERE slug = 'react')),
  (1, (SELECT id FROM tags WHERE slug = 'typescript')),
  (1, (SELECT id FROM tags WHERE slug = 'javascript')),
  (2, (SELECT id FROM tags WHERE slug = 'typescript')),
  (2, (SELECT id FROM tags WHERE slug = 'react')),
  (2, (SELECT id FROM tags WHERE slug = 'frontend')),
  (3, (SELECT id FROM tags WHERE slug = 'nodejs')),
  (3, (SELECT id FROM tags WHERE slug = 'api')),
  (3, (SELECT id FROM tags WHERE slug = 'backend')),
  (3, (SELECT id FROM tags WHERE slug = 'rest'));

-- ============================================
-- SAMPLE WORKS
-- ============================================
INSERT OR IGNORE INTO works (title, slug, summary, full_content, cover_image_id, status, author_id, view_count, likes_count, published_at, featured) VALUES
  (
    'E-Commerce Platform',
    'ecommerce-platform',
    'A full-featured e-commerce platform built with Next.js and Stripe',
    '<h1>E-Commerce Platform</h1><p>This project is a complete e-commerce solution built with modern web technologies.</p><h2>Features</h2><ul><li>Product catalog</li><li>Shopping cart</li><li>Payment processing</li><li>Order management</li><li>User authentication</li></ul><h2>Technologies</h2><p>Next.js, React, TypeScript, Stripe, PostgreSQL</p>',
    NULL,
    'published',
    1,
    0,
    0,
    datetime('now', '-10 days'),
    1
  ),
  (
    'Portfolio Website',
    'portfolio-website',
    'A modern portfolio website showcasing my work and skills',
    '<h1>Portfolio Website</h1><p>A beautiful and responsive portfolio website built with Next.js and Tailwind CSS.</p><h2>Features</h2><ul><li>Project showcase</li><li>Blog section</li><li>Contact form</li><li>Dark mode</li><li>Responsive design</li></ul><h2>Technologies</h2><p>Next.js, React, TypeScript, Tailwind CSS, Cloudflare Pages</p>',
    NULL,
    'published',
    1,
    0,
    0,
    datetime('now', '-7 days'),
    1
  ),
  (
    'Task Management App',
    'task-management-app',
    'A collaborative task management application with real-time updates',
    '<h1>Task Management App</h1><p>A powerful task management application for teams.</p><h2>Features</h2><ul><li>Task creation and assignment</li><li>Real-time collaboration</li><li>Project boards</li><li>Notifications</li><li>File attachments</li></ul><h2>Technologies</h2><p>React, Node.js, Socket.io, MongoDB, Express</p>',
    NULL,
    'published',
    1,
    0,
    0,
    datetime('now', '-4 days'),
    0
  );

-- Link tags to works
INSERT OR IGNORE INTO work_tags (work_id, tag_id) VALUES
  (1, (SELECT id FROM tags WHERE slug = 'nextjs')),
  (1, (SELECT id FROM tags WHERE slug = 'react')),
  (1, (SELECT id FROM tags WHERE slug = 'typescript')),
  (1, (SELECT id FROM tags WHERE slug = 'ecommerce')),
  (1, (SELECT id FROM tags WHERE slug = 'fullstack')),
  (2, (SELECT id FROM tags WHERE slug = 'nextjs')),
  (2, (SELECT id FROM tags WHERE slug = 'react')),
  (2, (SELECT id FROM tags WHERE slug = 'tailwindcss')),
  (2, (SELECT id FROM tags WHERE slug = 'web-design')),
  (3, (SELECT id FROM tags WHERE slug = 'react')),
  (3, (SELECT id FROM tags WHERE slug = 'nodejs')),
  (3, (SELECT id FROM tags WHERE slug = 'mongodb')),
  (3, (SELECT id FROM tags WHERE slug = 'fullstack'));

-- ============================================
-- SAMPLE PROJECTS
-- ============================================
INSERT OR IGNORE INTO projects (title, slug, description, content, cover_image, featured, status, tags, created_by) VALUES
  (
    'Open Source Library',
    'open-source-library',
    'A utility library for common JavaScript functions',
    'This library provides a collection of useful utility functions for JavaScript development.',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    1,
    'published',
    '["javascript", "nodejs", "open-source"]',
    1
  ),
  (
    'Design System',
    'design-system',
    'A comprehensive design system for web applications',
    'A complete design system including components, tokens, and documentation.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    1,
    'published',
    '["design", "uiux", "figma", "react"]',
    1
  ),
  (
    'Mobile App',
    'mobile-app',
    'A mobile application for iOS and Android',
    'Cross-platform mobile application built with React Native.',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    0,
    'published',
    '["react-native", "mobile", "ios", "android"]',
    1
  );

-- ============================================
-- TIMELINE ITEMS FOR WORKS
-- ============================================
-- Timeline for E-Commerce Platform (work_id = 1)
INSERT OR IGNORE INTO timeline_items (work_id, date_range_start, date_range_end, title, description, display_order) VALUES
  (1, '2024-01-01', '2024-01-15', 'Planning & Design', 'Initial planning and UI/UX design phase', 1),
  (1, '2024-01-16', '2024-02-15', 'Development', 'Core development and feature implementation', 2),
  (1, '2024-02-16', '2024-02-28', 'Testing & Launch', 'Testing, bug fixes, and production launch', 3);

-- Timeline tasks for E-Commerce Platform
INSERT OR IGNORE INTO timeline_tasks (timeline_item_id, task, display_order) VALUES
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 1), 'Requirement analysis', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 1), 'Wireframing', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 1), 'UI design', 2),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Setup project structure', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Implement authentication', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Build product catalog', 2),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Integrate payment', 3),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Unit testing', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Integration testing', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Deploy to production', 2);

-- Timeline tech for E-Commerce Platform
INSERT OR IGNORE INTO timeline_tech (timeline_item_id, tech_name, display_order) VALUES
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 1), 'Figma', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 1), 'Adobe XD', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Next.js', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'React', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'TypeScript', 2),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'Stripe', 3),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 2), 'PostgreSQL', 4),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Jest', 0),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Cypress', 1),
  ((SELECT id FROM timeline_items WHERE work_id = 1 AND display_order = 3), 'Vercel', 2);

-- ============================================
-- SAMPLE MEDIA (Optional - for images)
-- ============================================
-- Note: In production, these would be actual image URLs from Cloudflare Images
-- For now, we'll use placeholder URLs

INSERT OR IGNORE INTO media (filename, original_filename, file_type, file_size, url, uploaded_by, alt_text) VALUES
  ('nextjs-cover.jpg', 'nextjs-cover.jpg', 'image/jpeg', 102400, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 1, 'Next.js 15 Cover Image'),
  ('typescript-cover.jpg', 'typescript-cover.jpg', 'image/jpeg', 98304, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800', 1, 'TypeScript Cover Image'),
  ('nodejs-cover.jpg', 'nodejs-cover.jpg', 'image/jpeg', 112640, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 1, 'Node.js API Cover Image');


