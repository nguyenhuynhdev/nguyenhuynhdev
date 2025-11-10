// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/tags/[id] - Get single tag with usage info
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const tagId = parseInt(params.id);

    const tag = await env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(tagId)
      .first();

    if (!tag) {
      return errorResponse('Tag not found', 404);
    }

    // Get usage count
    const blogCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM blog_tags WHERE tag_id = ?'
    ).bind(tagId).first();

    const workCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM work_tags WHERE tag_id = ?'
    ).bind(tagId).first();

    // Get projects using this tag (from JSON tags field)
    const projectsResult = await env.DB.prepare('SELECT id, title, slug FROM projects').all();
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

    return jsonResponse({
      success: true,
      data: {
        ...tag,
        usage: {
          blogs: blogCount?.count || 0,
          works: workCount?.count || 0,
          projects: projectCount,
          total: (blogCount?.count || 0) + (workCount?.count || 0) + projectCount,
        },
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/tags/[id] - Update tag
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const tagId = parseInt(params.id);
    const body = await request.json();

    const { name, slug } = body;

    if (!name || !slug) {
      return errorResponse('Name and slug are required', 400);
    }

    await env.DB.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?')
      .bind(name, slug, tagId)
      .run();

    const updatedTag = await env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(tagId)
      .first();

    return jsonResponse({
      success: true,
      data: updatedTag,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    if (err.message?.includes('UNIQUE constraint')) {
      return errorResponse('Tag with this name or slug already exists', 409);
    }
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/tags/[id] - Delete tag
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const tagId = parseInt(params.id);

    // Check if tag is being used
    const blogCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM blog_tags WHERE tag_id = ?'
    ).bind(tagId).first();

    const workCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM work_tags WHERE tag_id = ?'
    ).bind(tagId).first();

    if ((blogCount?.count || 0) > 0 || (workCount?.count || 0) > 0) {
      return errorResponse('Cannot delete tag that is being used', 409);
    }

    await env.DB.prepare('DELETE FROM tags WHERE id = ?').bind(tagId).run();

    return jsonResponse({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

