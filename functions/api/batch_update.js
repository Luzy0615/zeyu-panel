/**
 * functions/api/batch_update.js
 * 接收一个对象数组 [{id: 1, sort_order: 0, category: 'Work'}, ...]
 * 批量更新卡片的位置和分类
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const updates = await request.json();
    if (!Array.isArray(updates)) return new Response("Invalid data", { status: 400 });

    const stmts = updates.map(item => {
      // 同时更新 category 和 sort_order，解决跨分类拖拽问题
      return env.DB.prepare("UPDATE sites SET sort_order = ?, category = ? WHERE id = ?")
                   .bind(item.sort_order, item.category, item.id);
    });

    await env.DB.batch(stmts);
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
