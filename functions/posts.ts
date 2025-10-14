export async function onRequestGet({ env }: any) {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM posts").all();

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