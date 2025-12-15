export async function onRequestPut(context) {
  try {
    const { oldName, newName } = await context.request.json();
    
    if (!oldName || !newName) {
      return new Response("Missing parameters", { status: 400 });
    }

    // 执行批量更新 SQL
    const info = await context.env.DB.prepare(
      "UPDATE sites SET category = ? WHERE category = ?"
    ).bind(newName, oldName).run();

    return Response.json({ 
      message: "Category updated", 
      changes: info.meta.changes 
    });
    
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
