// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// PUT /api/v1/comments/[id] - Update comment (moderation)
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const commentId = parseInt(params.id);
    const body = await request.json();

    const { status, content } = body;

    if (!status || !['pending', 'approved', 'rejected', 'spam'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const updateFields: string[] = [];
    const bindings: any[] = [];

    if (status) {
      updateFields.push('status = ?');
      bindings.push(status);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      bindings.push(content);
    }
    updateFields.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    bindings.push(commentId);

    await env.DB.prepare(
      `UPDATE comments SET ${updateFields.join(', ')} WHERE id = ?`
    )
      .bind(...bindings)
      .run();

    // Fetch updated comment
    const updatedComment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?')
      .bind(commentId)
      .first();

    return jsonResponse({
      success: true,
      data: updatedComment,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/comments/[id] - Delete comment
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const commentId = parseInt(params.id);

    await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run();

    return jsonResponse({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


