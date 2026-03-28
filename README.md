# AI Tarot

一个基于 Next.js 16 构建的 AI 塔罗牌占卜项目，支持输入问题、选择牌阵、手势抽牌，并通过 Gemini 兼容接口生成流式塔罗解读。

## Features

- 沉浸式塔罗牌界面与星空视觉风格
- 支持单张牌、三张牌、五张牌等常见牌阵
- 支持手势抽牌与正位 / 逆位判定
- 通过 `/api/tarot` 调用 AI 接口，实时流式返回解读结果
- 已适配 OpenAI 兼容格式的 Gemini 接口

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- OpenAI Node SDK

## Local Development

### 1. Install

```bash
pnpm install
```

### 2. Configure env

在项目根目录创建 `.env.local`：

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_BASE_URL=https://api.ai-wave.org
GEMINI_MODEL=gemini-2.5-flash
```

说明：

- `GEMINI_BASE_URL` 填服务根地址即可，项目会自动补成兼容接口所需的 `/v1`
- `GEMINI_MODEL` 需要填写你的 key 实际可用的模型

### 3. Start

```bash
pnpm dev
```

默认启动地址：

[http://localhost:5000](http://localhost:5000)

如果 `5000` 端口被占用，可以换端口启动：

```bash
APP_PORT=5001 pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

## Environment Variables

项目当前使用以下环境变量：

- `GEMINI_API_KEY`
- `GEMINI_BASE_URL`
- `GEMINI_MODEL`

示例文件见 [`.env.example`](/Users/xueqiu/Desktop/torat-app-main/.env.example)。

## Project Structure

```text
torat-app-main/
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── api/tarot/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── data/
│   ├── hooks/
│   └── lib/
├── package.json
└── README.md
```

## Deploy To Vercel

### Option 1: Import from GitHub

1. 在 Vercel 中导入这个 GitHub 仓库
2. Framework Preset 选择 `Next.js`
3. 在 Environment Variables 中添加：
   - `GEMINI_API_KEY`
   - `GEMINI_BASE_URL`
   - `GEMINI_MODEL`
4. 点击 Deploy

### Option 2: Use Vercel CLI

```bash
npx vercel
```

生产部署：

```bash
npx vercel --prod
```

## Notes

- `.env.local` 已被 `.gitignore` 忽略，不会上传到 GitHub
- 当前项目可以正常本地运行并返回塔罗解读
- 项目仍有一部分 lint 告警 / 类型问题，暂时不会阻塞开发和部署
