# 记事本网站

一个简单、美观的在线记事本应用，使用 Supabase 作为后端数据库。

## 功能特性

- ✅ 用户注册和登录（邮箱 + 密码）
- ✅ 创建、编辑、删除笔记
- ✅ 自动保存（输入后 1 秒自动保存）
- ✅ 实时显示保存状态
- ✅ 搜索笔记
- ✅ 响应式设计，支持移动端
- ✅ 数据实时同步到云端

## 技术栈

- **前端**: 纯 HTML + CSS + JavaScript（无框架）
- **后端**: Supabase（PostgreSQL 数据库 + 认证）
- **部署**: 可部署到任何静态网站托管服务

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 点击 "New Project" 创建新项目
3. 等待项目初始化完成（约 2 分钟）

### 2. 执行数据库 SQL

1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase.sql` 文件中的内容
4. 粘贴到 SQL Editor 中
5. 点击 "Run" 执行

### 3. 配置认证设置

1. 在 Supabase 仪表板中，点击左侧菜单的 "Authentication"
2. 进入 "Settings" 标签页
3. 在 "Site URL" 中填写你的网站地址（本地开发可填写 `http://localhost:8000`）
4. 点击 "Save"

### 4. 获取 API 密钥

1. 在 Supabase 仪表板中，点击左侧菜单的 "Project Settings"
2. 点击 "API" 标签页
3. 复制 "Project URL"（类似 `https://xxxxx.supabase.co`）
4. 复制 "anon public" 密钥

### 5. 配置应用

打开 `js/app.js` 文件，找到以下代码：

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

替换为你的实际值：

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 运行应用

### 方法 1: 直接打开（推荐用于快速测试）

由于浏览器 CORS 限制，直接双击打开 `index.html` 可能会遇到问题。建议使用本地服务器。

### 方法 2: 使用 Python 简易服务器

```bash
# 进入项目目录
cd notebook

# Python 3
python -m http.server 8000

# 或使用 Python 2
python -m SimpleHTTPServer 8000
```

然后访问: http://localhost:8000

### 方法 3: 使用 Node.js 服务器

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

然后访问: http://localhost:8000

### 方法 4: 使用 VS Code Live Server 扩展

1. 在 VS Code 中安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 项目结构

```
notebook/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── app.js         # 应用逻辑
├── supabase.sql        # 数据库初始化 SQL
└── README.md          # 说明文档
```

## 数据库表结构

### notes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| title | VARCHAR(255) | 笔记标题，默认 "无标题" |
| content | TEXT | 笔记内容 |
| created_at | TIMESTAMP | 创建时间，自动生成 |
| updated_at | TIMESTAMP | 更新时间，自动更新 |
| user_id | UUID | 用户 ID，关联 auth.users 表 |

## 安全说明

- 已启用行级安全策略（RLS），确保用户只能访问自己的笔记
- 密码经过 Supabase 安全加密存储
- 建议使用 HTTPS 部署以保护数据传输安全

## 自定义样式

应用使用 CSS 变量进行样式管理，你可以轻松自定义主题颜色。

在 `css/style.css` 文件顶部的 `:root` 选择器中修改以下变量：

```css
:root {
    --primary-color: #3ECF71;  /* 主题色 */
    --primary-dark: #2FB85E;   /* 主题深色 */
    --danger-color: #EF4444;   /* 危险操作颜色 */
    /* ... 其他变量 */
}
```

## 常见问题

### Q: 登录后出现 "Invalid API key" 错误？

A: 请检查 `js/app.js` 中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确配置。

### Q: 注册后无法登录？

A: Supabase 默认需要邮箱验证。你可以在 Supabase 仪表板的 "Authentication > Settings" 中关闭 "Enable email confirmations"，或检查邮箱进行验证。

### Q: 如何部署到生产环境？

A: 你可以部署到：
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
- 任何静态网站托管服务

只需将整个 `notebook` 文件夹上传即可。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
