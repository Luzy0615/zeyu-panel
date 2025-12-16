/**
 * functions/api/category_order.js
 * 负责读取和保存分类的排序数组
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    // 读取配置
    const item = await env.DB.prepare("SELECT value FROM app_config WHERE key = 'category_order'").first();
    // 如果数据库没存过，返回空数组
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
    if (!Array.isArray(list)) return new Response("Invalid data", { status: 400 });
    
    const value = JSON.stringify(list);
    
    // 使用 INSERT OR REPLACE 确保无论是否存在都是更新
    await env.DB.prepare(
      "INSERT OR REPLACE INTO app_config (key, value) VALUES ('category_order', ?)"
    ).bind(value).run();
    
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
