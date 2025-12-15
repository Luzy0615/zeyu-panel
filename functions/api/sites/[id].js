export async function onRequestDelete(context) {
  const id = context.params.id;
  await context.env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
  return Response.json({ message: "Deleted" });
}

export async function onRequestPut(context) {
  const id = context.params.id;
  const { title, desc, url, icon } = await context.request.json();
  await context.env.DB.prepare(
    "UPDATE sites SET title = ?, desc = ?, url = ?, icon = ? WHERE id = ?"
  ).bind(title, desc, url, icon, id).run();
  return Response.json({ message: "Updated" });
}
