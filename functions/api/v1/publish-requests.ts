// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/publish-requests - List publish requests
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const requests = await env.DB.prepare(
      `SELECT 
        pr.*,
        u1.name as requested_by_name,
        u1.email as requested_by_email,
        u2.name as reviewed_by_name
      FROM publish_requests pr
      LEFT JOIN users u1 ON pr.requested_by = u1.id
      LEFT JOIN users u2 ON pr.reviewed_by = u2.id
      WHERE pr.status = ?
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?`
    )
      .bind(status, limit, offset)
      .all();

    // Get content details for each request
    for (const req of requests.results) {
      if (req.content_type === 'blog') {
        const blog = await env.DB.prepare(
          `SELECT id, title, slug, status FROM blogs WHERE id = ?`
        ).bind(req.content_id).first();
        req.content = blog;
      } else if (req.content_type === 'work') {
        const work = await env.DB.prepare(
          `SELECT id, title, slug, status FROM works WHERE id = ?`
        ).bind(req.content_id).first();
        req.content = work;
      }
    }

    // Get total count
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM publish_requests WHERE status = ?'
    ).bind(status).first();

    return jsonResponse({
      success: true,
      data: requests.results || [],
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

// PUT /api/v1/publish-requests/[id] - Approve/Reject request
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const requestId = parseInt(params.id);
    const body = await request.json();

    const { status, admin_notes } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    // Get publish request
    const publishRequest = await env.DB.prepare('SELECT * FROM publish_requests WHERE id = ?')
      .bind(requestId)
      .first();

    if (!publishRequest) {
      return errorResponse('Publish request not found', 404);
    }

    // Update publish request
    await env.DB.prepare(
      `UPDATE publish_requests 
       SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = ?
       WHERE id = ?`
    )
      .bind(status, admin_notes || null, user.userId, new Date().toISOString(), requestId)
      .run();

    // Update content status
    if (status === 'approved') {
      if (publishRequest.content_type === 'blog') {
        await env.DB.prepare(
          `UPDATE blogs 
           SET status = 'published', published_at = COALESCE(published_at, datetime('now'))
           WHERE id = ?`
        ).bind(publishRequest.content_id).run();
      } else if (publishRequest.content_type === 'work') {
        await env.DB.prepare(
          `UPDATE works 
           SET status = 'published', published_at = COALESCE(published_at, datetime('now'))
           WHERE id = ?`
        ).bind(publishRequest.content_id).run();
      }

      // Create notification for requester
      await env.DB.prepare(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, ?)`
      )
        .bind(
          publishRequest.requested_by,
          'Publish Request Approved',
          `Your ${publishRequest.content_type} has been approved and published`,
          'success'
        )
        .run();
    } else {
      // Create notification for requester
      await env.DB.prepare(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, ?)`
      )
        .bind(
          publishRequest.requested_by,
          'Publish Request Rejected',
          `Your ${publishRequest.content_type} publish request has been rejected`,
          'warning'
        )
        .run();
    }

    // Fetch updated request
    const updatedRequest = await env.DB.prepare(
      `SELECT 
        pr.*,
        u1.name as requested_by_name,
        u2.name as reviewed_by_name
      FROM publish_requests pr
      LEFT JOIN users u1 ON pr.requested_by = u1.id
      LEFT JOIN users u2 ON pr.reviewed_by = u2.id
      WHERE pr.id = ?`
    )
      .bind(requestId)
      .first();

    return jsonResponse({
      success: true,
      data: updatedRequest,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


