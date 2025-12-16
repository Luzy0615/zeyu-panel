/**
 * functions/api/sites.js
 * V72.0 修复：新增卡片时，正确保存 target (打开方式)
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM sites ORDER BY sort_order ASC, id DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    // 获取 target，如果没传则默认为 _self (当前页)
    const { title, url, desc, icon, category, target = '_self' } = body;
    
    // 插入数据包含 target
    const info = await env.DB.prepare(
      "INSERT INTO sites (title, url, desc, icon, category, target, sort_order) VALUES (?, ?, ?, ?, ?, ?, 99999)"
    ).bind(title, url, desc, icon, category, target).run();
    
    return new Response(JSON.stringify(info), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
