export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { order } = await request.json();
    if (!Array.isArray(order)) return new Response("Invalid", { status: 400 });

    const stmts = order.map((id, index) => {
      // 这里的 index 就是你在屏幕上看到的顺序
      return env.DB.prepare("UPDATE sites SET sort_order = ? WHERE id = ?").bind(index, id);
    });

    await env.DB.batch(stmts);
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
