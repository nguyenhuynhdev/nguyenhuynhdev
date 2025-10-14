export async function onRequestGet({ env, request }: any) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug param" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { results } = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?")
      .bind(slug)
      .all();

    return new Response(JSON.stringify({
      success: true,
      count: results.length,
      data: results,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
