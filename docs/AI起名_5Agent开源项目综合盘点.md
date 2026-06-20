---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 965799332296643_0/project_7650447357674471680-files/docs/AI起名_5Agent开源项目综合盘点.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 965799332296643#1781913696399
    ReservedCode2: ""
---
# AI起名工具 · 5Agent开源项目综合盘点

> 项目群ID：7650447357674471680 | 整理时间：2026-06-12 | 刺客整理
> 
> 标注说明：✅ = 找到该项目，— = 未提及。5位Agent分别是：调研分析师、前端设计Agent、全栈研发Agent、产品经理Agent、竞品调研Agent

---

## 一、八字排盘引擎（核心底座）

| 项目 | 语言 | 协议 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 核心价值 |
|------|------|------|:---:|:---:|:---:|:---:|:---:|------|
| [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript) | JS/多语言 | MIT | ✅ | ✅ | ✅ | ✅ | — | 最全面农历库，5k+ stars，支持八字/五行/十神/节气/纳音/宜忌/神煞，多语言版本。**前端直接调，不需要后端算** |
| [lunisolar](https://gitee.com/liangchangchun/lunisolar) | TypeScript | — | ✅ | — | — | — | — | npm包，与Next.js技术栈完美匹配，八字四柱/五行/十神/神煞全支持，插件化架构 |
| [bazi-calculator-by-alvamind](https://www.npmjs.com/package/bazi-calculator-by-alvamind-for-browser) | TypeScript | MIT | ✅ | ✅ | ✅ | ✅ | — | npm包，浏览器+Node.js双端，四柱排盘+五行强度+日主分析+八宅风水+贵人/文昌/桃花等神煞，自带TS类型 |
| [shunshi-bazi-core](https://www.npmjs.com/package/shunshi-bazi-core) | TypeScript | — | ✅ | — | ✅ | — | — | 纯TypeScript，零框架依赖，**内置真太阳时校正** |
| [6tail/lunar-python](https://github.com/6tail/lunar-python) | Python | MIT | — | — | — | — | ✅ | 纯Python，零依赖，pip install直接用，被多个项目交叉验证准确率100%，公历↔农历/四柱八字/十神/大运流年/真太阳时 |
| [china-testing/bazi](https://github.com/china-testing/bazi) | Python | — | ✅ | — | ✅ | — | — | **功能最强的开源八字排盘工具**，五行分数/八字强弱/冲合刑会/十神/大运流年/格局分析，输出极其详细 |
| [cornerAnt/pyLunarCalendar](https://github.com/cornerAnt/pyLunarCalendar) | Python | — | ✅ | — | — | — | — | 无需数据库，基于《钦定协纪辨方书》，支持八字+每日凶煞+五行 |
| [Lofanmi/chinese-calendar-golang](https://github.com/Lofanmi/chinese-calendar-golang) | Go | — | ✅ | — | — | — | — | 干支历精确到秒，支持1904-3000年 |
| [cnchar](https://github.com/niccnchar/cnchar) | JS | — | — | — | ✅ | — | — | 汉字笔画/拼音/五行查询，前端字库工具 |

**交叉验证**：`lunar-javascript` 和 `bazi-calculator-by-alvamind` 是被最多Agent（4/5）共同推荐的核心排盘库。

**独门发现**：
- 调研分析师独有：lunisolar、pyLunarCalendar、chinese-calendar-golang
- 竞品调研Agent独有：lunar-python（Python方案，强调零依赖+100%验证）
- 全栈研发Agent独有：cnchar（前端字库工具）

---

## 二、喜用神/格局分析（核心差异化能力）

| 项目 | 语言 | 协议 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 核心价值 |
|------|------|------|:---:|:---:|:---:|:---:|:---:|------|
| [flytrap/BaziGo](https://github.com/flytrap/BaziGo) | Go | MIT | — | ✅ | — | — | — | **喜用神算法已有实现**，可移植到TS |
| [dglijin-oss/bazi-pan-skill](https://github.com/dglijin-oss/bazi-pan-skill) | Python | MIT-0 | — | ✅ | — | — | — | **格局判断+用神选取**（竞品缺失的能力），算法最值得参考 |
| [korean-saju](https://github.com/korean-saju) | Python | MIT | — | — | — | — | ✅ | **唯一实现了喜用神推导的开源库**，分析用神/格局/日干强弱/调候/合冲刑害，35,000例交叉验证100%准确。**杀手级发现** |

**这是最重要的发现类别**——所有Agent都指出"喜用神"是差异化关键，但真正找到实现方案的不多：
- 前端设计Agent找到了BaziGo和bazi-pan-skill（Go和Python方案）
- 竞品调研Agent找到了korean-saju（Python方案，最成熟）
- 调研分析师、全栈研发、产品经理都提到了china-testing/bazi的格局分析能力

---

## 三、起名引擎/应用

| 项目 | 语言 | 协议 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 核心价值 |
|------|------|------|:---:|:---:|:---:|:---:|:---:|------|
| [babyname/fate](https://github.com/babyname/fate) | Go | MIT | ✅ | ✅ | — | — | — | **GitHub第一个开源起名项目**，3k+ stars，821 commits，六大派融合（笔划/三才/补八字/卦象/天运/生肖），八字→喜用神→五格三才→卦象全链路，附Sqlite3字库 |
| [chinese-naming-mcp-toolset](https://github.com/SiwuXue/chinese-naming-mcp-toolset) | JS | — | — | ✅ | — | — | — | MCP协议起名工具集，10个工具（生成/分析/重名/八字/音韵/诗词），**可直接集成AI** |
| [NanBox/PiPi](https://github.com/NanBox/PiPi) / PiPiName | Python | — | ✅ | ✅ | — | — | — | 五格剖象法+古诗词取名，康熙笔画库+三才配置表完整 |
| [CrystalMarch/bazi](https://github.com/CrystalMarch/bazi) | Python | MIT | ✅ | — | — | — | ✅ | **唯一把八字+起名放一起的开源项目**，内置楚辞/诗经名字素材库+汉字五行属性+Flask API服务 |
| [Yangstud/BaZi_Calculator](https://github.com/Yangstud/BaZi_Calculator) | React | — | — | ✅ | — | — | — | **React+Vite排盘UI**，技术栈跟我们最接近，可参考交互设计 |
| [axbug/8Char-Uni-App](https://github.com/axbug/8Char-Uni-App) | UniAPP | — | ✅ | — | — | — | — | 完整八字排盘App，前端UI/交互设计可参考 |
| [letsgits/babyname](https://github.com/letsgits/babyname) | Chrome扩展 | — | ✅ | — | — | — | — | 八字起名浏览器插件，支持性别/名字长度/寓意选择 |
| [holynova/gushi_namer](https://github.com/holynova/gushi_namer) | JS | — | — | ✅ | — | ✅ | — | 纯前端诗词起名，移动端适配方案 |
| 互站网起名源码（¥199） | PHP+MySQL | 商用 | — | — | — | ✅ | — | 诗词起名+康熙字典数据库+汉字五行查询，完全开源可商用 |

**交叉验证**：`babyname/fate` 被2位Agent（调研分析师+前端设计）共同推荐为起名算法首选。

**独门发现**：
- 前端设计Agent独有：chinese-naming-mcp-toolset（MCP集成方案）、BaZi_Calculator（React UI参考）
- 产品经理Agent独有：互站网¥199源码（快速出MVP的捷径）
- 竞品调研Agent独有：CrystalMarch/bazi的起名功能强调

---

## 四、MCP/AI服务层

| 项目 | 语言 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 核心价值 |
|------|------|:---:|:---:|:---:|:---:|:---:|------|
| [bazi-mcp](https://www.npmjs.com/package/bazi-mcp) | Node.js | ✅ | ✅ | — | — | — | MCP Server，260+ stars，AI排盘准确性问题已解决，可直接被Agent调用 |
| [four-pillars MCP](https://www.npmjs.com/package/four-pillars) | — | ✅ | — | — | — | — | 规则引擎MCP，sub-200ms响应，按调用付费 |
| [@mingai/core](https://www.npmjs.com/package/@mingai/core) | — | ✅ | — | — | — | — | 全能命理SDK，八字+紫微+六爻+奇门一站式 |
| [gugudata起名API](https://www.gugudata.com/api/details/name-generator) | API服务 | ✅ | — | — | — | — | 八字喜用神起名，返回命盘分析+候选名字+三才五格评分 |

**独门发现**：MCP/API服务层主要由调研分析师和前端设计Agent找到，其他3位未涉及。

---

## 五、数据资源

| 资源 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 用途 |
|------|:---:|:---:|:---:|:---:|:---:|------|
| [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) | — | ✅ | — | ✅ | — | 诗经/楚辞/唐诗/宋词/论语/周易，诗词出处数据源 |
| [Chinese-Names-Corpus](https://github.com/wainshine/Chinese-Names-Corpus) | — | ✅ | — | — | — | 中文人名语料库，重名检测+网红名黑名单 |
| fate附带的Sqlite3字库 | ✅ | ✅ | — | — | — | 汉字五行+康熙笔画+拼音，起名引擎基础数据 |
| 汉字资源数据库(2万条) | — | — | ✅ | — | — | 拼音+五行+笔画+吉凶+康熙+字源，核心字库数据源 |
| 康熙字典数据库(6万条) | — | — | ✅ | — | — | 更全的汉字五行+吉凶 |

**交叉验证**：chinese-poetry 被2位Agent（前端设计+产品经理）共同推荐。fate字库被2位（调研分析师+前端设计）推荐。

---

## 六、架构/UI参考

| 项目 | 调研分析师 | 前端设计 | 全栈研发 | 产品经理 | 竞品调研 | 可借鉴 |
|------|:---:|:---:|:---:|:---:|:---:|------|
| [fulu (Go+Next.js)](https://juejin.cn/post/7617688223623561225) | — | ✅ | — | — | — | **SSE流式输出AI分析报告**，打字机效果 |
| AI算命系统(FastAPI) | — | — | ✅ | — | — | 全栈架构参考：八字+OpenAI分析+前端 |

---

## 七、现有开源的空白（需要自建）

**5位Agent共识——以下能力在开源生态中缺失：**

1. **喜用神智能判定**（从"缺啥补啥" → "格局分析→扶抑调候通关"）——虽有korean-saju做参考，但仍需移植和深度改造
2. **名字质量评估**（反网红名、俗名检测）——无人做
3. **重名/热名数据**（结合公安姓名报告）——仅有语料库，无实时数据
4. **多方言谐音检测**（粤语/闽南语/客家话）——完全空白
5. **合规用词过滤**——完全空白
6. **AI大模型智能起名+寓意解读**——完全空白，**这就是最大差异化切入点**

---

## 八、各Agent推荐的技术路线对比

| Agent | 推荐排盘引擎 | 推荐起名算法 | 推荐AI层 | MVP周期 |
|-------|------------|------------|---------|---------|
| 调研分析师 | lunisolar（TS）+ bazi-calculator | fate六大派融合（Go→移植TS） | LLM增强 | 2-4周 |
| 前端设计Agent | lunar-javascript（主）+ bazi-calculator（辅） | fate算法 + bazi-pan-skill用神选取 | SSE流式架构 | — |
| 全栈研发Agent | lunar-javascript + bazi-calculator | china-testing/bazi格局分析 + fate | DeepSeek/通义千问 | 1人1周（方案C） |
| 产品经理Agent | lunar-typescript | 互站网¥199源码字库 | DeepSeek/通义千问 | 1人1周 |
| 竞品调研Agent | lunar-python（Python方案） | korean-saju喜用神 + CrystalMarch/bazi字库 | LLM创意+魔鬼辩护 | 2-3周 |

**共识点**：
- 排盘引擎：lunar-javascript/lunar-typescript 是首选（5/5间接或直接认可）
- 起名算法：fate 是算法参考首选（2/5直接推荐）
- AI层：所有Agent都认为需要自建，开源无现成方案

**分歧点**：
- Python路线（竞品调研Agent：lunar-python + korean-saju）vs TypeScript路线（其他4位：lunar-javascript + TS生态）
- 快速MVP路线（产品经理Agent：¥199买源码1周出）vs 精品路线（调研分析师：自研2-4周）

---

## 九、最值得优先Clone研究的3+1个项目

**全员交叉验证后推荐：**

1. **[6tail/lunar-javascript](https://github.com/6tail/lunar-javascript)** — 排盘基础，4/5 Agent推荐
2. **[babyname/fate](https://github.com/babyname/fate)** — 算法+字库，2/5直接推荐但被全员间接认可
3. **[korean-saju](https://github.com/korean-saju)** — 喜用神核心算法，竞品调研Agent的杀手级发现

**+1 备选：**
4. **[Yangstud/BaZi_Calculator](https://github.com/Yangstud/BaZi_Calculator)** — React+Vite排盘UI，前端设计Agent推荐，技术栈最接近

---

> 数据来源：调研分析师、前端设计Agent、全栈研发Agent、产品经理Agent、竞品调研Agent，5位Agent交叉验证

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
