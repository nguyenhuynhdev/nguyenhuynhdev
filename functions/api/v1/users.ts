// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/users - List all users
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const results = await env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    )
      .bind(limit, offset)
      .all();

    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM users').first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: results.results || [],
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

// POST /api/v1/users - Create user
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { email, password_hash, name, role = 'viewer' } = body;

    if (!email || !password_hash || !name) {
      return errorResponse('Email, password_hash, and name are required', 400);
    }

    const insertResult = await env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    )
      .bind(email, password_hash, name, role)
      .run();

    const result = await env.DB.prepare(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?'
    )
      .bind(insertResult.meta.last_row_id)
      .first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: result,
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    if (err.message?.includes('UNIQUE constraint')) {
      return errorResponse('Email already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

