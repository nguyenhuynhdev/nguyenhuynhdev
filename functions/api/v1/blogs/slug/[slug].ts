// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/blogs/slug/[slug] - Get blog by slug
export async function onRequestGet({ env, params, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../../_utils');
    // Allow public access - try to get user but don't require authentication
    let user = null;
    try {
      if (request) {
        user = getAuthUser(request);
      }
    } catch {
      // Ignore auth errors for public access
      user = null;
    }
    const { slug } = await params;

    const blog = await env.DB.prepare(
      `SELECT 
        b.*, u.name as author_name, u.avatar_url as author_avatar,
        c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.slug = ?`
    )
      .bind(slug)
      .first();
    
    if (!blog) {
      return errorResponse('Blog not found', 404);
    }

    // Public access: only show published blogs, or allow authenticated users to see their own
    if (blog.status !== 'published') {
      if (!user || (blog.author_id !== user.userId && !checkRole(user, ['admin']))) {
        return errorResponse('Blog not found', 404); // Don't reveal existence of unpublished blogs
      }
    }

    const tags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN blog_tags bt ON t.id = bt.tag_id
       WHERE bt.blog_id = ?`
    )
      .bind(blog.id)
      .all();

    // Increment view count if published and not author/admin viewing
    if (blog.status === 'published' && (!user || blog.author_id !== user.userId)) {
      await env.DB.prepare('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?')
        .bind(blog.id)
        .run();
      blog.view_count = (blog.view_count || 0) + 1;
    }

    return jsonResponse({
      success: true,
      data: {
        ...blog,
        tags: tags.results || [],
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

