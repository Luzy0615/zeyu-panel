#Zeyu Panel - 极简个人导航面板
Zeyu Panel 是一个基于 **Cloudflare Pages** 全栈部署的轻量级个人导航面板。它集成了前端界面与 Serverless 后端，利用 Cloudflare D1 数据库存储数据，无需购买服务器，免费且速度极快。

*(建议在此处替换为你实际的面板截图)*

##✨ 功能特性* **⚡️ Serverless 架构**：完全运行在 Cloudflare 边缘网络，响应迅速，零维护成本。
* **📱 响应式布局**：
* **电脑端**：自适应 5 列布局，视觉整齐。
* **移动端**：紧凑型双列布局，优化长文本显示，防止版面错乱。


* **🎨 高度可定制**：
* 支持自定义**网页标题**、**背景图片**（支持 API 接口）、**页脚 HTML**。
* **搜索引擎切换**：内置 Bing、Google、百度、Bilibili 等，状态本地记忆。


* **🛠 强大的管理功能**：
* **可视化编辑**：添加、编辑、删除网站卡片，支持自动获取网站图标。
* **拖拽排序**：所见即所得的卡片拖拽排序，跨分类拖拽自动归类。
* **分类管理**：支持分类重命名、删除（级联删除卡片）、上移/下移排序。


* **🔒 权限管理系统**：
* **管理员/访客模式**：管理员拥有完全控制权，访客仅能浏览。
* **精细化授权**：支持设置访客**仅可见**特定的分类，保护隐私链接。


* **📦 数据备份与恢复**：
* 支持一键导出全站数据（包含站点、配置、用户权限）为 JSON 文件。
* 支持从本地 JSON 文件恢复数据，方便迁移或回滚。



##📂 项目目录结构在部署前，请确保你的文件目录结构如下：

```text
.
├── public/
│   ├── index.html              # 前端主入口 (V74版代码)
│   └── logo.jpg                # (可选) 网站图标文件
└── functions/
    └── api/
        ├── auth.js             # 登录/登出/权限检查接口
        ├── backup.js           # 数据备份与恢复接口
        ├── batch_update.js     # 批量排序与分类更新接口
        ├── category.js         # 分类重命名接口
        ├── category_delete.js  # 删除分类接口
        ├── category_order.js   # 分类排序接口
        ├── config.js           # 通用配置(背景/标题等)接口
        ├── get_info.js         # 自动获取网页标题接口(需自行实现或移除)
        ├── sites.js            # 获取/新增站点接口
        ├── users.js            # 用户管理接口
        └── sites/
            └── [id].js         # 单个站点编辑/删除动态路由

```

##🚀 部署指南 (Cloudflare Pages)###1. 准备工作* 一个 Cloudflare 账号。
* 将上述代码上传到你的 GitHub/GitLab 仓库。

###2. 创建 D1 数据库1. 登录 Cloudflare 控制台，进入 **Workers & Pages** -> **D1**。
2. 点击 **Create database**，命名为 `zeyu_db` (或者你喜欢的名字)。
3. 创建成功后，点击进入数据库，选择 **Console** 标签页。
4. **关键步骤**：复制以下 SQL 语句并在 Console 中执行，以初始化表结构和默认数据：

```sql
-- 1. 创建站点表
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    url TEXT,
    desc TEXT,
    icon TEXT,
    category TEXT,
    sort_order INTEGER DEFAULT 99999,
    target TEXT DEFAULT '_self'
);

-- 2. 创建应用配置表
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 3. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    allowed_categories TEXT
);

-- 4. 初始化管理员账号 (默认账号: admin / 密码: 123456)
INSERT OR IGNORE INTO users (username, password, role, allowed_categories) 
VALUES ('admin', '123456', 'admin', '[]');

-- 5. 初始化访客配置占位符
INSERT OR IGNORE INTO users (username, password, role, allowed_categories) 
VALUES ('guest', 'guest_no_login', 'guest', '[]');

```

###3. 创建 Pages 项目1. 在 Cloudflare 控制台，进入 **Workers & Pages** -> **Overview**。
2. 点击 **Create application** -> **Pages** -> **Connect to Git**。
3. 选择你存放代码的 GitHub 仓库。
4. **Build settings**（构建设置）：
* **Framework preset**: None (留空)
* **Build command**: (留空)
* **Build output directory**: `public`


5. 点击 **Save and Deploy**。

###4. 绑定数据库 (至关重要)项目首次部署完成后（此时网页可能报错，因为没连数据库），需要进行绑定：

1. 进入刚才创建的 Pages 项目页面。
2. 点击 **Settings** -> **Functions**。
3. 找到 **D1 database bindings** 部分，点击 **Add binding**。
4. 设置变量名：
* **Variable name**: `DB` (**必须完全一致，因为代码里用的是 env.DB**)
* **D1 database**: 选择第2步创建的 `zeyu_db`。


5. 点击 **Save**。
6. **最后一步**：切换到 **Deployments** 标签页，点击 **Create deployment** -> **Retry deployment** (重新部署) 以使数据库绑定生效。

##📖 使用说明###首次登录* 访问你的 Pages 域名。
* 点击右下角的 **👤 用户图标**。
* 默认管理员账号：`admin`
* 默认密码：`123456`
* *建议登录后尽快修改密码或建立新的管理员账号。*

###个性化设置登录管理员后，点击 **👤 用户图标**：

1. **🏠 主页设置**：设置网页标题、背景图片 URL、自定义页脚。
2. **📦 备份与恢复**：定期导出 JSON 备份，防止数据丢失。
3. **👤 用户权限管理**：
* 可以修改管理员密码。
* 找到 `guest` (全局访客) 用户，点击 **⚙️ 设置**，勾选分类，即可控制未登录用户能看到哪些内容。



###常用操作* **添加卡片**：点击右下角 **+** 号。
* **编辑/删除卡片**：开启“管理模式”（点击右下角笔图标）后，点击卡片右上角的编辑按钮。
* **管理分类**：开启“管理模式”后，点击分类标题右侧的 **✏️ 编辑** 按钮。

##⚠️ 注意事项* **图片存储**：本面板不提供图片上传存储服务（为了保持轻量）。添加图标或背景时，请使用外部图床链接（如 GitHub Raw, Imgur 等）或 Base64 编码。
* **搜索引擎**：搜索引擎的选择保存在本地浏览器缓存中，不会同步到云端。

##📄 LicenseMIT License. Feel free to modify and distribute.
