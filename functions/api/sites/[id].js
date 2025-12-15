export async function onRequestDelete(context) {
  const id = context.params.id;
  await context.env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  return Response.json({ message: "Deleted" });
}

export async function onRequestPut(context) {
  const id = context.params.id;
  // 增加了 category 字段
  const { title, desc, url, icon, category } = await context.request.json();
  const finalCat = category || '默认分类';

  await context.env.DB.prepare(
    "UPDATE sites SET title = ?, desc = ?, url = ?, icon = ?, category = ? WHERE id = ?"
  ).bind(title, desc, url, icon, finalCat, id).run();
  
  return Response.json({ message: "Updated" });
}
