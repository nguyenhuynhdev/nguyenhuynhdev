// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/users/[id]
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const { id } = await params;
    const userId = parseInt(id);
    
    // Users can view their own profile, admin can view any
    if (user.userId !== userId && !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }

    const result = await env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, is_active, last_login_at, created_at, updated_at FROM users WHERE id = ?'
    )
      .bind(userId)
      .first();

    if (!result) {
      return errorResponse('User not found', 404);
    }
    return jsonResponse({
      success: true,
      data: result,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/users/[id]
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const { id } = await params;
    const userId = parseInt(id);
    
    // Users can update their own profile (except role), admin can update any
    if (user.userId !== userId && !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    
    // Only admin can change role
    const body = await request.json();
    if (body.role && !checkRole(user, ['admin'])) {
      return errorResponse('Only admin can change user role', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(body.avatar_url);
    }
    if (body.role !== undefined) {
      updates.push('role = ?');
      values.push(body.role);
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
    }
    if (body.password_hash !== undefined) {
      updates.push('password_hash = ?');
      values.push(body.password_hash);
    }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(userId);

    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?'
    )
      .bind(userId)
      .first();

    return jsonResponse({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/users/[id]
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    const userId = parseInt(id);

    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return jsonResponse({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

