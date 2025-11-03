// GET /api/v1/media - List all media
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse } = await import('../../_utils');
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

    return new Response(
      JSON.stringify({
        success: true,
        data: results.results,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
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

// POST /api/v1/media - Create media entry
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { filename, original_filename, file_type, file_size, url, uploaded_by } = body;

    if (!filename || !original_filename || !file_type || !url) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      `INSERT INTO media (filename, original_filename, file_type, file_size, url, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    )
      .bind(filename, original_filename, file_type, file_size || 0, url, uploaded_by || null)
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

