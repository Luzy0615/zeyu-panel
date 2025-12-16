/**
 * functions/api/sites/[id].js
 * V72.0 修复：编辑卡片时，正确更新 target (打开方式)
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;

  try {
    const body = await request.json();
    // 确保接收 target 字段
    const { title, url, desc, icon, category, target } = body;

    // 如果前端传来的 target 为空，兜底为 _self
    const finalTarget = target || '_self';

    // 执行 SQL 更新
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
