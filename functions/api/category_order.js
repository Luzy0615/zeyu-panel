export async function onRequestGet(context) {
  const { env } = context;
  try {
    const item = await env.DB.prepare("SELECT value FROM app_config WHERE key = 'category_order'").first();
    return new Response(item ? item.value : "[]", { headers: { "Content-Type": "application/json" } });
  } catch (e) { return new Response("[]"); }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const list = await request.json();
    const value = JSON.stringify(list);
    await env.DB.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES ('category_order', ?)").bind(value).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (e) { return new Response(e.message, { status: 500 }); }
}
