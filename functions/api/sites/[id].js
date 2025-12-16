/**
 * functions/api/sites/[id].js
 * 处理单个站点的修改 (PUT) 和 删除 (DELETE)
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;

  try {
    const body = await request.json();
    const { title, url, desc, icon, category, target } = body;

    // 动态构建 SQL，只更新前端发来的字段
    // 这里为了简便，我们假设前端编辑时会发送所有字段
    // 如果 target 为空，默认为 _self
    const finalTarget = target || '_self';

    await env.DB.prepare(
      "UPDATE sites SET title=?, url=?, desc=?, icon=?, category=?, target=? WHERE id=?"
    ).bind(title, url, desc, icon, category, finalTarget, id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;
  try {
    await env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
