// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// PUT /api/v1/works/[id]/timeline/[itemId] - Update timeline item
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const workId = parseInt(params.id);
    const itemId = parseInt(params.itemId);
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

    // Check if timeline item exists and belongs to work
    const timelineItem = await env.DB.prepare('SELECT * FROM timeline_items WHERE id = ? AND work_id = ?')
      .bind(itemId, workId)
      .first();

    if (!timelineItem) {
      return errorResponse('Timeline item not found', 404);
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

    const updateFields: string[] = [];
    const bindings: any[] = [];

    if (date_range_start !== undefined) {
      updateFields.push('date_range_start = ?');
      bindings.push(date_range_start);
    }
    if (date_range_end !== undefined) {
      updateFields.push('date_range_end = ?');
      bindings.push(date_range_end);
    }
    if (title !== undefined) {
      updateFields.push('title = ?');
      bindings.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      bindings.push(description);
    }
    if (display_order !== undefined) {
      updateFields.push('display_order = ?');
      bindings.push(display_order);
    }
    bindings.push(itemId);

    if (updateFields.length > 0) {
      await env.DB.prepare(
        `UPDATE timeline_items SET ${updateFields.join(', ')} WHERE id = ?`
      )
        .bind(...bindings)
        .run();
    }

    // Update tasks if provided
    if (tasks !== undefined) {
      await env.DB.prepare('DELETE FROM timeline_tasks WHERE timeline_item_id = ?').bind(itemId).run();
      if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          await env.DB.prepare(
            'INSERT INTO timeline_tasks (timeline_item_id, task, display_order) VALUES (?, ?, ?)'
          )
            .bind(itemId, tasks[i], i)
            .run();
        }
      }
    }

    // Update tech if provided
    if (tech !== undefined) {
      await env.DB.prepare('DELETE FROM timeline_tech WHERE timeline_item_id = ?').bind(itemId).run();
      if (tech.length > 0) {
        for (let i = 0; i < tech.length; i++) {
          await env.DB.prepare(
            'INSERT INTO timeline_tech (timeline_item_id, tech_name, display_order) VALUES (?, ?, ?)'
          )
            .bind(itemId, tech[i], i)
            .run();
        }
      }
    }

    // Update media if provided
    if (media !== undefined) {
      await env.DB.prepare('DELETE FROM timeline_media WHERE timeline_item_id = ?').bind(itemId).run();
      if (media.length > 0) {
        for (let i = 0; i < media.length; i++) {
          await env.DB.prepare(
            'INSERT INTO timeline_media (timeline_item_id, image_id, display_order) VALUES (?, ?, ?)'
          )
            .bind(itemId, media[i], i)
            .run();
        }
      }
    }

    // Fetch updated timeline item
    const updatedItem = await env.DB.prepare('SELECT * FROM timeline_items WHERE id = ?')
      .bind(itemId)
      .first();

    const tasksResult = await env.DB.prepare(
      `SELECT task FROM timeline_tasks WHERE timeline_item_id = ? ORDER BY display_order ASC`
    ).bind(itemId).all();
    updatedItem.tasks = tasksResult.results?.map((t: any) => t.task) || [];

    const techResult = await env.DB.prepare(
      `SELECT tech_name FROM timeline_tech WHERE timeline_item_id = ? ORDER BY display_order ASC`
    ).bind(itemId).all();
    updatedItem.tech = techResult.results?.map((t: any) => t.tech_name) || [];

    const mediaResult = await env.DB.prepare(
      `SELECT m.id, m.url, m.alt_text FROM timeline_media tm
       INNER JOIN media m ON tm.image_id = m.id
       WHERE tm.timeline_item_id = ?
       ORDER BY tm.display_order ASC`
    ).bind(itemId).all();
    updatedItem.media = mediaResult.results || [];

    return jsonResponse({
      success: true,
      data: updatedItem,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/works/[id]/timeline/[itemId] - Delete timeline item
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const workId = parseInt(params.id);
    const itemId = parseInt(params.itemId);

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

    // Check if timeline item exists and belongs to work
    const timelineItem = await env.DB.prepare('SELECT * FROM timeline_items WHERE id = ? AND work_id = ?')
      .bind(itemId, workId)
      .first();

    if (!timelineItem) {
      return errorResponse('Timeline item not found', 404);
    }

    await env.DB.prepare('DELETE FROM timeline_items WHERE id = ?').bind(itemId).run();

    return jsonResponse({
      success: true,
      message: 'Timeline item deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

