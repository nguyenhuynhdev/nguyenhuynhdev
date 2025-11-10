// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/analytics - Get analytics data
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'summary';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const contentType = url.searchParams.get('content_type');
    const contentId = url.searchParams.get('content_id');

    let query;
    const bindings: any[] = [];

    switch (type) {
      case 'summary': {
        // Get daily views for the last 30 days
        const views = await env.DB.prepare(
          `SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            event_type
          FROM analytics_events
          WHERE event_type IN ('page_view', 'blog_view', 'work_view', 'project_view')
            AND created_at >= datetime('now', '-30 days')
          GROUP BY DATE(created_at), event_type
          ORDER BY date DESC`
        ).all();

        // Get top pages
        const topPages = await env.DB.prepare(
          `SELECT 
            page_path,
            content_type,
            content_id,
            COUNT(*) as views
          FROM analytics_events
          WHERE event_type IN ('page_view', 'blog_view', 'work_view', 'project_view')
            AND created_at >= datetime('now', '-30 days')
          GROUP BY page_path, content_type, content_id
          ORDER BY views DESC
          LIMIT 10`
        ).all();

        // Get referrers
        const referrers = await env.DB.prepare(
          `SELECT 
            referrer,
            COUNT(*) as count
          FROM analytics_events
          WHERE referrer IS NOT NULL
            AND created_at >= datetime('now', '-30 days')
          GROUP BY referrer
          ORDER BY count DESC
          LIMIT 10`
        ).all();

        // Get device types
        const devices = await env.DB.prepare(
          `SELECT 
            device_type,
            COUNT(*) as count
          FROM analytics_events
          WHERE device_type IS NOT NULL
            AND created_at >= datetime('now', '-30 days')
          GROUP BY device_type
          ORDER BY count DESC`
        ).all();

        return jsonResponse({
          success: true,
          data: {
            views: views.results || [],
            topPages: topPages.results || [],
            referrers: referrers.results || [],
            devices: devices.results || [],
          },
        });
      }

      case 'page_views': {
        query = `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM analytics_events
        WHERE event_type IN ('page_view', 'blog_view', 'work_view', 'project_view')`;
        
        if (startDate) {
          query += ' AND created_at >= ?';
          bindings.push(startDate);
        }
        if (endDate) {
          query += ' AND created_at <= ?';
          bindings.push(endDate);
        }
        if (contentType && contentId) {
          query += ' AND content_type = ? AND content_id = ?';
          bindings.push(contentType, parseInt(contentId));
        }

        query += ` GROUP BY DATE(created_at)
                   ORDER BY date DESC
                   LIMIT 100`;

        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse({
          success: true,
          data: result.results || [],
        });
      }

      case 'top_pages': {
        query = `SELECT 
          page_path,
          content_type,
          content_id,
          COUNT(*) as views
        FROM analytics_events
        WHERE event_type IN ('page_view', 'blog_view', 'work_view', 'project_view')`;

        if (startDate) {
          query += ' AND created_at >= ?';
          bindings.push(startDate);
        }
        if (endDate) {
          query += ' AND created_at <= ?';
          bindings.push(endDate);
        }

        query += ` GROUP BY page_path, content_type, content_id
                   ORDER BY views DESC
                   LIMIT 50`;

        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse({
          success: true,
          data: result.results || [],
        });
      }

      default:
        return errorResponse('Invalid analytics type', 400);
    }
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

// POST /api/v1/analytics - Track event
export async function onRequestPost({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../_utils');
    const user = getAuthUser(request);
    const body = await request.json();

    const {
      event_type,
      content_type,
      content_id,
      page_path,
      referrer,
      device_type,
    } = body;

    if (!event_type) {
      return errorResponse('Event type is required', 400);
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Simple device detection
    let detectedDeviceType = device_type;
    if (!detectedDeviceType) {
      if (userAgent.includes('Mobile')) {
        detectedDeviceType = 'mobile';
      } else if (userAgent.includes('Tablet')) {
        detectedDeviceType = 'tablet';
      } else {
        detectedDeviceType = 'desktop';
      }
    }

    await env.DB.prepare(
      `INSERT INTO analytics_events (
        event_type, content_type, content_id, page_path, referrer,
        user_agent, ip_address, device_type, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        event_type,
        content_type || null,
        content_id ? parseInt(content_id) : null,
        page_path || null,
        referrer || null,
        userAgent,
        ipAddress,
        detectedDeviceType,
        user?.userId || null
      )
      .run();

    return jsonResponse({
      success: true,
      message: 'Event tracked',
    }, 201);
  } catch (err: any) {
    const { errorResponse } = await import('../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}


