// 辅助函数：检查权限
function checkAdmin(request) {
  const cookie = request.headers.get("Cookie");
  return cookie && cookie.includes("user_role=admin");
}

export async function onRequestDelete(context) {
  if (!checkAdmin(context.request)) return new Response("需要管理员权限", { status: 403 });
  
  const id = context.params.id;
  await context.env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  return Response.json({ message: "Deleted" });
}

export async function onRequestPut(context) {
  if (!checkAdmin(context.request)) return new Response("需要管理员权限", { status: 403 });

  const id = context.params.id;
  const { title, desc, url, icon, category } = await context.request.json();
  const finalCat = category || '默认分类';

  await context.env.DB.prepare(
    "UPDATE sites SET title = ?, desc = ?, url = ?, icon = ?, category = ? WHERE id = ?"
  ).bind(title, desc, url, icon, finalCat, id).run();
  
  return Response.json({ message: "Updated" });
}
