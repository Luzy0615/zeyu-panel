/**
 * functions/api/sites.js
 * V54.0: 获取时强制按 sort_order 排序
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    // 核心修改：增加了 ORDER BY sort_order ASC
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
    // 新增时，sort_order 默认为 9999 或者 0
    const info = await env.DB.prepare(
      "INSERT INTO sites (title, url, desc, icon, category, sort_order) VALUES (?, ?, ?, ?, ?, 0)"
    ).bind(title, url, desc, icon, category).run();
    return new Response(JSON.stringify(info), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}

export async function onRequestPut(context) {
    // 这里的 PUT 主要用于单条更新，暂不需要变动，为了完整性建议保留你原有的或自行补充
    // 如果你之前的 sites/[id].js 已经处理了更新，这里可以忽略，
    // 关键是上面的 onRequestGet
    return new Response("Use /api/sites/[id] for updates", {status: 405});
}
