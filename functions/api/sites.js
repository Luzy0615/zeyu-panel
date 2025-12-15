export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM sites ORDER BY id DESC").all();
    return Response.json(results);
  } catch (e) { return Response.json([]); }
}

export async function onRequestPost(context) {
  // === 权限检查开始 ===
  const cookie = context.request.headers.get("Cookie");
  if (!cookie || !cookie.includes("user_role=admin")) {
    return new Response("无权操作：需要管理员权限", { status: 403 });
  }
  // === 权限检查结束 ===

  try {
    const { title, desc, url, icon, category } = await context.request.json();
    const finalCat = category || '默认分类';
    const info = await context.env.DB.prepare(
      "INSERT INTO sites (title, desc, url, icon, category) VALUES (?, ?, ?, ?, ?)"
    ).bind(title, desc, url, icon, finalCat).run();
    return Response.json({ message: "Success", id: info.meta.last_row_id });
  } catch (err) { return new Response(err.message, { status: 500 }); }
}
