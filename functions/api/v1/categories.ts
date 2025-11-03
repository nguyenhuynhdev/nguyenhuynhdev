// GET /api/v1/categories - List all categories
export async function onRequestGet({ env, request }: any) {
  try {
    // Categories are public for selection in blog forms
    const { getAuthUser } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const results = await env.DB.prepare('SELECT * FROM categories ORDER BY name ASC').all();

    // Use mock data if no results
    if (!results.results || results.results.length === 0) {
      const { loadMockData } = await import('../../_mock-data');
      const mockData = await loadMockData('categories');
      return new Response(
        JSON.stringify({
          success: true,
          data: mockData.data || [],
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

// POST /api/v1/categories - Create category
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return new Response(JSON.stringify({ error: 'Name and slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?) RETURNING *'
    )
      .bind(name, slug, description || null)
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
    if (err.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ error: 'Category already exists' }), {
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

