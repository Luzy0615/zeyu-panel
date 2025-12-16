/**
 * functions/api/config.js
 * 通用配置读写接口 (用于存储背景图URL、分类顺序等)
 * 数据库表依赖: app_config (key TEXT PRIMARY KEY, value TEXT)
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) return new Response("Missing key", { status: 400 });

  try {
    const item = await env.DB.prepare("SELECT value FROM app_config WHERE key = ?").bind(key).first();
    // 如果没有找到，返回 null
    const result = item ? JSON.parse(item.value) : null;
    return new Response(JSON.stringify({ value: result }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ value: null }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) return new Response("Missing key", { status: 400 });

    // value 存为 JSON 字符串
    const valueStr = JSON.stringify(value);

    await env.DB.prepare(
      "INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)"
    ).bind(key, valueStr).run();

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
