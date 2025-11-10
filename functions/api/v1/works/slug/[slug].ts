// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/works/slug/[slug] - Get work by slug
export async function onRequestGet({ env, params, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../../_utils');
    // Allow public access - try to get user but don't require authentication
    let user = null;
    try {
      if (request) {
        user = getAuthUser(request);
      }
    } catch {
      // Ignore auth errors for public access
      user = null;
    }
    const { slug } = await params;

    const work = await env.DB.prepare(
      `SELECT 
        w.*, u.name as author_name, u.avatar_url as author_avatar,
        m.url as cover_image_url, m.alt_text as cover_image_alt
      FROM works w
      LEFT JOIN users u ON w.author_id = u.id
      LEFT JOIN media m ON w.cover_image_id = m.id
      WHERE w.slug = ?`
    )
      .bind(slug)
      .first();

    const { errorResponse: errResponse, jsonResponse: jsonResp } = await import('../../../_utils');
    
    if (!work) {
      return errResponse('Work not found', 404);
    }

    // Public access: only show published works, or allow authenticated users to see their own
    if (work.status !== 'published') {
      if (!user || (work.author_id !== user.userId && !checkRole(user, ['admin']))) {
        return errResponse('Work not found', 404); // Don't reveal existence of unpublished works
      }
    }

    // Get tags
    const tags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN work_tags wt ON t.id = wt.tag_id
       WHERE wt.work_id = ?`
    )
      .bind(work.id)
      .all();

    // Get gallery images
    const gallery = await env.DB.prepare(
      `SELECT m.id, m.url, m.alt_text, wg.caption, wg.display_order
       FROM work_gallery wg
       INNER JOIN media m ON wg.image_id = m.id
       WHERE wg.work_id = ?
       ORDER BY wg.display_order ASC`
    )
      .bind(work.id)
      .all();

    // Get timeline items
    const timeline = await env.DB.prepare(
      `SELECT * FROM timeline_items
       WHERE work_id = ?
       ORDER BY display_order ASC`
    )
      .bind(work.id)
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
        .bind(work.id)
        .run();
      work.view_count = (work.view_count || 0) + 1;
    }

    return jsonResp({
      success: true,
      data: {
        ...work,
        tags: tags.results || [],
        gallery: gallery.results || [],
        timeline: timeline.results || [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

