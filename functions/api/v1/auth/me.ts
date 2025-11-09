import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function extractToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.auth_token) {
      return cookies.auth_token;
    }
  }

  return null;
}

// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestGet({ env, request }: any) {
  try {
    const { errorResponse, jsonResponse } = await import('../../_utils');
    
    const token = extractToken(request);
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const userResult = await env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?'
    )
      .bind(decoded.userId)
      .first();

    if (!userResult) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse({
      success: true,
      data: userResult,
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse('Unauthorized', 401);
  }
}

