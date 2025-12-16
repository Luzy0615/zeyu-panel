/**
 * functions/api/auth.js
 * 修复版：包含完整的 Cookie 设置和清除逻辑
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. GET: 检查登录状态
  if (request.method === "GET") {
    const cookie = request.headers.get("Cookie");
    // 简单验证：检查 Cookie 中是否有 session=admin_token
    // (实际生产环境建议使用 KV 或 D1 验证 session ID)
    if (cookie && cookie.includes("session=admin_token")) {
      return new Response(JSON.stringify({ 
        role: 'admin', 
        username: 'admin',
        allowed_categories: [] 
      }), { headers: { "Content-Type": "application/json" } });
    } else {
      // 如果没有 Cookie，返回访客身份
      return new Response(JSON.stringify({ 
        role: 'guest', 
        username: 'guest',
        allowed_categories: [] // 这里可以结合 users 表读取访客权限，为简化暂空
      }), { headers: { "Content-Type": "application/json" } });
    }
  }

  // 2. POST: 登录
  if (request.method === "POST") {
    try {
      const { username, password } = await request.json();
      
      // 查询数据库验证账号密码
      const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first();
      
      if (!user) {
        return new Response("Invalid credentials", { status: 401 });
      }

      // 解析权限
      let allowed = [];
      try { allowed = JSON.parse(user.allowed_categories || '[]'); } catch(e) {}

      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        allowed_categories: allowed
      };

      // 登录成功，下发 Cookie (有效期7天)
      // 注意：这里为了简化使用固定 token，生产环境应生成随机 UUID
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Set-Cookie", `session=admin_token; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

      return new Response(JSON.stringify(userData), { headers });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }
  
  // 3. DELETE: 登出 (核心修复)
  if (request.method === "DELETE") {
    const headers = new Headers();
    // 关键：设置 Max-Age=0 或 Expires=过去时间，强制浏览器删除 Cookie
    headers.append("Set-Cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    
    return new Response("Logged out", { 
        status: 200,
        headers: headers
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
