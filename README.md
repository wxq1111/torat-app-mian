# Projects

这是一个基于 [Next.js 15](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com) 的全栈应用项目。

## 项目简介

这是一个现代化的全栈 Web 应用项目,采用最新的技术栈构建,提供了完整的开发规范和最佳实践。

## 快速开始

### 环境准备

确保你已经安装：
- Node.js 18.x 或更高版本
- pnpm 9.x (`npm install -g pnpm`)

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

启动后，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

开发服务器支持热更新，修改代码后页面会自动刷新。

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

### 代码检查

```bash
# 运行 ESLint
pnpm lint

# 运行 TypeScript 类型检查
pnpm type-check
```

## 项目结构

```
projects/
├── src/
│   ├── app/                    # Next.js App Router 目录
│   │   ├── layout.tsx         # 根布局组件
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css        # 全局样式（包含 shadcn 主题变量）
│   │   └── [route]/           # 其他路由页面
│   ├── components/            # React 组件目录
│   │   └── ui/                # shadcn/ui 基础组件（优先使用）
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── lib/                   # 工具函数库
│   │   ├── utils.ts          # cn() 等工具函数
│   │   └── db.ts             # 数据库连接（如使用）
│   └── hooks/                 # 自定义 React Hooks（可选）
├── public/                    # 静态资源
├── package.json
├── tsconfig.json
├── turbo.json                 # Monorepo 配置（如使用）
└── README.md
```

## 核心开发规范

### 1. 组件开发

**组件组织原则**

- `src/components/ui/` - 基础 UI 组件（Button、Card 等），来自 shadcn/ui
- `src/components/` - 业务组件（组合多个基础组件）

**基础组件导入示例**

```tsx
// ✅ 推荐：使用 shadcn 基础组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>标题</h2>
      </CardHeader>
      <CardContent>
        <Input placeholder="输入内容" />
        <Button>提交</Button>
      </CardContent>
    </Card>
  );
}
```

**常用 shadcn 组件清单**

完整组件列表请查看 `src/components/ui/` 目录。这里列出常用组件：

- **按钮元素**: `button`, `input`, `textarea`, `select`, `checkbox`, `switch`, `slider`
- **布局组件**: `card`, `tabs`, `accordion`, `scroll-area`, `separator`
- **反馈组件**: `alert`, `dialog`, `toast`, `progress`, `badge`
- **导航组件**: `dropdown-menu`, `navigation-menu`, `tooltip`, `popover`
- **数据展示**: `table`, `avatar`, `hover-card`, `data-table`

**添加新组件**:
```bash
# 使用 CLI 添加 shadcn 组件
pnpm dlx shadcn@latest add [component-name]
# 例如: pnpm dlx shadcn@latest add dialog
```

### 2. 路由开发

Next.js 使用文件系统路由，在 `src/app/` 目录下创建文件夹即可添加路由：

```bash
# 创建新路由 /about
src/app/about/page.tsx

# 创建动态路由 /posts/[id]
src/app/posts/[id]/page.tsx

# 创建路由组（不影响 URL）
src/app/(marketing)/about/page.tsx

# 创建 API 路由
src/app/api/users/route.ts
```

**页面组件示例**

```tsx
// src/app/about/page.tsx
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '关于我们',
  description: '关于页面描述',
};

export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <Button>了解更多</Button>
    </div>
  );
}
```

**动态路由示例**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>文章 ID: {id}</div>;
}
```

**API 路由示例**

```tsx
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### 3. 依赖管理

**必须使用 pnpm 管理依赖**

```bash
# ✅ 安装依赖
pnpm install

# ✅ 添加新依赖
pnpm add package-name

# ✅ 添加开发依赖
pnpm add -D package-name

# ❌ 禁止使用 npm 或 yarn
# npm install  # 错误！
# yarn add     # 错误！
```

项目已配置 `preinstall` 脚本，使用其他包管理器会报错。

### 4. 样式开发

**使用 Tailwind CSS v4 BC (Beta Channel)**

本项目使用 Tailwind CSS v4 Beta 版本进行样式开发，并已配置 shadcn 主题变量。v4 版本引入了以下重要改进：

- **更快的编译速度**: 使用 Oxide 引擎的性能优化
- **主题系统**: 改进的 CSS 变量和主题定义
- **无需配置**: 更智能的默认配置,减少 setup 工作

```tsx
// 使用 Tailwind 类名
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 rounded-lg bg-background border">
      <h1 className="text-2xl font-bold tracking-tight">
        My App
      </h1>
      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
        主要按钮
      </Button>
    </header>
  );
}
```

**函数式合并类名**:

使用 `cn()` 工具函数合并类名,自动处理 TailwindCSS 类的优先级:

```tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  isActive?: boolean;
}

export function MyComponent({ className, isActive }: MyComponentProps) {
  return (
    <div className={cn(
      "base-class p-4",
      isActive && "bg-accent text-accent-foreground",
      className
    )}>
      内容
    </div>
  );
}
```

**主题变量**

主题变量定义在 `src/app/globals.css` 中，支持亮色/暗色模式：

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

**添加自定义主题**:
```css
/* app/globals.css */
@theme {
  --color-brand: #ff6b6b;
  --color-brand-foreground: #ffffff;
}

### 5. 表单开发

本项目使用 `react-hook-form` + `zod` 进行表单验证。这是一个推荐的最佳实践,提供类型安全和良好的用户体验。

#### 基础表单示例

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱'),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="请输入邮箱" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">提交</Button>
      </form>
    </Form>
  );
}
```

了解更多：
- [React Hook Form 官方文档](https://react-hook-form.com)
- [Zod 模式验证](https://zod.dev)
- 完整表单组件见 `src/components/ui/form.tsx`

### 6. 数据获取与渲染

**服务端组件（App Router 默认）**

Next.js App Router 默认使用 React 服务端组件(RSC),数据在服务器端获取,提升性能和 SEO:

```tsx
// src/app/posts/page.tsx
interface Post {
  id: number;
  title: string;
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts', {
    // 缓存策略
    cache: 'no-store', // 动态数据: 每次请求获取最新
    // cache: 'force-cache', // 静态数据: 构建时缓存
    // next: { revalidate: 60 }, // ISR: 60秒后重新验证
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>文章列表</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

**数据获取策略**:
- `'force-cache'` - 页面构建时获取数据并缓存
- `'no-store'` - 每次请求都获取新数据
- `{ revalidate: N }` - ISR (增量静态再生),每 N 秒重新验证

**客户端组件 ('use client')**

需要交互、状态管理或使用浏览器 API 时,使用客户端组件:

```tsx
'use client';

import { useEffect, useState } from 'react';

interface Data {
  id: number;
  name: string;
}

export default function Dashboard() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('获取数据失败:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

**选择服务端还是客户端**: Server components vs Client components

| 服务端组件 | 客户端组件 |
|-----------|-----------|
| ✅ 静态生成/SEO | ❌ 不适合SEO |
| ✅ 首屏加载快 | ✅ 需要交互 |
| ❌ 无状态/无交互 | ✅ 有状态/useState |
| ✅ 直接访问后端资源 | ✅ 访问浏览器API |

**混合模式示例**:

服务端组件获取初始数据 → 传递给客户端组件:

```tsx
// 服务端组件包裹客户端组件
import { Dashboard } from '@/components/dashboard';

export default async function Page() {
  const initialData = await fetchData();

  return <Dashboard initialData={initialData} />;
}

## 常见开发场景与最佳实践

### 开发流程示例

1. **规划页面和组件**:
   ```bash
   # 创建业务组件
   touch src/components/my-feature.tsx

   # 创建页面路由
   mkdir -p src/app/my-feature
   touch src/app/my-feature/page.tsx

   # 创建 API 路由
   mkdir -p src/app/api/my-feature
   touch src/app/api/my-feature/route.ts
   ```

2. **开发模式**:
   ```bash
   pnpm dev  # 监听文件变化,热更新
   pnpm lint # 运行代码规范检查
   ```

3. **构建部署**:
   ```bash
   pnpm build   # 生产构建
   pnpm start   # 启动生产服务器
   ```

### 添加页面和路由

1. 在 `src/app/` 下创建文件夹和 `page.tsx`
2. 使用 shadcn 组件构建 UI
3. 根据需要添加 `layout.tsx` 和 `loading.tsx`

### 创建业务组件

1. 在 `src/components/` 下创建组件文件（非 UI 组件）
2. 优先组合使用 `src/components/ui/` 中的基础组件
3. 使用 TypeScript 定义 Props 类型

### 添加全局状态

推荐使用 React Context 或 Zustand：

```tsx
// src/lib/store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 集成数据库

推荐使用 Prisma 或 Drizzle ORM，在 `src/lib/db.ts` 中配置。

## 技术栈

- **框架**: Next.js 15.x (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式引擎**: Tailwind CSS v4 + CSS变量主题
- **表单验证**: React Hook Form + Zod
- **图标库**: Lucide React
- **字体**: Geist Sans & Geist Mono
- **包管理器**: pnpm 9.x
- **语言**: TypeScript 5.x
- **其他**: Class Variance Authority (CVA), clsx, tailwind-merge

## 参考文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [shadcn/ui 组件文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

## 重要提示

1. **必须使用 pnpm** 作为包管理器
2. **优先使用 shadcn/ui 组件** 而不是从零开发基础组件
3. **遵循 Next.js App Router 规范**，正确区分服务端/客户端组件
4. **使用 TypeScript** 进行类型安全开发
5. **使用 `@/` 路径别名** 导入模块（已配置）
