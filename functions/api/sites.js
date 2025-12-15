export async function onRequestGet(context) {
  try {
    // 按 ID 倒序排列，新加的在前面
    const { results } = await context.env.DB.prepare("SELECT * FROM sites ORDER BY id DESC").all();
    return Response.json(results);
  } catch (e) {
    return Response.json([]);
  }
}

export async function onRequestPost(context) {
  try {
    // 增加了 category 字段
    const { title, desc, url, icon, category } = await context.request.json();
    const finalCat = category || '默认分类'; // 防止为空

    const info = await context.env.DB.prepare(
      "INSERT INTO sites (title, desc, url, icon, category) VALUES (?, ?, ?, ?, ?)"
    ).bind(title, desc, url, icon, finalCat).run();
    
    return Response.json({ message: "Success", id: info.meta.last_row_id });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
