// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/works/[id]/privacy - Get work privacy policy
export async function onRequestGet({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse, jsonResponse } = await import('../../../_utils');
    const user = getAuthUser(request);
    const workId = parseInt(params.id);

    const work = await env.DB.prepare(
      `SELECT id, title, privacy_policy, status, author_id FROM works WHERE id = ?`
    )
      .bind(workId)
      .first();

    if (!work) {
      return errorResponse('Work not found', 404);
    }

    // Check permissions - privacy policy is only visible for published works or if user is author/admin
    if (work.status !== 'published' && (!user || (work.author_id !== user.userId && !checkRole(user, ['admin'])))) {
      return errorResponse('Forbidden', 403);
    }

    // Default template if privacy_policy is NULL
    const privacyPolicy = work.privacy_policy || 
      `<h2>Temporary Privacy Policy for ${work.title}</h2>
      <p>This work follows the general privacy standards of the application.</p>
      <p>Data collected during this project is limited to analytics and user feedback.</p>
      <p>By interacting with this content, you agree to the app's general terms of use.</p>`;

    return jsonResponse({
      success: true,
      data: {
        id: work.id,
        title: work.title,
        privacy_policy: privacyPolicy,
      },
    });
  } catch (err: any) {
    const { errorResponse } = await import('../../../_utils');
    return errorResponse(err.message || 'Request failed', 500);
  }
}

