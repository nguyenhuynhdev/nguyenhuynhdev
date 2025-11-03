// GET /api/v1/blogs - List all blogs
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'publish_date';
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.title, b.slug, b.excerpt, b.cover_image, b.status, 
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

    // Editors and viewers can only see published blogs or their own
    if (!checkRole(user, ['admin'])) {
      conditions.push('(b.status = "published" OR b.author_id = ?)');
      bindings.push(user.userId);
    }

    if (status) {
      conditions.push('b.status = ?');
      bindings.push(status);
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

    const countQuery = conditions.length > 0
      ? `SELECT COUNT(*) as total FROM blogs b WHERE ${conditions.join(' AND ')}`
      : 'SELECT COUNT(*) as total FROM blogs';
    const countBindings = bindings.slice(0, -2);
    const countResult = await env.DB.prepare(countQuery)
      .bind(...countBindings)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        data: blogsWithTags,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/v1/blogs - Create blog
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
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
      return new Response(
        JSON.stringify({ error: 'Title, slug, content, and author_id are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate reading time (simple: ~200 words per minute)
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / wordsPerMinute));

    const finalPublishDate =
      status === 'published' && !publish_date ? new Date().toISOString() : publish_date;

    // Insert blog
    const blogResult = await env.DB.prepare(
      `INSERT INTO blogs (
        title, slug, excerpt, content, cover_image, meta_title, meta_description,
        category_id, status, featured, author_id, reading_time, publish_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`
    )
      .bind(
        title,
        slug,
        excerpt || null,
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
      .first();

    const blogId = blogResult.id;

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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...newBlog,
          tags: blogTags.results || [],
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

