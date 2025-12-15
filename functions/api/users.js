export async function onRequest(context) {
  const { request, env } = context;
  
  // 权限检查：只有 admin 能操作此接口
  const cookie = request.headers.get("Cookie");
  const role = cookie && cookie.includes("user_role=admin") ? "admin" : "guest";
  
  if (role !== 'admin') {
    return new Response("Permission denied", { status: 403 });
  }

  // GET: 获取所有用户列表
  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, username, role FROM users").all();
    return Response.json(results);
  }

  // PUT: 修改用户权限
  if (request.method === "PUT") {
    const { id, newRole } = await request.json();
    if (id === 1) return new Response("不能修改超级管理员权限", { status: 400 }); // 保护 admin
    
    await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(newRole, id).run();
    return Response.json({ message: "Updated" });
  }

  return new Response("Method not allowed", { status: 405 });
}
