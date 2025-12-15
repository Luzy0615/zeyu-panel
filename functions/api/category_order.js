/**
 * functions/api/category_order.js
 * 专门用于存取分类的排序数组
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const item = await env.DB.prepare("SELECT value FROM app_config WHERE key = 'category_order'").first();
    const order = item ? JSON.parse(item.value) : [];
    return new Response(JSON.stringify(order), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response("[]", { headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const list = await request.json();
    const value = JSON.stringify(list);
    // 插入或更新
    await env.DB.prepare(
      "INSERT INTO app_config (key, value) VALUES ('category_order', ?) ON CONFLICT(key) DO UPDATE SET value = ?"
    ).bind(value, value).run();
    
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
