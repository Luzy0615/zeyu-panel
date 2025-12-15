export async function onRequestPut(context) {
  const cookie = context.request.headers.get("Cookie");
  if (!cookie || !cookie.includes("user_role=admin")) {
    return new Response("需要管理员权限", { status: 403 });
  }

  try {
    const { oldName, newName } = await context.request.json();
    if (!oldName || !newName) return new Response("Missing parameters", { status: 400 });

    const info = await context.env.DB.prepare(
      "UPDATE sites SET category = ? WHERE category = ?"
    ).bind(newName, oldName).run();

    return Response.json({ message: "Category updated", changes: info.meta.changes });
  } catch (err) { return new Response(err.message, { status: 500 }); }
}
