// GET /api/v1/projects - List all projects
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
      `SELECT p.*, u.name as created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM projects').first();

    return new Response(
      JSON.stringify({
        success: true,
        data: results.results.map((p: any) => ({
          ...p,
          tags: p.tags ? JSON.parse(p.tags) : [],
        })),
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/v1/projects - Create project
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { title, slug, description, content, cover_image, featured, status, tags, created_by } = body;

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      `INSERT INTO projects (title, slug, description, content, cover_image, featured, status, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
      .bind(
        title,
        slug,
        description || null,
        content || null,
        cover_image || null,
        featured ? 1 : 0,
        status || 'draft',
        tags ? JSON.stringify(tags) : '[]',
        created_by || null
      )
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...result,
          tags: result.tags ? JSON.parse(result.tags) : [],
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

