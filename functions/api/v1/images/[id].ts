// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/images/[id] - Get single image
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const imageId = parseInt(params.id);

    const image = await env.DB.prepare(
      `SELECT 
        m.*,
        u.name as uploaded_by_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.id = ?`
    )
      .bind(imageId)
      .first();

    if (!image) {
      return errorResponse('Image not found', 404);
    }

    // Get usage information
    const blogUsage = await env.DB.prepare(
      `SELECT b.id, b.title, b.slug FROM blogs b
       WHERE b.cover_image = ? OR b.id IN (
         SELECT blog_id FROM blog_gallery WHERE image_id = ?
       )`
    ).bind(image.url, imageId).all();
    image.used_in_blogs = blogUsage.results || [];

    const workUsage = await env.DB.prepare(
      `SELECT w.id, w.title, w.slug FROM works w
       WHERE w.cover_image_id = ? OR w.id IN (
         SELECT work_id FROM work_gallery WHERE image_id = ?
       )`
    ).bind(imageId, imageId).all();
    image.used_in_works = workUsage.results || [];

    const projectUsage = await env.DB.prepare(
      `SELECT p.id, p.title, p.slug FROM projects p
       WHERE p.cover_image = ?`
    ).bind(image.url).all();
    image.used_in_projects = projectUsage.results || [];

    return jsonResponse({
      success: true,
      data: image,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// PUT /api/v1/images/[id] - Update image metadata
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const imageId = parseInt(params.id);
    const body = await request.json();

    const { alt_text } = body;

    const updateFields: string[] = [];
    const bindings: any[] = [];

    if (alt_text !== undefined) {
      updateFields.push('alt_text = ?');
      bindings.push(alt_text);
    }

    if (updateFields.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    bindings.push(imageId);

    await env.DB.prepare(
      `UPDATE media SET ${updateFields.join(', ')} WHERE id = ?`
    )
      .bind(...bindings)
      .run();

    // Fetch updated image
    const updatedImage = await env.DB.prepare('SELECT * FROM media WHERE id = ?')
      .bind(imageId)
      .first();

    return jsonResponse({
      success: true,
      data: updatedImage,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// DELETE /api/v1/images/[id] - Delete image
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const imageId = parseInt(params.id);

    // Get image info
    const image = await env.DB.prepare('SELECT * FROM media WHERE id = ?')
      .bind(imageId)
      .first();

    if (!image) {
      return errorResponse('Image not found', 404);
    }

    // Delete from Cloudflare Images if cloudflare_image_id exists
    if (image.cloudflare_image_id) {
      const cloudflareAccountId = env.CLOUDFLARE_ACCOUNT_ID;
      const cloudflareApiToken = env.CLOUDFLARE_API_TOKEN;

      if (cloudflareAccountId && cloudflareApiToken) {
        try {
          await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1/${image.cloudflare_image_id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${cloudflareApiToken}`,
              },
            }
          );
        } catch (err) {
          // Log error but continue with database deletion
          console.error('Failed to delete from Cloudflare Images:', err);
        }
      }
    }

    // Delete from database
    await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(imageId).run();

    return jsonResponse({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


