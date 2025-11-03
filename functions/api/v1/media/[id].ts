// DELETE /api/v1/media/[id]
export async function onRequestDelete({ env, request, params }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin', 'editor'])) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(parseInt(id)).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media deleted successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

