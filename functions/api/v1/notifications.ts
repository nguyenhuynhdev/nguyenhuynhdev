// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/notifications - Get notifications
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const url = new URL(request.url);
    // Use authenticated user's ID
    const userId = user.userId;
    const unreadOnly = url.searchParams.get('unread') === 'true';

    let query = 'SELECT * FROM notifications';
    const params: any[] = [];

    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
      if (unreadOnly) {
        query += ' AND read = 0';
      }
    } else if (unreadOnly) {
      query += ' WHERE read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const results = await env.DB.prepare(query).bind(...params).all();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: results.results || [],
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// POST /api/v1/notifications - Create notification
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { user_id, title, message, type = 'info' } = body;

    if (!user_id || !title || !message) {
      return errorResponse('user_id, title, and message are required', 400);
    }

    const insertResult = await env.DB.prepare(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)'
    )
      .bind(user_id, title, message, type)
      .run();

    const result = await env.DB.prepare('SELECT * FROM notifications WHERE id = ?')
      .bind(insertResult.meta.last_row_id)
      .first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: result,
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/notifications - Mark as read/unread
export async function onRequestPut({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const body = await request.json();
    const { ids, read } = body;
    const userId = user.userId;

    if (typeof read !== 'boolean') {
      return errorResponse('read boolean is required', 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      // Mark all for user as read/unread
      await env.DB.prepare('UPDATE notifications SET read = ? WHERE user_id = ?')
        .bind(read ? 1 : 0, userId)
        .run();
    } else {
      // Mark specific notifications (only user's own notifications)
      const placeholders = ids.map(() => '?').join(',');
      await env.DB.prepare(
        `UPDATE notifications SET read = ? WHERE id IN (${placeholders}) AND user_id = ?`
      )
        .bind(read ? 1 : 0, ...ids, userId)
        .run();
    }

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      message: 'Notifications updated',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

