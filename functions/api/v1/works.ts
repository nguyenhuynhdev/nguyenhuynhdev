// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/works - List all works
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'published_at';
    const status = url.searchParams.get('status');
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        w.id, w.title, w.slug, w.summary, w.cover_image_id, w.status, w.featured,
        w.view_count, w.likes_count, w.created_at, w.updated_at, w.published_at,
        u.id as author_id, u.name as author_name, u.avatar_url as author_avatar,
        m.url as cover_image_url
      FROM works w
      LEFT JOIN users u ON w.author_id = u.id
      LEFT JOIN media m ON w.cover_image_id = m.id
    `;

    const conditions: string[] = [];
    const bindings: any[] = [];

    // Public access: if no user, only show published works
    if (!user) {
      // Public access - only show published works
      conditions.push('w.status = "published"');
    } else if (!checkRole(user, ['admin'])) {
      // Authenticated but not admin - show published or own works
      conditions.push('(w.status = "published" OR w.author_id = ?)');
      bindings.push(user.userId);
    }
    // Admin users can see all works (no status filter unless specified)

    if (status) {
      // If status is explicitly requested and user is not admin, validate
      if (!user || !checkRole(user, ['admin'])) {
        // Non-admin users can only request published status
        if (status === 'published') {
          conditions.push('w.status = "published"');
        }
      } else {
        // Admin can filter by any status
        conditions.push('w.status = ?');
        bindings.push(status);
      }
    }

    if (search) {
      conditions.push('(w.title LIKE ? OR w.summary LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    if (tag) {
      query += ` INNER JOIN work_tags wt ON w.id = wt.work_id
                 INNER JOIN tags t ON wt.tag_id = t.id`;
      conditions.push('t.slug = ?');
      bindings.push(tag);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
      case 'view_count':
        orderBy += 'w.view_count DESC';
        break;
      case 'likes_count':
        orderBy += 'w.likes_count DESC';
        break;
      case 'created_at':
        orderBy += 'w.created_at DESC';
        break;
      case 'published_at':
      default:
        orderBy += 'w.published_at DESC, w.created_at DESC';
        break;
    }

    query += ` ${orderBy} LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const works = await env.DB.prepare(query).bind(...bindings).all();

    // Get tags for each work
    for (const work of works.results) {
      const tags = await env.DB.prepare(
        `SELECT t.id, t.name, t.slug FROM tags t
         INNER JOIN work_tags wt ON t.id = wt.tag_id
         WHERE wt.work_id = ?`
      ).bind(work.id).all();
      work.tags = tags.results || [];
    }

    // Get total count (reuse same conditions but without limit/offset)
    let countQuery = `SELECT COUNT(DISTINCT w.id) as total FROM works w`;
    const countConditions: string[] = [];
    const countBindings: any[] = [];

    // Rebuild conditions for count query (without pagination bindings)
    if (!checkRole(user, ['admin'])) {
      if (user) {
        countConditions.push('(w.status = "published" OR w.author_id = ?)');
        countBindings.push(user.userId);
      } else {
        countConditions.push('w.status = "published"');
      }
    }

    if (status) {
      countConditions.push('w.status = ?');
      countBindings.push(status);
    }

    if (search) {
      countConditions.push('(w.title LIKE ? OR w.summary LIKE ?)');
      const searchTerm = `%${search}%`;
      countBindings.push(searchTerm, searchTerm);
    }

    if (tag) {
      countQuery += ` INNER JOIN work_tags wt ON w.id = wt.work_id
                      INNER JOIN tags t ON wt.tag_id = t.id`;
      countConditions.push('t.slug = ?');
      countBindings.push(tag);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    const countResult = await env.DB.prepare(countQuery).bind(...countBindings).first();

    return jsonResponse({
      success: true,
      data: works.results,
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

// POST /api/v1/works - Create work
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const {
      title,
      slug,
      summary,
      full_content,
      cover_image_id,
      status,
      tags,
      published_at,
      featured,
      author_id,
    } = body;

    if (!title || !slug || !full_content) {
      return errorResponse('Title, slug, and content are required', 400);
    }

    const finalAuthorId = author_id || user.userId;
    if (!checkRole(user, ['admin']) && finalAuthorId !== user.userId) {
      return errorResponse('You can only create works for yourself', 403);
    }

    const finalStatus = status || 'draft';
    const finalPublishedAt = finalStatus === 'published' ? (published_at || new Date().toISOString()) : null;

    const insertResult = await env.DB.prepare(
      `INSERT INTO works (
        title, slug, summary, full_content, cover_image_id, status, published_at, author_id, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        title,
        slug,
        summary || null,
        full_content,
        cover_image_id || null,
        finalStatus,
        finalPublishedAt,
        finalAuthorId,
        featured ? 1 : 0
      )
      .run();

    const workId = insertResult.meta.last_row_id;

    // Update slug to include ID: {title-slug}-{id}
    const finalSlug = `${slug}-${workId}`;
    await env.DB.prepare('UPDATE works SET slug = ? WHERE id = ?')
      .bind(finalSlug, workId)
      .run();

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await env.DB.prepare('INSERT OR IGNORE INTO work_tags (work_id, tag_id) VALUES (?, ?)')
          .bind(workId, tagId)
          .run();
      }
    }

    // Create publish request if status is pending
    if (finalStatus === 'pending' && !checkRole(user, ['admin'])) {
      await env.DB.prepare(
        `INSERT INTO publish_requests (content_type, content_id, requested_by, status)
         VALUES (?, ?, ?, ?)`
      )
        .bind('work', workId, user.userId, 'pending')
        .run();
    }

    // Fetch complete work
    const newWork = await env.DB.prepare(
      `SELECT 
        w.*, u.name as author_name, m.url as cover_image_url
      FROM works w
      LEFT JOIN users u ON w.author_id = u.id
      LEFT JOIN media m ON w.cover_image_id = m.id
      WHERE w.id = ?`
    )
      .bind(workId)
      .first();

    const workTags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN work_tags wt ON t.id = wt.tag_id
       WHERE wt.work_id = ?`
    )
      .bind(workId)
      .all();

    return jsonResponse({
      success: true,
      data: {
        ...newWork,
        tags: workTags.results || [],
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

