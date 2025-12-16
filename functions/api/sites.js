export async function onRequestGet(context) {
  const { env } = context;
  try {
    // 强制按 sort_order 升序排列
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
    const { title, url, desc, icon, category } = body;
    // 新增卡片默认放在最后 (sort_order = 99999)
    const info = await env.DB.prepare(
      "INSERT INTO sites (title, url, desc, icon, category, sort_order) VALUES (?, ?, ?, ?, ?, 99999)"
    ).bind(title, url, desc, icon, category).run();
    return new Response(JSON.stringify(info), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
