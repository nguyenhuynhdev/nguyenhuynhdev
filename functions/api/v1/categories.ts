// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/categories - List all categories
export async function onRequestGet({ env, request }: any) {
  try {
    // Categories are public for selection in blog forms
    const { getAuthUser } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const results = await env.DB.prepare('SELECT * FROM categories ORDER BY name ASC').all();

    const { jsonResponse } = await import('../_utils');
    
    // Use mock data if no results
    if (!results.results || results.results.length === 0) {
      const { loadMockData } = await import('../_mock-data');
      const mockData = await loadMockData('categories');
      return jsonResponse({
        success: true,
        data: mockData.data || [],
      });
    }

    return jsonResponse({
      success: true,
      data: results.results || [],
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// POST /api/v1/categories - Create category
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return errorResponse('Name and slug are required', 400);
    }

    const insertResult = await env.DB.prepare(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)'
    )
      .bind(name, slug, description || null)
      .run();

    const result = await env.DB.prepare('SELECT * FROM categories WHERE id = ?')
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
      return errorResponse('Category already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

