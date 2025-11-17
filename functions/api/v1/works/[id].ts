// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/works/[id] - Get single work
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    const workId = parseInt(params.id);

    const work = await env.DB.prepare(
      `SELECT 
        w.*, u.name as author_name, u.avatar_url as author_avatar,
        m.url as cover_image_url, m.alt_text as cover_image_alt
      FROM works w
      LEFT JOIN users u ON w.author_id = u.id
      LEFT JOIN media m ON w.cover_image_id = m.id
      WHERE w.id = ?`
    )
      .bind(workId)
      .first();

    if (!work) {
      return errorResponse('Work not found', 404);
    }

    // Check permissions
    if (work.status !== 'published' && (!user || (work.author_id !== user.userId && !checkRole(user, ['admin'])))) {
      return errorResponse('Forbidden', 403);
    }

    // Get tags
    const tags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN work_tags wt ON t.id = wt.tag_id
       WHERE wt.work_id = ?`
    )
      .bind(workId)
      .all();

    // Get gallery images
    const gallery = await env.DB.prepare(
      `SELECT m.id, m.url, m.alt_text, wg.caption, wg.display_order
       FROM work_gallery wg
       INNER JOIN media m ON wg.image_id = m.id
       WHERE wg.work_id = ?
       ORDER BY wg.display_order ASC`
    )
      .bind(workId)
      .all();

    // Get timeline items
    const timeline = await env.DB.prepare(
      `SELECT * FROM timeline_items
       WHERE work_id = ?
       ORDER BY display_order ASC`
    )
      .bind(workId)
      .all();

    // Get tasks, tech, and media for each timeline item
    for (const item of timeline.results) {
      const tasks = await env.DB.prepare(
        `SELECT task FROM timeline_tasks WHERE timeline_item_id = ? ORDER BY display_order ASC`
      ).bind(item.id).all();
      item.tasks = tasks.results?.map((t: any) => t.task) || [];

      const tech = await env.DB.prepare(
        `SELECT tech_name FROM timeline_tech WHERE timeline_item_id = ? ORDER BY display_order ASC`
      ).bind(item.id).all();
      item.tech = tech.results?.map((t: any) => t.tech_name) || [];

      const media = await env.DB.prepare(
        `SELECT m.id, m.url, m.alt_text FROM timeline_media tm
         INNER JOIN media m ON tm.image_id = m.id
         WHERE tm.timeline_item_id = ?
         ORDER BY tm.display_order ASC`
      ).bind(item.id).all();
      item.media = media.results || [];
    }

    // Increment view count if published and not author/admin viewing
    if (work.status === 'published' && (!user || work.author_id !== user.userId)) {
      await env.DB.prepare('UPDATE works SET view_count = view_count + 1 WHERE id = ?')
        .bind(workId)
        .run();
      work.view_count = (work.view_count || 0) + 1;
    }

    return jsonResponse({
      success: true,
      data: {
        ...work,
        tags: tags.results || [],
        gallery: gallery.results || [],
        timeline: timeline.results || [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/works/[id] - Update work
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const workId = parseInt(params.id);
    const body = await request.json();

    // Check if work exists and user has permission
    const existingWork = await env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(workId)
      .first();

    if (!existingWork) {
      return errorResponse('Work not found', 404);
    }

    if (existingWork.author_id !== user.userId && !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }

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
      privacy_policy,
    } = body;

    // Only admin can change author
    if (author_id !== undefined && author_id !== existingWork.author_id) {
      if (!checkRole(user, ['admin'])) {
        return errorResponse('Only admin can change work author', 403);
      }
    }

    const updateFields: string[] = [];
    const bindings: any[] = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      bindings.push(title);
    }
    if (slug !== undefined) {
      updateFields.push('slug = ?');
      bindings.push(slug);
    }
    if (summary !== undefined) {
      updateFields.push('summary = ?');
      bindings.push(summary);
    }
    if (full_content !== undefined) {
      updateFields.push('full_content = ?');
      bindings.push(full_content);
    }
    if (cover_image_id !== undefined) {
      updateFields.push('cover_image_id = ?');
      bindings.push(cover_image_id);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      bindings.push(status);
      if (status === 'published' && !existingWork.published_at) {
        updateFields.push('published_at = ?');
        bindings.push(published_at || new Date().toISOString());
      }
    }
    if (featured !== undefined) {
      updateFields.push('featured = ?');
      bindings.push(featured ? 1 : 0);
    }
    if (author_id !== undefined && checkRole(user, ['admin'])) {
      updateFields.push('author_id = ?');
      bindings.push(author_id);
    }
    if (privacy_policy !== undefined) {
      updateFields.push('privacy_policy = ?');
      bindings.push(privacy_policy);
    }
    updateFields.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    bindings.push(workId);

    await env.DB.prepare(
      `UPDATE works SET ${updateFields.join(', ')} WHERE id = ?`
    )
      .bind(...bindings)
      .run();

    // Update tags if provided
    if (tags !== undefined) {
      await env.DB.prepare('DELETE FROM work_tags WHERE work_id = ?').bind(workId).run();
      if (tags.length > 0) {
        for (const tagId of tags) {
          await env.DB.prepare('INSERT INTO work_tags (work_id, tag_id) VALUES (?, ?)')
            .bind(workId, tagId)
            .run();
        }
      }
    }

    // Handle publish request
    if (status === 'pending' && !checkRole(user, ['admin'])) {
      const existingRequest = await env.DB.prepare(
        'SELECT * FROM publish_requests WHERE content_type = ? AND content_id = ? AND status = ?'
      )
        .bind('work', workId, 'pending')
        .first();

      if (!existingRequest) {
        await env.DB.prepare(
          `INSERT INTO publish_requests (content_type, content_id, requested_by, status)
           VALUES (?, ?, ?, ?)`
        )
          .bind('work', workId, user.userId, 'pending')
          .run();
      }
    }

    // Fetch updated work
    const updatedWork = await env.DB.prepare(
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
        ...updatedWork,
        tags: workTags.results || [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    if (err.message?.includes('UNIQUE constraint')) {
      return errorResponse('Slug already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/works/[id] - Delete work
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const workId = parseInt(params.id);

    // Check if work exists and user has permission
    const work = await env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(workId)
      .first();

    if (!work) {
      return errorResponse('Work not found', 404);
    }

    if (work.author_id !== user.userId && !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }

    await env.DB.prepare('DELETE FROM works WHERE id = ?').bind(workId).run();

    return jsonResponse({
      success: true,
      message: 'Work deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

