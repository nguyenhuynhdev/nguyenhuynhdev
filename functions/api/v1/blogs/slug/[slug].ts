// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/blogs/slug/[slug] - Get blog by slug
export async function onRequestGet({ env, params }: any) {
  try {
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

    const { errorResponse, jsonResponse } = await import('../../../_utils');
    
    if (!blog) {
      return errorResponse('Blog not found', 404);
    }

    const tags = await env.DB.prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       INNER JOIN blog_tags bt ON t.id = bt.tag_id
       WHERE bt.blog_id = ?`
    )
      .bind(blog.id)
      .all();

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

