// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/comments - List comments
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    const url = new URL(request.url);
    const contentType = url.searchParams.get('content_type');
    const contentId = url.searchParams.get('content_id');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM comments WHERE 1=1`;
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (contentType && contentId) {
      conditions.push('content_type = ? AND content_id = ?');
      bindings.push(contentType, parseInt(contentId));
    }

    // Only show approved comments to non-admins, or if admin/editor show all
    if (!checkRole(user, ['admin', 'editor'])) {
      conditions.push('status = "approved"');
    } else if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const comments = await env.DB.prepare(query).bind(...bindings).all();

    // Build threaded structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    for (const comment of comments.results) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    // Second pass: build tree structure
    for (const comment of comments.results) {
      const commentNode = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentNode);
        } else {
          // Parent not in results, treat as root
          rootComments.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    }

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM comments WHERE 1=1`;
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await env.DB.prepare(countQuery).bind(...bindings.slice(0, -2)).first();

    return jsonResponse({
      success: true,
      data: rootComments,
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

// POST /api/v1/comments - Create comment
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    const body = await request.json();

    const {
      content_type,
      content_id,
      parent_id,
      author_name,
      author_email,
      author_website,
      content,
    } = body;

    if (!content_type || !content_id || !author_name || !content) {
      return errorResponse('Content type, content ID, author name, and content are required', 400);
    }

    // Validate content type
    if (!['blog', 'work', 'project'].includes(content_type)) {
      return errorResponse('Invalid content type', 400);
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Rate limiting: Check if same IP has commented recently (simple implementation)
    const recentComment = await env.DB.prepare(
      `SELECT * FROM comments 
       WHERE ip_address = ? 
       AND created_at > datetime('now', '-1 minute')
       ORDER BY created_at DESC
       LIMIT 1`
    ).bind(ipAddress).first();

    if (recentComment) {
      return errorResponse('Please wait before posting another comment', 429);
    }

    // Guest comments are always pending
    const status = user ? 'approved' : 'pending';

    const insertResult = await env.DB.prepare(
      `INSERT INTO comments (
        content_type, content_id, parent_id, author_name, author_email, author_website,
        content, status, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        content_type,
        parseInt(content_id),
        parent_id ? parseInt(parent_id) : null,
        author_name,
        author_email || null,
        author_website || null,
        content,
        status,
        ipAddress,
        userAgent
      )
      .run();

    const commentId = insertResult.meta.last_row_id;

    // Fetch created comment
    const newComment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?')
      .bind(commentId)
      .first();

    // Create notification for content author if comment is pending
    if (status === 'pending') {
      let authorId;
      if (content_type === 'blog') {
        const blog = await env.DB.prepare('SELECT author_id FROM blogs WHERE id = ?')
          .bind(content_id)
          .first();
        authorId = blog?.author_id;
      } else if (content_type === 'work') {
        const work = await env.DB.prepare('SELECT author_id FROM works WHERE id = ?')
          .bind(content_id)
          .first();
        authorId = work?.author_id;
      }

      if (authorId) {
        await env.DB.prepare(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, ?, ?, ?)`
        )
          .bind(
            authorId,
            'New Comment Pending Review',
            `A new comment on your ${content_type} is pending review`,
            'info'
          )
          .run();
      }
    }

    return jsonResponse({
      success: true,
      data: newComment,
      message: status === 'pending' ? 'Comment submitted and pending review' : 'Comment posted successfully',
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


