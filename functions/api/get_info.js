/**
 * functions/api/get_info.js
 * V46.1 修改版：找不到 link 标签则直接留空，不瞎猜 /favicon.ico
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing URL" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. 获取目标网站 HTML
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) throw new Error("Failed to fetch site");
    
    const html = await res.text();

    // 2. 提取标题和描述
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                      html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    
    // 3. 提取图标 URL
    let iconUrl = null;
    const iconLinkMatch = html.match(/<link\s+rel=["'](?:shortcut )?icon["']\s+href=["']([^"']*)["']/i) ||
                          html.match(/<link\s+href=["']([^"']*)["']\s+rel=["'](?:shortcut )?icon["']/i);

    // === 核心修改：只在找到 link 标签时赋值，找不到保持为 null ===
    if (iconLinkMatch) {
      iconUrl = iconLinkMatch[1];
    }
    // 删除了之前的 else { iconUrl = .../favicon.ico } 代码块

    // 处理相对路径
    if (iconUrl && !iconUrl.startsWith("http") && !iconUrl.startsWith("data:")) {
      const u = new URL(targetUrl);
      if (iconUrl.startsWith("//")) {
        iconUrl = u.protocol + iconUrl;
      } else if (iconUrl.startsWith("/")) {
        iconUrl = `${u.protocol}//${u.host}${iconUrl}`;
      } else {
        const path = u.pathname.substring(0, u.pathname.lastIndexOf('/') + 1);
        iconUrl = `${u.protocol}//${u.host}${path}${iconUrl}`;
      }
    }

    // 4. 将图标转为 Base64 (如果 iconUrl 存在)
    let finalIcon = iconUrl; // 如果上面没找到，这里就是 null
    
    if (iconUrl) {
      try {
        const imageRes = await fetch(iconUrl);
        if (imageRes.ok) {
          const contentType = imageRes.headers.get("content-type");
          const arrayBuffer = await imageRes.arrayBuffer();
          
          // 限制大小：200KB 以内转 Base64，否则存链接
          if (arrayBuffer.byteLength < 200 * 1024) {
            let binary = '';
            const bytes = new Uint8Array(arrayBuffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            finalIcon = `data:${contentType || 'image/png'};base64,${base64}`;
          }
        }
      } catch (imgErr) {
        console.error("Icon fetch failed", imgErr);
        // 如果抓取失败，保持原 URL 或 null
      }
    }

    // 5. 返回结果
    const data = {
      title: titleMatch ? titleMatch[1].trim() : "",
      desc: descMatch ? descMatch[1].trim() : "",
      icon: finalIcon || "" // 如果没找到图标，这里返回空字符串
    };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
  }
}
