// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost({ env, request }: any) {

  try {
    const body = await request.json();
    const { email } = body;

    const { errorResponse, jsonResponse } = await import('../../_utils');
    
    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Check if user exists
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    // For security, always return success even if user doesn't exist
    // In production, send recovery email here
    if (user) {
      // TODO: Send password reset email
      // For now, just log it
      console.log(`Password reset requested for: ${email}`);
    }

    return jsonResponse({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

