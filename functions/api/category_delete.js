/**
 * functions/api/category_delete.js
 * 接收 ?name=分类名，删除该分类下的所有站点
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (!name) return new Response("Missing name", { status: 400 });

  try {
    // 执行 SQL 删除
    await env.DB.prepare("DELETE FROM sites WHERE category = ?").bind(name).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
