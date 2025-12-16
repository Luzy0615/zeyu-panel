/**
 * functions/api/auth.js
 * V66.0: 返回用户信息时包含 allowed_categories
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. GET: 检查当前登录状态
  if (request.method === "GET") {
    // 这里假设你用 cookie 或 session 验证
    // 为了演示，这里假设你已经有了验证逻辑，重点是返回的数据结构
    // 实际项目中请结合你的 session 验证逻辑
    // 模拟返回当前用户（请替换为你真实的 session 读取逻辑）
    
    // 如果无法获取 session，返回 401
    // const user = await getSessionUser(request); 
    // if (!user) return new Response("Unauthorized", { status: 401 });

    // 这里简化处理：假设前端通过某种方式已经鉴权，或者此接口仅返回 mock 数据
    // **关键修改**：实际部署时，请确保这里从数据库查出了 allowed_categories
    return new Response(JSON.stringify({ 
      role: 'admin', // 示例
      username: 'admin',
      allowed_categories: [] // 管理员忽略此字段
    }), { headers: { "Content-Type": "application/json" } });
  }

  // 2. POST: 登录
  if (request.method === "POST") {
    try {
      const { username, password } = await request.json();
      // 查询用户
      const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first();
      
      if (!user) {
        return new Response("Invalid credentials", { status: 401 });
      }

      // **关键修改**：解析 allowed_categories
      let allowed = [];
      try { allowed = JSON.parse(user.allowed_categories || '[]'); } catch(e) {}

      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        allowed_categories: allowed
      };

      // 这里应该设置 Set-Cookie
      return new Response(JSON.stringify(userData), {
        headers: { "Content-Type": "application/json" } // 实际应加上 Set-Cookie
      });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }
  
  // DELETE: 登出
  if (request.method === "DELETE") {
    return new Response("Logged out", { status: 200 }); // 实际应清除 Cookie
  }
}
