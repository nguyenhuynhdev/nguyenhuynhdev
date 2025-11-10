// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('./_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST /api/v1/blogs/[id]/like - Toggle like on blog
export async function onRequestPost({ env, request, params }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('./_utils');
    const user = getAuthUser(request);
    const blogId = parseInt(params.id);

    // Get IP address for guest likes
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

    // Check if blog exists
    const blog = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?')
      .bind(blogId)
      .first();

    if (!blog) {
      return errorResponse('Blog not found', 404);
    }

    // Check if already liked
    let likeQuery = 'SELECT * FROM blog_likes WHERE blog_id = ?';
    const likeBindings: any[] = [blogId];

    if (user) {
      likeQuery += ' AND user_id = ?';
      likeBindings.push(user.userId);
    } else {
      likeQuery += ' AND ip_address = ? AND user_id IS NULL';
      likeBindings.push(ipAddress);
    }

    const existingLike = await env.DB.prepare(likeQuery).bind(...likeBindings).first();

    if (existingLike) {
      // Unlike: Delete like and decrement count
      await env.DB.prepare('DELETE FROM blog_likes WHERE id = ?').bind(existingLike.id).run();
      await env.DB.prepare('UPDATE blogs SET likes_count = likes_count - 1 WHERE id = ?').bind(blogId).run();

      const updatedBlog = await env.DB.prepare('SELECT likes_count FROM blogs WHERE id = ?').bind(blogId).first();

      return jsonResponse({
        success: true,
        liked: false,
        likesCount: updatedBlog?.likes_count || 0,
      });
    } else {
      // Like: Add like and increment count
      await env.DB.prepare(
        'INSERT INTO blog_likes (blog_id, user_id, ip_address) VALUES (?, ?, ?)'
      )
        .bind(blogId, user?.userId || null, user ? null : ipAddress)
        .run();

      await env.DB.prepare('UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?').bind(blogId).run();

      const updatedBlog = await env.DB.prepare('SELECT likes_count FROM blogs WHERE id = ?').bind(blogId).first();

      return jsonResponse({
        success: true,
        liked: true,
        likesCount: updatedBlog?.likes_count || 0,
      }, 201);
    }
  } catch (err: any) {
    const { errorResponse } = await import('./_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

