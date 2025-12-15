export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    let targetUrl = searchParams.get('url');

    if (!targetUrl) return Response.json({ error: 'No URL' }, { status: 400 });
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    try {
        const res = await fetch(targetUrl, {
            headers: {
                // 伪装成真实的 Chrome 浏览器，防止被拦截
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            redirect: 'follow'
        });

        const html = await res.text();
        const finalUrl = res.url; // 获取重定向后的最终 URL，用于解析相对路径

        // 1. 提取 Title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        // 2. 提取 Description
        let desc = '';
        const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
                         html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
        if (metaDesc) desc = metaDesc[1];

        // 3. 【核心】本地提取 Icon
        let icon = '';
        // 优先找 apple-touch-icon (通常高清)
        const appleIcon = html.match(/<link\s+rel=["']apple-touch-icon["']\s+href=["'](.*?)["']/i);
        // 其次找 shortcut icon
        const shortcutIcon = html.match(/<link\s+rel=["'](?:shortcut )?icon["']\s+href=["'](.*?)["']/i);
        
        if (appleIcon) {
            icon = appleIcon[1];
        } else if (shortcutIcon) {
            icon = shortcutIcon[1];
        }

        // 4. 处理相对路径 (例如 href="/logo.png" 转为绝对路径)
        if (icon) {
            try {
                icon = new URL(icon, finalUrl).href;
            } catch (e) {
                icon = ''; // 解析失败则置空
            }
        } else {
            // 如果网页源码里没写图标，尝试默认路径
            try {
                const urlObj = new URL(finalUrl);
                icon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
            } catch(e) {}
        }

        return Response.json({ 
            title: title.trim(), 
            desc: desc.trim(),
            icon: icon
        });

    } catch (error) {
        return Response.json({ title: '', desc: '', icon: '' });
    }
}
