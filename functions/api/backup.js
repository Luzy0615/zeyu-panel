/**
 * functions/api/backup.js
 * 负责全站数据的导出与导入
 * 需要管理员权限
 */

export async function onRequestGet(context) {
  // === 导出配置 (GET) ===
  const { env } = context;

  try {
    // 1. 获取所有站点
    const sitesResult = await env.DB.prepare("SELECT * FROM sites ORDER BY sort_order ASC").all();
    
    // 2. 获取所有配置 (分类顺序、标题、背景等)
    const configResult = await env.DB.prepare("SELECT * FROM app_config").all();
    
    // 3. 组装数据
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      sites: sitesResult.results || [],
      configs: configResult.results || [] // key-value 数组
    };

    return new Response(JSON.stringify(backupData), {
      headers: { 
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zeyu_panel_backup_${new Date().toISOString().slice(0,10)}.json"`
      }
    });

  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}

export async function onRequestPost(context) {
  // === 导入配置 (POST) ===
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data.sites || !data.configs) {
      return new Response("无效的备份文件格式", { status: 400 });
    }

    // 准备批量操作语句
    const stmts = [];

    // 1. 清空旧数据 (为了避免冲突，通常选择全量覆盖)
    // 注意：这里不会删除用户账号信息，只重置内容配置
    stmts.push(env.DB.prepare("DELETE FROM sites"));
    // app_config 可以选择不清空，而是用 REPLACE 覆盖

    // 2. 恢复站点数据
    // 必须确保 data.sites 中的字段与数据库匹配
    for (const site of data.sites) {
        // 兼容旧备份：如果没有 target 字段，默认为 _self
        const target = site.target || '_self';
        stmts.push(
            env.DB.prepare(
                "INSERT INTO sites (title, url, desc, icon, category, sort_order, target) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(site.title, site.url, site.desc, site.icon, site.category, site.sort_order, target)
        );
    }

    // 3. 恢复应用配置
    for (const conf of data.configs) {
        stmts.push(
            env.DB.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)")
            .bind(conf.key, conf.value)
        );
    }

    // 4. 执行批量事务
    await env.DB.batch(stmts);

    return new Response(JSON.stringify({ success: true, message: "恢复成功" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(`恢复失败: ${e.message}`, { status: 500 });
  }
}
