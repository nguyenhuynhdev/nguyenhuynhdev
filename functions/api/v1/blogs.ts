// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/blogs - List all blogs
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'publish_date';
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const categoryId = url.searchParams.get('category_id');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.title, b.slug, b.summary, b.cover_image, b.status, 
        b.reading_time, b.view_count, b.featured, b.publish_date,
        b.created_at, b.updated_at,
        u.id as author_id, u.name as author_name, u.avatar_url as author_avatar,
        c.id as category_id, c.name as category_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
    `;

    const conditions: string[] = [];
    const bindings: any[] = [];

    // Public access: if no user or user is not admin, only show published blogs
    if (!user) {
      // Public access - only show published blogs
      conditions.push('b.status = "published"');
    } else if (!checkRole(user, ['admin'])) {
      // Authenticated but not admin - show published or own blogs
      if (status && status !== 'published') {
        // Non-admin can only see published, so ignore other status filters
        // But if they explicitly request published, show it
      }
      conditions.push('(b.status = "published" OR b.author_id = ?)');
      bindings.push(user.userId);
    } else {
      // Admin users can see all blogs or filter by status
      if (status) {
        conditions.push('b.status = ?');
        bindings.push(status);
      }
    }

    if (search) {
      conditions.push('(b.title LIKE ? OR b.summary LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    if (categoryId) {
      conditions.push('b.category_id = ?');
      bindings.push(parseInt(categoryId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
      case 'view_count':
        orderBy += 'b.view_count DESC';
        break;
      case 'status':
        orderBy += 'b.status ASC, b.created_at DESC';
        break;
      case 'publish_date':
      default:
        orderBy += 'b.publish_date DESC, b.created_at DESC';
    }

    query += ` ${orderBy} LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const results = await env.DB.prepare(query).bind(...bindings).all();

    // Get tags for each blog
    const blogsWithTags = await Promise.all(
      results.results.map(async (blog: any) => {
        const tags = await env.DB.prepare(
          `SELECT t.id, t.name, t.slug FROM tags t
           INNER JOIN blog_tags bt ON t.id = bt.tag_id
           WHERE bt.blog_id = ?`
        )
          .bind(blog.id)
          .all();

        return {
          ...blog,
          tags: tags.results || [],
        };
      })
    );

    // Build count query with same conditions (without limit/offset bindings)
    let countQuery = `SELECT COUNT(*) as total FROM blogs b`;
    // Use the same conditions but remove limit and offset from bindings
    const countBindings = bindings.slice(0, -2); // Remove limit and offset (last 2)
    
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const countResult = await env.DB.prepare(countQuery)
      .bind(...countBindings)
      .first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: blogsWithTags,
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// POST /api/v1/blogs - Create blog
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const {
      title,
      slug,
      summary,
      content,
      cover_image,
      meta_title,
      meta_description,
      category_id,
      tags = [],
      status = 'draft',
      featured = false,
      publish_date,
      author_id,
    } = body;

    // Use authenticated user as author if not specified or if user is not admin
    const finalAuthorId = checkRole(user, ['admin']) ? (author_id || user.userId) : user.userId;

    if (!title || !slug || !content) {
      return errorResponse('Title, slug, and content are required', 400);
    }

    // Calculate reading time (simple: ~200 words per minute)
    // Strip HTML tags for accurate word count
    function calculateReadingTime(htmlContent: string): number {
      if (!htmlContent) return 1;
      // Remove HTML tags
      const textWithoutTags = htmlContent.replace(/<[^>]*>/g, ' ');
      // Normalize whitespace
      const normalizedText = textWithoutTags.replace(/\s+/g, ' ').trim();
      // Count words (split by spaces and filter empty strings)
      const words = normalizedText ? normalizedText.split(' ').filter((w) => w.length > 0).length : 0;
      // Calculate reading time (200 words per minute)
      return Math.max(1, Math.ceil(words / 200));
    }
    const readingTime = calculateReadingTime(content);

    const finalPublishDate =
      status === 'published' && !publish_date ? new Date().toISOString() : publish_date;

    // Insert blog
    const insertResult = await env.DB.prepare(
      `INSERT INTO blogs (
        title, slug, summary, content, cover_image, meta_title, meta_description,
        category_id, status, featured, author_id, reading_time, publish_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        title,
        slug,
        summary || null,
        content,
        cover_image || null,
        meta_title || null,
        meta_description || null,
        category_id || null,
        status,
        featured ? 1 : 0,
        finalAuthorId,
        readingTime,
        finalPublishDate || null
      )
      .run();

    const blogId = insertResult.meta.last_row_id;

    // Update slug to include ID: {title-slug}-{id}
    const finalSlug = `${slug}-${blogId}`;
    await env.DB.prepare('UPDATE blogs SET slug = ? WHERE id = ?')
      .bind(finalSlug, blogId)
      .run();

    // Insert tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        await env.DB.prepare('INSERT OR IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)')
          .bind(blogId, tagId)
          .run();
      }
    }

    // Fetch complete blog
    const newBlog = await env.DB.prepare(
      `SELECT 
        b.*, u.name as author_name, c.name as category_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?`
    )
      .bind(blogId)
      .first();

    const blogTags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN blog_tags bt ON t.id = bt.tag_id
       WHERE bt.blog_id = ?`
    )
      .bind(blogId)
      .all();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: {
        ...newBlog,
        tags: blogTags.results || [],
      },
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    if (err.message?.includes('UNIQUE constraint')) {
      return errorResponse('Slug already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

