// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/projects/[id]
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const { id } = await params;
    const project = await env.DB.prepare(
      `SELECT p.*, u.name as created_by_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`
    )
      .bind(parseInt(id))
      .first();
    
    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return jsonResponse({
      success: true,
      data: {
        ...project,
        tags: project.tags ? JSON.parse(project.tags) : [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/projects/[id]
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    const body = await request.json();

    const updates: string[] = [];
    const values: any[] = [];

    ['title', 'slug', 'description', 'content', 'cover_image', 'status'].forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    });

    if (body.featured !== undefined) {
      updates.push('featured = ?');
      values.push(body.featured ? 1 : 0);
    }

    if (body.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(body.tags));
    }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(parseInt(id));

    await env.DB.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(parseInt(id))
      .first();

    return jsonResponse({
      success: true,
      data: {
        ...updated,
        tags: updated.tags ? JSON.parse(updated.tags) : [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/projects/[id]
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(parseInt(id)).run();
    return jsonResponse({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

