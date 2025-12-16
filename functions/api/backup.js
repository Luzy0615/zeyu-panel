/**
 * functions/api/backup.js
 * V74.0 全量备份：包含站点数据、全局配置、用户权限
 */

export async function onRequestGet(context) {
  // === 导出配置 (GET) ===
  const { env } = context;

  try {
    // 1. 获取所有站点
    const sitesResult = await env.DB.prepare("SELECT * FROM sites ORDER BY sort_order ASC").all();
    
    // 2. 获取所有配置 (分类顺序、标题、背景、页脚)
    const configResult = await env.DB.prepare("SELECT * FROM app_config").all();

    // 3. (新增) 获取所有用户数据 (包含管理员密码、访客权限)
    const usersResult = await env.DB.prepare("SELECT * FROM users").all();
    
    // 4. 组装数据
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "2.0", // 升级版本号
      sites: sitesResult.results || [],
      configs: configResult.results || [],
      users: usersResult.results || [] // 新增用户数据
    };

    return new Response(JSON.stringify(backupData), {
      headers: { 
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zeyu_panel_full_backup_${new Date().toISOString().slice(0,10)}.json"`
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

    // 1. 清空旧数据 (全量覆盖模式)
    stmts.push(env.DB.prepare("DELETE FROM sites"));
    
    // 2. 恢复站点数据
    for (const site of data.sites) {
        const target = site.target || '_self';
        stmts.push(
            env.DB.prepare(
                "INSERT INTO sites (title, url, desc, icon, category, sort_order, target) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(site.title, site.url, site.desc, site.icon, site.category, site.sort_order, target)
        );
    }

    // 3. 恢复应用配置 (使用 Replace 覆盖)
    for (const conf of data.configs) {
        stmts.push(
            env.DB.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)")
            .bind(conf.key, conf.value)
        );
    }

    // 4. (新增) 恢复用户数据
    // 只有当备份文件里包含 users 字段时才执行（兼容旧版备份文件）
    if (data.users && Array.isArray(data.users)) {
        // 先清空现有用户表（慎重：这会重置密码）
        stmts.push(env.DB.prepare("DELETE FROM users"));
        
        for (const user of data.users) {
            stmts.push(
                env.DB.prepare(
                    "INSERT INTO users (id, username, password, role, allowed_categories) VALUES (?, ?, ?, ?, ?)"
                ).bind(user.id, user.username, user.password, user.role, user.allowed_categories)
            );
        }
    }

    // 5. 执行批量事务
    await env.DB.batch(stmts);

    return new Response(JSON.stringify({ success: true, message: "恢复成功" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(`恢复失败: ${e.message}`, { status: 500 });
  }
}
