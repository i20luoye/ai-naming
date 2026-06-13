# AGENTS.md — 天衍 AI 起名工具

## 项目概览

「天衍」是一款基于八字喜用神分析的 AI 智能起名工具。品牌调性：墨韵金辉、东方古典、现代极简。技术栈：Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui。

## 构建和运行命令

- **安装依赖**：`pnpm install`
- **开发**：`pnpm run dev`（端口 5000，HMR 自动生效）
- **构建**：`pnpm run build`
- **生产启动**：`pnpm run start`
- **类型检查**：`pnpm ts-check`
- **Lint**：`pnpm lint`

## 目录结构

```
src/
├── app/
│   ├── (home)/              # 首页（route group，含 SiteHeader）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── name/                # 起名流程
│   │   ├── input/           # Step1: 信息输入
│   │   ├── bazi/            # Step2-3: 排盘结果
│   │   ├── preference/      # Step3: 起名偏好
│   │   ├── result/          # Step4: AI起名结果
│   │   └── detail/          # 名字详情
│   ├── test-name/           # 测名流程
│   │   ├── page.tsx         # 测名输入
│   │   └── result/          # 测名结果
│   └── api/
│       ├── bazi/            # POST: 八字排盘计算
│       ├── generate-names/  # POST: AI起名生成
│       └── test-name/       # POST: AI测名评分
├── components/
│   ├── tianyan/             # 业务组件
│   │   ├── SiteHeader.tsx   # 全站顶部导航
│   │   ├── SubHeader.tsx    # 流程页子导航（返回+标题+步骤）
│   │   ├── StepIndicator.tsx # 步骤指示器
│   │   ├── WuxingTag.tsx    # 五行标签（带专属色）
│   │   └── GoldLine.tsx     # 金色分割线
│   └── ui/                  # shadcn/ui 基础组件
├── lib/
│   ├── bazi.ts              # 八字排盘核心计算库
│   └── utils.ts             # 工具函数
└── data/                    # 静态数据（预留）
```

## 设计规范

- **配色**：墨黑(#0a0806)底色 + 金箔(#c8a45c)主色 + 朱砂(#c4564a)强调色
- **字体**：Noto Serif SC(标题) + Noto Sans SC(正文) + JetBrains Mono(数据)
- **圆角**：8px(rounded-lg)，五行标签 4px(rounded-sm)
- **阴影**：金色光晕用 text-shadow，卡片用 shadow-card，禁止浓重实阴影
- **禁止**：浅色背景、蓝紫色科技风、卡通/道教图案、"大师"人像、"算命/改运"措辞

## API 接口

### POST /api/bazi
- 参数：`{ birthDate: string (YYYY-MM-DD), birthTime: string (HH:mm) }`
- 返回：四柱八字、五行分布、喜用神、格局

### POST /api/generate-names
- 参数：`{ surname, birthDate, birthTime, gender, xiYong[], pattern, preferences? }`
- 返回：AI 生成的名字列表（含五行、评分、诗词出处）

### POST /api/test-name
- 参数：`{ surname, givenName, birthDate?, birthTime?, gender? }`
- 返回：名字评分和多维度分析

## LLM 集成

- SDK：`coze-coding-dev-sdk`（TypeScript）
- 默认模型：`doubao-seed-2-0-lite-260215`
- System Prompt 内置合规约束，禁止"算命/改运/预测"措辞

## 合规红线

- 必须使用"传统文化参考""五行分析"等中性表述
- 禁止暗示名字可以改变命运
- 禁止人生预测、运势判断
- 每个分析结果底部必须附合规标识

## 代码风格

- 所有组件使用 TypeScript，参数必须标注类型
- 客户端交互组件需加 `'use client'` 指令
- 颜色必须使用 globals.css 中的语义变量，禁止硬编码 hex
- UI 组件优先使用 shadcn/ui，样式冲突时改用原生 HTML 元素 + 完整 className
