// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/projects - List all projects
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

    let query = `
      SELECT p.*, u.name as created_by_name 
      FROM projects p 
      LEFT JOIN users u ON p.created_by = u.id
    `;
    const conditions: string[] = [];
    const bindings: any[] = [];

    // Add search filter if provided
    const search = url.searchParams.get('search');
    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    // Add status filter if provided
    const status = url.searchParams.get('status');
    if (status) {
      conditions.push('p.status = ?');
      bindings.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const results = await env.DB.prepare(query).bind(...bindings).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM projects p';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await env.DB.prepare(countQuery).bind(...bindings.slice(0, -2)).first();

    // Parse tags for each project and get tag details if tags are slug strings
    const projects = results.results.map((p: any) => {
      let tags = [];
      if (p.tags) {
        try {
          const tagData = JSON.parse(p.tags);
          if (Array.isArray(tagData)) {
            tags = tagData;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      return {
        ...p,
        tags,
      };
    });

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: projects,
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

// POST /api/v1/projects - Create project
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { title, slug, description, content, cover_image, featured, status, tags, created_by } = body;

    if (!title || !slug) {
      return errorResponse('Title and slug are required', 400);
    }

    const insertResult = await env.DB.prepare(
      `INSERT INTO projects (title, slug, description, content, cover_image, featured, status, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      .run();

    const result = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(insertResult.meta.last_row_id)
      .first();

    const { jsonResponse } = await import('../_utils');
    return jsonResponse({
      success: true,
      data: {
        ...result,
        tags: result.tags ? JSON.parse(result.tags) : [],
      },
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    if (err.message?.includes('UNIQUE constraint')) {
      return errorResponse('Slug already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

