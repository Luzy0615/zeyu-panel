/**
 * functions/api/auth.js
 * V68.0: 访客自动映射到数据库的 'guest' 用户配置
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. GET: 检查当前状态 (页面加载时调用)
  if (request.method === "GET") {
    const cookie = request.headers.get("Cookie");
    
    // A. 如果有管理员 Cookie
    if (cookie && cookie.includes("session=admin_token")) {
      return new Response(JSON.stringify({ 
        role: 'admin', 
        username: 'admin',
        allowed_categories: [] // 管理员拥有全部权限
      }), { headers: { "Content-Type": "application/json" } });
    } 
    
    // B. 如果没有 Cookie (即普通访客) -> 读取数据库中 'guest' 用户的配置
    else {
      try {
        // 查找 username 为 'guest' 的用户配置
        const guestUser = await env.DB.prepare("SELECT allowed_categories FROM users WHERE username = 'guest'").first();
        
        let allowed = [];
        if (guestUser && guestUser.allowed_categories) {
          try { allowed = JSON.parse(guestUser.allowed_categories); } catch(e) {}
        }

        return new Response(JSON.stringify({ 
          role: 'guest', 
          username: '访客',
          allowed_categories: allowed // 返回数据库里配置的权限
        }), { headers: { "Content-Type": "application/json" } });

      } catch (e) {
        // 出错兜底：什么都看不到
        return new Response(JSON.stringify({ role: 'guest', allowed_categories: [] }), 
          { headers: { "Content-Type": "application/json" } });
      }
    }
  }

  // 2. POST: 管理员登录
  if (request.method === "POST") {
    try {
      const { username, password } = await request.json();
      const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first();
      
      if (!user) {
        return new Response("账号或密码错误", { status: 401 });
      }

      // 只有 admin 角色允许登录进入管理模式
      if (user.role !== 'admin') {
         return new Response("该账号无管理权限", { status: 403 });
      }

      const userData = { id: user.id, username: user.username, role: 'admin' };

      // 下发 Cookie
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Set-Cookie", `session=admin_token; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

      return new Response(JSON.stringify(userData), { headers });
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }
  
  // 3. DELETE: 退出登录
  if (request.method === "DELETE") {
    const headers = new Headers();
    headers.append("Set-Cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    return new Response("Logged out", { status: 200, headers: headers });
  }

  return new Response("Method not allowed", { status: 405 });
}
