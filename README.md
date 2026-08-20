# BurmeseBridge

BurmeseBridge 是面向缅甸语、中文及英文用户的学习、资讯、招聘与社区平台。项目使用 Next.js App Router、Supabase 和 Vercel 构建，生产站点为 [burmesebridge.eu.cc](https://burmesebridge.eu.cc)。

> 当前状态：持续开发中。核心认证、内容、审核、知识付费和安全功能已经上线；全站专业缅甸语文案仍在逐页审校。

## 已上线功能

### 用户与认证

- 邮箱注册、登录、退出和邮箱确认
- 忘记密码、邮件恢复链接和用户中心修改密码
- Google、GitHub、Facebook OAuth 登录入口
- TOTP 两步验证（2FA）
- 个人资料、专业身份申请与认证徽章
- 用户主动注销账号和删除个人数据
- 管理员临时密码与首次登录强制改密

### 内容与社区

- 新闻、招聘、论坛和视频内容
- 新闻、学习内容和招聘信息支持图片、字幕及 YouTube 链接
- 点赞、评论、分享、举报与申诉
- 全局搜索、通知和用户内容中心
- 中文、缅甸语、英文三语界面
- 浅色与深色模式、桌面及移动端响应式布局

### 知识付费

- 免费与付费课程、课程目录、试看视频和学习进度
- 单课程购买以及月度、年度、终身会员
- KBZPay、WavePay、银行等管理员配置的付款方式
- 私有付款凭证上传和管理员人工审核
- 付款资料仅在用户主动购买时显示，开通后不再暴露
- 启用中的会员价格必须大于零，并由数据库约束防止绕过

### 管理后台

- 用户、角色、封禁及管理员改密管理
- 教师、企业、作者等专业身份审核
- 新闻、招聘、视频、课程和论坛内容管理
- 举报、申诉、反馈、广告及付款审核
- 管理员操作日志和审核通知
- 管理员与版主权限分层，普通用户无法进入后台

### 合规与安全

- Supabase Row Level Security（RLS）
- 发布、评论、反馈和举报频率限制
- 上传文件类型、大小和扩展名校验
- 私有付款凭证存储桶和限时签名链接
- 防止普通用户自行提升角色或认证徽章
- 安全响应头、管理员路由保护和服务端敏感操作
- 服务条款、隐私政策、社区规则、版权投诉、数据删除及求职安全页面
- 招聘反欺诈、反人口贩卖和强迫劳动安全说明

## 技术栈

- [Next.js 16](https://nextjs.org/) App Router
- [React 19](https://react.dev/) + TypeScript
- [Supabase](https://supabase.com/) Auth、Postgres、Storage、RLS
- [Vercel](https://vercel.com/) 部署与生产托管
- Radix UI / shadcn 风格组件
- Lucide Icons、next-themes、next-sitemap

## 本地开发

要求：Node.js 20+、npm；数据库迁移还需要 Supabase CLI。

```bash
git clone https://github.com/minnyinyioo/Burmesebridge.git
cd Burmesebridge
npm install
```

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# 仅供服务端 API 使用，绝不能添加 NEXT_PUBLIC_ 前缀或提交到 GitHub
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# 可选：新闻自动翻译
AZURE_TRANSLATOR_KEY=
AZURE_TRANSLATOR_REGION=

# 可选：正式社交账号
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_DISCORD_URL=
NEXT_PUBLIC_TELEGRAM_URL=
NEXT_PUBLIC_LINE_URL=
NEXT_PUBLIC_VIBER_URL=
```

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## Supabase 数据库

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration list
npx supabase db push --include-all
```

不要在生产数据库重复手工执行已记录的迁移。如果远端已有旧表但迁移历史缺失，先核对数据库，再运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-supabase-history.ps1
```

该脚本只用于已有结构的迁移历史修复，不应代替正常的 `db push`。

## Authentication 配置

Supabase Dashboard → Authentication → URL Configuration：

```text
Site URL: https://burmesebridge.eu.cc
Redirect URL: https://burmesebridge.eu.cc/auth/callback
```

本地调试可加入：

```text
http://localhost:3000/auth/callback
```

Google、GitHub 和 Facebook 的 Client ID / Secret 必须在对应平台创建后填入 Supabase。各平台通常使用的回调地址为：

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

如果希望 Google 授权页不显示 `supabase.co`，需要在 Supabase 配置自定义认证域名；仅修改前端回调地址无法改变授权页显示的域名。

### SMTP

生产环境使用独立 SMTP（当前为 Brevo）。需要确认：

- 发件邮箱或域名已验证
- SMTP Host、Port、Username 和 Password 正确
- Reset Password 模板使用 `{{ .ConfirmationURL }}`
- 密码恢复回调包含 `/auth/callback`

邮件平台和 Supabase 仍可能执行服务端频率限制，前端不会绕过供应商限制。

## 权限模型

- `member` / `user`：普通用户
- `moderator`：内容审核和部分管理能力
- `admin`：完整后台管理能力
- `banned`：被限制用户

教师、企业和作者是专业认证徽章，不等同于后台管理权限。关键权限同时由页面保护、服务端 API 和 Supabase RLS 控制，不能只依赖隐藏导航按钮。

## 测试与检查

```bash
npm run lint          # ESLint
npm run build         # 生产构建和 TypeScript 检查
npm run check:routes  # 检查生产站可枚举路由
```

安全冒烟测试会创建并清理临时用户和测试数据，需要在当前终端提供 Supabase Service Role Key：

```bash
npm run check:security
```

不要把 Service Role Key 写入源代码、浏览器代码、日志或 GitHub。

## 部署与回滚

```bash
npx vercel deploy --prod --yes
```

Vercel 会为每次部署保留不可变的独立 URL。回滚命令：

```bash
npx vercel rollback
npx vercel rollback DEPLOYMENT_URL_OR_ID
```

数据库迁移不会随 Vercel 前端回滚自动撤销。涉及数据库结构的发布应使用新的向前修复迁移，禁止直接删除生产数据。

## 目录结构

```text
app/                       页面、布局和服务端 API
components/                通用、后台、论坛及知识付费组件
lib/                       Supabase、权限、国际化及文件校验
public/                    图标、字体、manifest 和站点地图
scripts/                   路由、安全及迁移历史辅助脚本
supabase/migrations/       数据库迁移
middleware.ts              管理员路由和认证访问保护
```

## 当前开发重点

- 全站缅甸语按正式书面标准逐页审校
- 三语移动端布局和深浅色模式逐页复查
- 完善后台待处理数量、通知和运营流程
- 配置数据库自动备份并演练恢复
- 完善错误监控、访问统计和正式社交账号
- 准备正式新闻、招聘、课程及视频内容

## 联系方式

- 网站：[https://burmesebridge.eu.cc](https://burmesebridge.eu.cc)
- 邮箱：[admin@burmesebridge.eu.cc](mailto:admin@burmesebridge.eu.cc)
- GitHub：[minnyinyioo/Burmesebridge](https://github.com/minnyinyioo/Burmesebridge)

## 许可证

当前仓库未声明开源许可证。除非仓库所有者另行授权，否则不得将源代码视为已获准复制、修改或商业再分发。
