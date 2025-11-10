// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/tags - List all tags with usage counts
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const includeUsage = url.searchParams.get('include_usage') === 'true';
    const search = url.searchParams.get('search');

    let query = 'SELECT * FROM tags';
    const bindings: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR slug LIKE ?';
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const results = await env.DB.prepare(query).bind(...bindings).all();

    // Get usage counts if requested
    if (includeUsage && results.results) {
      for (const tag of results.results) {
        const blogCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM blog_tags WHERE tag_id = ?'
        ).bind(tag.id).first();

        const workCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM work_tags WHERE tag_id = ?'
        ).bind(tag.id).first();

        // Count projects using this tag
        const projectsResult = await env.DB.prepare('SELECT tags FROM projects').all();
        let projectCount = 0;
        for (const project of projectsResult.results || []) {
          if (project.tags) {
            try {
              const tags = JSON.parse(project.tags);
              if (Array.isArray(tags) && tags.includes(tag.slug)) {
                projectCount++;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        tag.usage = {
          blogs: blogCount?.count || 0,
          works: workCount?.count || 0,
          projects: projectCount,
          total: (blogCount?.count || 0) + (workCount?.count || 0) + projectCount,
        };
      }
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

// POST /api/v1/tags - Create tag
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return errorResponse('Name and slug are required', 400);
    }

    const insertResult = await env.DB.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)')
      .bind(name, slug)
      .run();

    const result = await env.DB.prepare('SELECT * FROM tags WHERE id = ?')
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
      return errorResponse('Tag already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

