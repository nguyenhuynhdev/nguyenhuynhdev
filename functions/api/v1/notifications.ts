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

    return new Response(
      JSON.stringify({
        success: true,
        data: results.results || [],
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
      return new Response(
        JSON.stringify({ error: 'user_id, title, and message are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await env.DB.prepare(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?) RETURNING *'
    )
      .bind(user_id, title, message, type)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 201,
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
      return new Response(JSON.stringify({ error: 'read boolean is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications updated',
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

