/**
 * functions/api/users.js
 * V66.0: 支持更新 allowed_categories
 */
export async function onRequestGet(context) {
  const { env } = context;
  // 获取所有用户，包括 allowed_categories
  const { results } = await env.DB.prepare("SELECT id, username, role, allowed_categories FROM users").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { id, newRole, allowedCategories } = body; // 接收 allowedCategories

    if (newRole) {
        await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(newRole, id).run();
    }
    
    // **关键修改**：如果有传 allowedCategories，则更新
    if (allowedCategories !== undefined) {
        const catStr = JSON.stringify(allowedCategories);
        await env.DB.prepare("UPDATE users SET allowed_categories = ? WHERE id = ?").bind(catStr, id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
