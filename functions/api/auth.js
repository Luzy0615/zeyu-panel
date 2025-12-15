// 简单的 Session 模拟 (实际生产建议用 JWT 或 KV)
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 处理请求
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // === GET: 检查当前登录状态 ===
  if (request.method === "GET") {
    const cookie = request.headers.get("Cookie");
    if (!cookie || !cookie.includes("user_role=")) {
      return Response.json({ role: "guest" });
    }
    // 从 Cookie 解析角色 (简单实现，生产环境应验证 Session)
    const role = cookie.split("user_role=")[1].split(";")[0];
    return Response.json({ role: role });
  }

  // === POST: 登录 ===
  if (request.method === "POST") {
    try {
      const { username, password } = await request.json();
      
      // 查询数据库
      const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
        .bind(username, password).first();

      if (!user) {
        return new Response(JSON.stringify({ error: "账号或密码错误" }), { status: 401 });
      }

      // 设置 Cookie (HttpOnly)
      const headers = new Headers();
      headers.append("Set-Cookie", `user_role=${user.role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      
      return new Response(JSON.stringify({ message: "Login success", role: user.role }), { 
        headers: headers 
      });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }

  // === DELETE: 注销 ===
  if (request.method === "DELETE") {
    const headers = new Headers();
    headers.append("Set-Cookie", `user_role=; Path=/; HttpOnly; Max-Age=0`);
    return new Response(JSON.stringify({ message: "Logged out" }), { headers });
  }

  return new Response("Method not allowed", { status: 405 });
}
