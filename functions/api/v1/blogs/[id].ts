// GET /api/v1/blogs/[id]
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const { id } = await params;
    const blogId = parseInt(id);

    const blog = await env.DB.prepare(
      `SELECT 
        b.*, u.name as author_name, u.avatar_url as author_avatar,
        c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?`
    )
      .bind(blogId)
      .first();

    if (!blog) {
      return errorResponse('Blog not found', 404);
    }

    // Check permissions
    if (!checkRole(user, ['admin']) && blog.status !== 'published' && blog.author_id !== user.userId) {
      return errorResponse('Forbidden', 403);
    }

    const tags = await env.DB.prepare(
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
          ...blog,
          tags: tags.results || [],
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

// PUT /api/v1/blogs/[id]
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    const { id } = await params;
    const blogId = parseInt(id);

    // Get existing blog to check permissions
    const existing = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?')
      .bind(blogId)
      .first();

    if (!existing) {
      return errorResponse('Blog not found', 404);
    }

    // Check permissions: admin can edit any, editor can edit own
    const canEdit = checkRole(user, ['admin']) ||
      (checkRole(user, ['editor']) && existing.author_id === user.userId);

    if (!canEdit) {
      return errorResponse('You can only edit your own blogs', 403);
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    if (body.slug !== undefined) {
      updates.push('slug = ?');
      values.push(body.slug);
    }
    if (body.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(body.excerpt);
    }
    if (body.content !== undefined) {
      updates.push('content = ?');
      values.push(body.content);
      // Recalculate reading time
      const wordsPerMinute = 200;
      const words = body.content.trim().split(/\s+/).length;
      updates.push('reading_time = ?');
      values.push(Math.max(1, Math.ceil(words / wordsPerMinute)));
    }
    if (body.cover_image !== undefined) {
      updates.push('cover_image = ?');
      values.push(body.cover_image);
    }
    if (body.meta_title !== undefined) {
      updates.push('meta_title = ?');
      values.push(body.meta_title);
    }
    if (body.meta_description !== undefined) {
      updates.push('meta_description = ?');
      values.push(body.meta_description);
    }
    if (body.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(body.category_id);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
      if (body.status === 'published' && !body.publish_date) {
        updates.push('publish_date = datetime("now")');
      }
    }
    if (body.featured !== undefined) {
      updates.push('featured = ?');
      values.push(body.featured ? 1 : 0);
    }
    if (body.publish_date !== undefined) {
      updates.push('publish_date = ?');
      values.push(body.publish_date);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    updates.push('updated_at = datetime("now")');
    values.push(blogId);

    await env.DB.prepare(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // Update tags if provided
    if (body.tags !== undefined) {
      // Remove old tags
      await env.DB.prepare('DELETE FROM blog_tags WHERE blog_id = ?')
        .bind(blogId)
        .run();

      // Add new tags
      if (Array.isArray(body.tags) && body.tags.length > 0) {
        for (const tagId of body.tags) {
          await env.DB.prepare('INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)')
            .bind(blogId, tagId)
            .run();
        }
      }
    }

    // Fetch updated blog
    const updated = await env.DB.prepare(
      `SELECT 
        b.*, u.name as author_name, c.name as category_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?`
    )
      .bind(blogId)
      .first();

    const tags = await env.DB.prepare(
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
          ...updated,
          tags: tags.results || [],
        },
      }),
      {
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

// DELETE /api/v1/blogs/[id]
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const { id } = await params;
    const blogId = parseInt(id);

    const existing = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?')
      .bind(blogId)
      .first();

    if (!existing) {
      return errorResponse('Blog not found', 404);
    }

    // Check permissions
    if (!checkRole(user, ['admin']) && existing.author_id !== user.userId) {
      return errorResponse('Forbidden', 403);
    }

    await env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(blogId).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blog deleted successfully',
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

// POST /api/v1/blogs/[id]/view - Increment view count
export async function onRequestPost({ env, params }: any) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    await env.DB.prepare('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?')
      .bind(blogId)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
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

