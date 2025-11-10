// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/images - List images
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const uploadedBy = url.searchParams.get('uploaded_by');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        m.*,
        u.name as uploaded_by_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE 1=1
    `;
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (search) {
      conditions.push('(m.filename LIKE ? OR m.original_filename LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    if (uploadedBy) {
      conditions.push('m.uploaded_by = ?');
      bindings.push(parseInt(uploadedBy));
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const images = await env.DB.prepare(query).bind(...bindings).all();

    // Get usage information for each image
    for (const image of images.results) {
      // Check blogs
      const blogUsage = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM blogs WHERE cover_image = ? OR id IN (
          SELECT blog_id FROM blog_gallery WHERE image_id = ?
        )`
      ).bind(image.url, image.id).first();
      image.used_in_blogs = blogUsage?.count || 0;

      // Check works
      const workUsage = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM works WHERE cover_image_id = ? OR id IN (
          SELECT work_id FROM work_gallery WHERE image_id = ?
        )`
      ).bind(image.id, image.id).first();
      image.used_in_works = workUsage?.count || 0;

      // Check projects
      const projectUsage = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM projects WHERE cover_image = ?`
      ).bind(image.url).first();
      image.used_in_projects = projectUsage?.count || 0;
    }

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM media m WHERE 1=1`;
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await env.DB.prepare(countQuery).bind(...bindings.slice(0, -2)).first();

    return jsonResponse({
      success: true,
      data: images.results || [],
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

// POST /api/v1/images - Upload image (via Cloudflare Images)
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('alt_text') as string;

    if (!file) {
      return errorResponse('File is required', 400);
    }

    // Upload to Cloudflare Images
    const cloudflareAccountId = env.CLOUDFLARE_ACCOUNT_ID;
    const cloudflareApiToken = env.CLOUDFLARE_API_TOKEN;

    if (!cloudflareAccountId || !cloudflareApiToken) {
      return errorResponse('Cloudflare Images not configured', 500);
    }

    // Create form data for Cloudflare Images API
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    // Upload to Cloudflare Images
    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
        },
        body: cloudflareFormData,
      }
    );

    if (!cloudflareResponse.ok) {
      const error = await cloudflareResponse.json();
      return errorResponse(`Cloudflare Images upload failed: ${error.errors?.[0]?.message || 'Unknown error'}`, 500);
    }

    const cloudflareData = await cloudflareResponse.json();
    const imageData = cloudflareData.result;

    // Save to database
    const insertResult = await env.DB.prepare(
      `INSERT INTO media (
        filename, original_filename, file_type, file_size, url,
        cloudflare_image_id, cloudflare_variant, width, height, alt_text, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        imageData.filename || file.name,
        file.name,
        file.type,
        file.size,
        imageData.variants?.[0] || imageData.id, // Use first variant or ID as URL
        imageData.id,
        'public', // Default variant
        imageData.width || null,
        imageData.height || null,
        altText || null,
        user.userId
      )
      .run();

    const mediaId = insertResult.meta.last_row_id;

    // Fetch created media
    const newMedia = await env.DB.prepare('SELECT * FROM media WHERE id = ?')
      .bind(mediaId)
      .first();

    return jsonResponse({
      success: true,
      data: newMedia,
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


