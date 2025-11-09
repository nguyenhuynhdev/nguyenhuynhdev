// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/media - List all media
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const results = await env.DB.prepare(
      `SELECT m.*, u.name as uploaded_by_name 
       FROM media m 
       LEFT JOIN users u ON m.uploaded_by = u.id 
       ORDER BY m.created_at DESC LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM media').first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: results.results,
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

// POST /api/v1/media - Create media entry
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { filename, original_filename, file_type, file_size, url, uploaded_by } = body;

    if (!filename || !original_filename || !file_type || !url) {
      return errorResponse('All fields are required', 400);
    }

    const insertResult = await env.DB.prepare(
      `INSERT INTO media (filename, original_filename, file_type, file_size, url, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(filename, original_filename, file_type, file_size || 0, url, uploaded_by || null)
      .run();

    const result = await env.DB.prepare('SELECT * FROM media WHERE id = ?')
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

