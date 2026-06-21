# 天衍 AI 起名

天衍 AI 起名是一个基于 Next.js 的中文 AI 起名工具，当前定位为“传统文化参考 + 五行分析 + AI 名字生成/测评”的 MVP 项目。项目围绕宝宝起名和姓名测评两个核心流程展开，强调合规表达，不做运势预测，也不暗示名字可以改变命运。

## 当前状态

项目已经具备可运行的前端流程与 API：

- 首页：品牌展示、功能入口、案例与流程介绍。
- 起名流程：信息输入、八字排盘、起名偏好、AI 名字生成、名字详情。
- 测名流程：姓名输入、AI 测名评分、结果展示。
- API：八字排盘、AI 起名生成、AI 测名评分。
- 基础能力：`localStorage` 跨页状态、简单 IP 限流、LLM 输出合规过滤。

当前项目仍是 MVP 阶段，数据持久化、用户系统、支付闭环、后台管理、正式运营监控等能力尚未实现。

## 技术栈

- Framework：Next.js 16.1.1，App Router
- Runtime：React 19.2.3，TypeScript 5.9
- Styling：Tailwind CSS v4
- UI：shadcn/ui + Radix UI + lucide-react
- AI 服务：OpenAI-compatible LLM API，默认模型 `agnes-2.0-flash`
- 八字排盘：lunar-javascript
- 表单与校验：react-hook-form、zod
- 包管理：pnpm 9+
- 服务入口：自定义 `src/server.ts`，默认端口 `5000`

## 快速开始

```bash
pnpm install
pnpm dev
```

启动后访问：

```text
http://localhost:5000
```

## 常用命令

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

补充命令：

```bash
pnpm start
pnpm validate
```

## 目录结构

```text
src/
  app/
    (home)/                 # 首页
    name/                   # AI 起名流程
      input/                # 信息输入
      bazi/                 # 八字排盘结果
      preference/           # 起名偏好
      result/               # 起名结果
      detail/               # 名字详情
    test-name/              # 测名流程
      result/               # 测名结果
    api/
      bazi/                 # 八字排盘 API
      generate-names/       # AI 起名 API
      test-name/            # AI 测名 API
  components/
    tianyan/                # 项目业务组件
    ui/                     # shadcn/ui 基础组件
  lib/
    bazi.ts                 # 八字排盘核心计算
    compliance.ts           # 合规过滤
    rate-limit.ts           # 简单 IP 限流
    storage.ts              # 前端跨页状态
```

更多当前上下文请看 [docs/current/README.md](docs/current/README.md)。

## 开发边界

- 不要把本项目描述为算命、改运、预测运势产品。
- 不要新增技术栈或依赖，除非有明确任务要求。
- 不要绕过现有 Next.js App Router、shadcn/ui、Tailwind CSS v4 的项目结构。
- 不要将 docs 中的远期 PRD/调研计划误认为已实现功能。
- 当前优先保持 MVP 上下文准确、流程稳定、合规表达清晰。

## 当前验证重点

- 起名结果页以 `/api/generate-names` 返回为主结果来源。
- 内部名字池只作为接口失败时的基础推荐 fallback，并需要在 UI 中明确标注。
- 输入页不再自算八字预览，正式排盘统一走 `/api/bazi` 与 `src/lib/bazi.ts`。
- 合规过滤不能输出 `传统***学说` 这类脏文本。
