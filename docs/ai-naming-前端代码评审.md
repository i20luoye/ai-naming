---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/ai-naming-前端代码评审.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913680642
    ReservedCode2: ""
---
# 天衍 AI 起名工具 — 前端代码评审

> 评审人：Pixel（前端设计Agent） | 2026-06-14

---

## 一、总体印象

项目完成度令人惊喜。品牌调性「墨韵金辉」在代码层面得到了非常好的贯彻——从 `DESIGN.md` 到 `globals.css` 到页面组件，设计语言的翻译一致性很高。作为一个由扣子编程生成的 MVP，能在首版就把暗色沉浸感、金色体系、五行色彩和合规约束都做到位，值得肯定。

**但**，从专业前端设计和工程品质角度，有若干问题需要修正。以下按严重程度排序。

---

## 二、🔴 必须修（P0）

### 1. 首页 600+ 行巨型单文件，且内嵌 `<style jsx global>`

`src/app/(home)/page.tsx` 是一个超过 600 行的单文件组件，且在 JSX 末尾用 `<style jsx global>` 注入了约 200 行 CSS 关键帧和组件样式。

**问题：**
- 全局样式污染：`<style jsx global>` 中的 `.card`、`.bazi-tag`、`.nav-link` 等选择器会与 shadcn/ui 的同名类冲突
- 无法复用：这些样式只能在首页生效，其他页面如果需要相同效果必须重写
- 维护噩梦：globals.css 定义了一套完整的设计系统，但首页又绕开它自己写了一套

**建议：**
- 所有组件样式迁移到 `globals.css` 的 `@layer components` 中
- 首页拆分为子组件：`HeroSection`、`ProcessSection`、`PhilosophySection`、`CasesSection`、`CTASection`、`Footer`

### 2. 姓氏五行数据重复定义 3 次

`SURNAME_WX` / `surnameWxMap` 在以下文件中各写了一份：
- `src/app/name/input/page.tsx` — 约 150 个姓
- `src/app/name/bazi/page.tsx` — 约 30 个姓（子集）
- `src/app/test-name/page.tsx` — 约 60 个姓（子集）

**问题：**
- 数据不一致风险：三个文件的数据范围和内容略有差异
- 维护成本：改一处忘改另一处

**建议：**
- 提取到 `src/lib/data/surname-wuxing.ts`，统一导出
- 其他文件引用：`import { SURNAME_WX } from '@/lib/data/surname-wuxing'`

### 3. 五行生克数据重复定义 2 次

`WUXING_SHENG`、`WUXING_KE`、`WUXING_BEI_SHENG`、`WUXING_BEI_KE` 在 `src/lib/bazi.ts` 和 `src/app/name/bazi/page.tsx` 中各有一份。

**建议：** 统一从 `bazi.ts` 导出，页面组件只引用。

### 4. `localStorage` 跨页数据流转 — 无错误处理、无版本管理

`src/lib/storage.ts` 使用 `localStorage` 在页面间传递起名流程数据。

**问题：**
- 无 try-catch：隐身模式或 localStorage 被禁用时直接白屏
- 无版本管理：数据结构变更后旧数据无法自动清理，可能导致页面崩溃
- 无数据校验：从 localStorage 读出的数据直接使用，不做 zod 校验

**建议：**
```typescript
// storage.ts 改进
const STORAGE_VERSION = 1;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed.__v !== STORAGE_VERSION) {
      localStorage.removeItem(key);
      return fallback;
    }
    return parsed.data as T;
  } catch {
    return fallback;
  }
}
```

---

## 三、🟡 应该修（P1）

### 5. `package.json` 的 name 是 "projects"

```json
{ "name": "projects", "version": "0.1.0" }
```

应该改为 `"tianyan"` 或 `"ai-naming"`，与仓库名一致。

### 6. 色彩系统存在硬编码 hex

虽然 `globals.css` 定义了完整的语义变量，但多处代码直接硬编码：

- `src/app/name/input/page.tsx` 中的内联 `style`
- `src/app/name/bazi/page.tsx` 中的 `WUXING_COLORS` 和 `WUXING_RGB` 对象
- 首页中大量 `rgba(200, 164, 92, ...)` 直接写死

**建议：**
- `rgba(200, 164, 92, X)` 统一改为 `oklch(from var(--color-gold-400) l c h / X)` 或 `color-mix(in srgb, var(--color-gold-400) X%, transparent)`
- `WUXING_COLORS` 和 `WUXING_RGB` 应从 CSS 变量读取，避免 JS 端和 CSS 端不同步

### 7. 圆角不一致

`DESIGN.md` 规定卡片圆角 8px，但实际代码中：
- 首页卡片：`rounded-sm`（4px）
- `GoldLine.tsx` 的 JinmingCard：`rounded-xl`
- 各处混用 `rounded-sm` / `rounded-lg` / `rounded-xl`

**建议：** 统一使用 `rounded-lg`（8px），通过 `--radius` 变量控制，与 DESIGN.md 对齐。

### 8. `next.config.ts` 的 `images.remotePatterns` 过于宽松

```typescript
images: {
  remotePatterns: [{ protocol: 'https', hostname: '*', pathname: '/**' }],
}
```

允许任何域名加载图片，存在安全隐患。MVP 阶段也应限制为实际使用的域名。

### 9. 缺少亮色模式变量定义

