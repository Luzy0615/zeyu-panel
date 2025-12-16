/**
 * functions/api/sites.js
 * V67.0: 新增时支持 target 字段
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
    // 获取 target，默认为 _self
    const { title, url, desc, icon, category, target = '_self' } = body;
    
    const info = await env.DB.prepare(
      "INSERT INTO sites (title, url, desc, icon, category, target, sort_order) VALUES (?, ?, ?, ?, ?, ?, 99999)"
    ).bind(title, url, desc, icon, category, target).run();
    
    return new Response(JSON.stringify(info), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
