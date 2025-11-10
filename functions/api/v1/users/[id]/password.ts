// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// PUT /api/v1/users/[id]/password - Change password
export async function onRequestPut({ env, request, params }: any) {
  try {
    const { getAuthUser, errorResponse, jsonResponse } = await import('../../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Users can only change their own password
    if (user.userId !== userId) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return errorResponse('Current password and new password are required', 400);
    }

    if (new_password.length < 6) {
      return errorResponse('New password must be at least 6 characters', 400);
    }

    // Get user from database
    const userResult = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!userResult) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const bcrypt = await import('bcryptjs');
    const passwordValid = await bcrypt.compare(current_password, userResult.password_hash);

    if (!passwordValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(newPasswordHash, userId)
      .run();

    return jsonResponse({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