`:root` 只定义了暗色变量，没有 `.dark` 选择器也没有亮色方案。虽然 DESIGN.md 明确"禁止浅色背景"，但 shadcn/ui 的 `@custom-variant dark` 要求正确配置暗色切换。当前代码可以工作是因为默认就是暗色，但如果未来要支持双主题会很被动。

**建议：** 在 `:root` 中显式定义暗色变量，并加 `.light` 选择器为亮色预留。或至少在注释中说明当前只支持暗色。

### 10. API 路由缺少速率限制

三个 API 路由（`/api/bazi`、`/api/generate-names`、`/api/test-name`）均无速率限制。`generate-names` 和 `test-name` 会调用 LLM，每次请求都有成本。

**建议：** 至少加简单的 IP 限流中间件。

---

## 四、🟢 建议优化（P2）

### 11. 页面组件拆分

起名流程各页面（input / bazi / preference / result / detail）代码量都在 300-600 行，可以提取公共部分：

- `useBaziFlow` 自定义 Hook：管理跨页数据流转、步骤导航
- `FlowPageLayout` 组件：统一包裹 SubHeader + StepIndicator + GoldLine

### 12. 字体加载优化

`Noto Serif SC` 和 `Noto Sans SC` 是 CJK 字体，文件体积大。建议：
- 使用 `next/font/google` 的 `subsets: ['chinese-simplified']` 和 `weight` 参数按需加载
- 或自托管 woff2，配合 `font-display: swap`

### 13. 缺少 SEO 语义

首页有 `<section>` 但缺少有意义的 `aria-label`。各页面无 `metadata` 导出（除 layout 外）。

**建议：**
```typescript
// src/app/name/input/page.tsx
export const metadata = {
  title: 'AI八字起名 - 天衍',
  description: '输入生辰信息，AI为您推演良名',
};
```

### 14. `coze-coding-dev-sdk` 依赖风险

三个 API 路由直接依赖 `coze-coding-dev-sdk`，与扣子编程平台强耦合。如果未来迁移部署环境，需要重写。

**建议：** 抽象 LLM 调用层到 `src/lib/llm.ts`，API 路由只依赖抽象接口。

### 15. 未使用但安装的依赖

`@aws-sdk/client-s3`、`@aws-sdk/lib-storage`、`@supabase/supabase-js`、`drizzle-orm`、`drizzle-kit`、`pg` 在代码中完全没有引用，但出现在 `package.json` 依赖中。增加了安装体积和安全审计负担。

**建议：** 移除未使用的依赖，需要时再加。

### 16. `assets/` 目录冗余

`assets/` 目录下有大量 HTML 文件（`name-bazi.html`、`name-input.html` 等），与 `.cozeproj/prototype/web/` 下的原型文件高度重复。`assets/image.png` 等截图文件也应清理。

---

## 五、设计评价

### 👍 做得好的

1. **品牌语言落地度高**：墨黑+金箔+朱砂的色彩体系，从 DESIGN.md 到 CSS 到组件层层贯彻，一致性很好
2. **合规意识到位**：LLM Prompt 内置合规约束，footer 有免责声明，API 返回也做了中性化处理
3. **设计系统有结构**：globals.css 中的 `@layer components` 组织清晰，五行色、金色光晕、仪式感输入框等都抽象为语义类
4. **交互流程完整**：起名四步流程（输入→排盘→偏好→结果）+ 测名两步流程，数据流转完整
5. **动效克制有质感**：金色扫描线、呼吸动画、淡入上移、hover 上浮，都符合「东方古典+现代极简」的定位

### 👎 需要改进的

1. **首页太长、信息密度不均**：Hero + 流程 + 理念 + 案例 + CTA + Footer 一路下来，缺少节奏变化。特别是"理念"和"案例"区偏弱，与前面 Hero 的质感落差大
2. **移动端适配不足**：虽然说了"移动端优先"，但代码中 `md:grid-cols-2` 等断点处理较粗，小屏幕下四柱排盘和结果页体验需要验证
3. **评分可视化缺乏层次**：测名结果的评分圆环只用了颜色区分，缺少动画过渡和数字跳动效果
4. **空状态和错误状态缺失**：没有 loading skeleton、没有错误边界、没有空结果提示

---

## 六、优先修复路线

| 优先级 | 事项 | 预估工时 |
|--------|------|---------|
| P0 | 首页拆组件 + 样式迁移 globals.css | 3h |
| P0 | 姓氏五行数据统一到 data/ | 1h |
| P0 | storage.ts 加版本管理和错误处理 | 1h |
| P1 | package.json name 修正 | 5min |
| P1 | 硬编码色彩统一到 CSS 变量 | 2h |
| P1 | 圆角统一 | 30min |
| P1 | images.remotePatterns 收紧 | 5min |
| P1 | API 加速率限制 | 1h |
| P2 | 页面组件拆分（useBaziFlow） | 2h |
| P2 | 字体加载优化 | 1h |
| P2 | SEO metadata | 30min |
| P2 | 清理未使用依赖和冗余 assets | 30min |

**总计预估：约 12.5h**

---

## 七、总结

这是一个**完成度很高的 MVP**，品牌调性落地是最大的亮点。核心问题集中在**代码组织**（重复数据、巨型组件、样式散落）和**工程健壮性**（错误处理、数据版本、安全策略）上。设计层面不需要大改，更多是微调和打磨。

建议按 P0 → P1 → P2 的顺序逐步修复，P0 修完后代码质量会有质的提升。

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
