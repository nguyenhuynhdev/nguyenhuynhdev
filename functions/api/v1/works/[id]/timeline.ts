// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/works/[id]/timeline - Get timeline items
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../../_utils');
    const user = getAuthUser(request);
    const workId = parseInt(params.id);

    // Check if work exists and user has permission
    const work = await env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(workId)
      .first();

    if (!work) {
      return errorResponse('Work not found', 404);
    }

    if (work.status !== 'published' && (!user || (work.author_id !== user.userId && !checkRole(user, ['admin'])))) {
      return errorResponse('Forbidden', 403);
    }

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

    return jsonResponse({
      success: true,
      data: timeline.results || [],
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// POST /api/v1/works/[id]/timeline - Create timeline item
export async function onRequestPost({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const workId = parseInt(params.id);
    const body = await request.json();

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

    const {
      date_range_start,
      date_range_end,
      title,
      description,
      tasks,
      tech,
      media,
      display_order,
    } = body;

    if (!title) {
      return errorResponse('Title is required', 400);
    }

    // Get max display order
    const maxOrderResult = await env.DB.prepare(
      'SELECT MAX(display_order) as max_order FROM timeline_items WHERE work_id = ?'
    ).bind(workId).first();
    const nextOrder = display_order !== undefined ? display_order : ((maxOrderResult?.max_order || 0) + 1);

    // Insert timeline item
    const insertResult = await env.DB.prepare(
      `INSERT INTO timeline_items (
        work_id, date_range_start, date_range_end, title, description, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        workId,
        date_range_start || null,
        date_range_end || null,
        title,
        description || null,
        nextOrder
      )
      .run();

    const timelineItemId = insertResult.meta.last_row_id;

    // Insert tasks
    if (tasks && tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        await env.DB.prepare(
          'INSERT INTO timeline_tasks (timeline_item_id, task, display_order) VALUES (?, ?, ?)'
        )
          .bind(timelineItemId, tasks[i], i)
          .run();
      }
    }

    // Insert tech
    if (tech && tech.length > 0) {
      for (let i = 0; i < tech.length; i++) {
        await env.DB.prepare(
          'INSERT INTO timeline_tech (timeline_item_id, tech_name, display_order) VALUES (?, ?, ?)'
        )
          .bind(timelineItemId, tech[i], i)
          .run();
      }
    }

    // Insert media
    if (media && media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        await env.DB.prepare(
          'INSERT INTO timeline_media (timeline_item_id, image_id, display_order) VALUES (?, ?, ?)'
        )
          .bind(timelineItemId, media[i], i)
          .run();
      }
    }

    // Fetch complete timeline item
    const timelineItem = await env.DB.prepare('SELECT * FROM timeline_items WHERE id = ?')
      .bind(timelineItemId)
      .first();

    const tasksResult = await env.DB.prepare(
      `SELECT task FROM timeline_tasks WHERE timeline_item_id = ? ORDER BY display_order ASC`
    ).bind(timelineItemId).all();
    timelineItem.tasks = tasksResult.results?.map((t: any) => t.task) || [];

    const techResult = await env.DB.prepare(
      `SELECT tech_name FROM timeline_tech WHERE timeline_item_id = ? ORDER BY display_order ASC`
    ).bind(timelineItemId).all();
    timelineItem.tech = techResult.results?.map((t: any) => t.tech_name) || [];

    const mediaResult = await env.DB.prepare(
      `SELECT m.id, m.url, m.alt_text FROM timeline_media tm
       INNER JOIN media m ON tm.image_id = m.id
       WHERE tm.timeline_item_id = ?
       ORDER BY tm.display_order ASC`
    ).bind(timelineItemId).all();
    timelineItem.media = mediaResult.results || [];

    return jsonResponse({
      success: true,
      data: timelineItem,
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// Note: PUT and DELETE for individual timeline items are handled in [itemId].ts

