export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    let targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return Response.json({ error: 'No URL provided' }, { status: 400 });
    }

    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        // 伪装成浏览器访问，防止被拦截
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow'
        });

        const html = await response.text();

        // 1. 使用正则提取 Title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        // 2. 使用正则提取 Description (支持多种 meta 写法)
        let desc = '';
        const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) || 
                          html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
        
        if (metaMatch) {
            desc = metaMatch[1];
        }

        return Response.json({ 
            title: title.trim(), 
            desc: desc.trim() 
        });

    } catch (error) {
        return Response.json({ title: '', desc: '' });
    }
}
