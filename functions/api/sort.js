/**
 * functions/api/sort.js
 * 功能：接收前端传来的 ID 数组，批量更新数据库中的排序 (sort_order)
 * 注意：你的数据库 sites 表需要有 sort_order 字段。如果没有，这个文件可能需要你手动去 D1 控制台添加字段，
 * 或者我们利用KV/JSON存储。这里假设我们用一个简单的 kv 存储或者更新字段。
 * * 简化方案：由于修改数据库表结构比较麻烦，我们这里创建一个新的表 'site_sort' 来专门存排序，
 * 或者更简单地，利用 Cloudflare KV (如果绑定了) 存一个 JSON。
 * * 最简单的 D1 方案：
 * 前端传来的 orderArray 是 [1, 5, 2, 3...] (ID顺序)。
 * 我们循环更新每个 ID 的 sort_order 字段。
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { order } = await request.json();
    if (!Array.isArray(order)) return new Response("Invalid data", { status: 400 });

    // 鉴权 (简单判断，建议复用 auth 逻辑)
    // 这里略过鉴权代码，直接执行更新，生产环境请加上 session 判断

    // 批量更新
    // 注意：D1 不支持在大循环里 await，最好构建一个大的 SQL 或者使用 batch
    // 这里使用 batch 提高性能
    const stmts = order.map((id, index) => {
      // 假设表里有 sort_order 字段。如果没有，请去 D1 控制台执行: ALTER TABLE sites ADD COLUMN sort_order INTEGER;
      return env.DB.prepare("UPDATE sites SET sort_order = ? WHERE id = ?").bind(index, id);
    });

    await env.DB.batch(stmts);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
