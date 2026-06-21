# Public Beta 上线检查清单

> 小流量公开测试前的最后检查。每一项必须人工确认通过后方可开放公网入口。

## 1. 环境变量检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| NEXT_PUBLIC_SITE_URL | 检查生产环境变量 | 已设置为正式域名（如 https://tianyan.app），不是 localhost |
| LLM_API_KEY | 检查生产环境变量 | 已设置且非空 |
| LLM_BASE_URL | 检查生产环境变量 | 已设置为有效的 LLM API 地址 |
| LLM_MODEL | 检查生产环境变量 | 已设置（默认 agnes-2.0-flash） |
| 客户端不暴露 secret | 浏览器 DevTools → Sources 搜索 LLM_API_KEY | 搜索结果为空 |
| env-check 无警告 | 构建日志 | 无 "NEXT_PUBLIC_SITE_URL 未设置" 警告 |

## 2. sitemap 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| sitemap.xml 可访问 | curl `${SITE_URL}/sitemap.xml` | 返回 200 + XML |
| 包含首页 | 检查 XML 内容 | 包含 `<loc>${SITE_URL}/</loc>` |
| 包含起名输入页 | 检查 XML 内容 | 包含 `/name/input` |
| 包含测名页 | 检查 XML 内容 | 包含 `/test-name` |
| 包含合规页 | 检查 XML 内容 | 包含 `/privacy` `/terms` `/disclaimer` |
| 不包含 API 路由 | 检查 XML 内容 | 不包含 `/api/` |
| 不包含个人结果页 | 检查 XML 内容 | 不包含 `/name/result` `/name/detail` `/test-name/result` |
| URL 为绝对 URL | 检查 XML 内容 | 所有 `<loc>` 以 `https://` 开头 |

## 3. robots 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| robots.txt 可访问 | curl `${SITE_URL}/robots.txt` | 返回 200 + text/plain |
| Allow / | 检查内容 | 包含 `Allow: /` |
| Disallow /api/ | 检查内容 | 包含 `Disallow: /api/` |
| Disallow 个人结果页 | 检查内容 | 包含 `/name/result` `/test-name/result` |
| sitemap 指向正确 | 检查内容 | `Sitemap: ${SITE_URL}/sitemap.xml` |

## 4. canonical 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| 首页 canonical | 查看页面源码 `<link rel="canonical">` | 指向 `${SITE_URL}/` |
| 合规页 canonical | 查看页面源码 | 每个合规页有对应 canonical |
| canonical 为绝对 URL | 检查 href 值 | 以 `https://` 开头 |
| 不硬编码 localhost | 检查 href 值 | 不包含 `localhost` |

## 5. JSON-LD 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| WebSite schema 存在 | 查看页面源码 `<script type="application/ld+json">` | 包含 `"@type":"WebSite"` |
| Organization schema 存在 | 查看页面源码 | 包含 `"@type":"Organization"` |
| WebApplication schema 存在 | 查看页面源码 | 包含 `"@type":"WebApplication"` |
| 无虚假评分 | 检查 JSON-LD 内容 | 不包含 `aggregateRating` |
| 无合规风险词 | 检查 JSON-LD 内容 | 不包含"算命""改运""旺财" |
| JSON-LD 语法有效 | Google Rich Results Test | 无语法错误 |

## 6. 合规页面检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| /privacy 可访问 | curl `${SITE_URL}/privacy` | 返回 200 |
| /terms 可访问 | curl `${SITE_URL}/terms` | 返回 200 |
| /disclaimer 可访问 | curl `${SITE_URL}/disclaimer` | 返回 200 |
| 强调传统文化参考 | 检查页面内容 | 包含"传统文化参考" |
| 声明不提供医疗/法律/投资/命运预测 | 检查页面内容 | 包含"不提供" |
| 不承诺改运/旺财 | 检查页面内容 | 包含"不承诺改运"，无正向承诺 |
| 出生信息仅用于生成报告 | 检查隐私政策 | 包含"仅用于" |

## 7. 结果页 noindex / 不进 sitemap 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| /name/result 不在 sitemap | 检查 sitemap.xml | 不包含 `/name/result` |
| /name/detail 不在 sitemap | 检查 sitemap.xml | 不包含 `/name/detail` |
| /test-name/result 不在 sitemap | 检查 sitemap.xml | 不包含 `/test-name/result` |
| robots disallow 结果页 | 检查 robots.txt | 包含 `/name/result` `/test-name/result` |

## 8. LLM API 检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| /api/generate-names 凭证缺失返回 503 | 不设置 LLM_API_KEY 调用 | 返回 503 + `LLM_CREDENTIALS_MISSING` |
| /api/test-name 凭证缺失返回 503 | 不设置 LLM_API_KEY 调用 | 返回 503 + `LLM_CREDENTIALS_MISSING` |
| 凭证缺失不暴露 secret | 检查 503 响应体 | 不包含 API key 值 |
| LLM 失败返回友好错误 | 模拟 LLM 500 | 返回 500 + "名字生成失败，请稍后重试" |
| 不暴露 stack trace | 检查 500 响应体 | 不包含 stack trace |
| 不暴露 raw prompt | 检查所有错误响应 | 不包含 prompt 原文 |
| 不暴露 raw AI output | 检查 502 响应体 | 不包含 `raw` 字段 |

## 9. 埋点隐私检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| 不记录完整出生年月日时 | 检查 trackEvent 调用 | payload 无 `birthDate` `birthTime` |
| 不记录完整姓名 | 检查 trackEvent 调用 | payload 无 `fullName` `surname` `givenName`，只有 `surnameLength` `givenNameLength` |
| 不记录手机号/身份证/IP | 检查 trackEvent 调用 | payload 无 `phone` `idCard` `ip` |
| 不记录 LLM prompt | 检查 trackEvent 调用 | payload 无 `rawPrompt` |
| 不记录 raw AI output | 检查 trackEvent 调用 | payload 无 `rawAIOutput` |
| 生产环境静默 | 生产环境打开 DevTools Console | 无 `[analytics]` 日志 |
| 不发第三方请求 | DevTools Network 面板 | 无第三方统计请求 |
| sanitizePayload 过滤敏感字段 | 检查 track.ts 源码 | 包含 SENSITIVE_PAYLOAD_KEYS 列表 |

## 10. 移动端主流程检查

| 检查项 | 命令 / 方法 | 通过标准 |
|---|---|---|
| 首页 CTA 明显 | 移动端浏览首页 | 「开始起名」按钮可见且可点击 |
| 起名输入页表单可用 | 移动端走完 4 步 | 每步表单可填写、可前进 |
| 结果页权益卡不溢出 | 移动端查看结果页 | 免费版/完整报告卡片不超出屏幕 |
| 解锁按钮 disabled 明确 | 移动端查看解锁区 | 按钮半透明 + 「即将上线」文案 |
| 合规页移动端可读 | 移动端浏览 /privacy | 文字可读、不溢出 |
| 数据缺失友好提示 | 清除 localStorage 后访问 /name/result | 显示「起名信息不完整」+ 「重新填写」按钮 |

## 11. 上线后人工巡检项

| 巡检项 | 频率 | 方法 |
|---|---|---|
| 首页可访问 | 每日 | 浏览器访问首页 |
| 起名主流程可用 | 每日 | 走完输入→排盘→偏好→结果全流程 |
| 测名主流程可用 | 每日 | 走完测名提交→结果展示 |
| LLM API 可用 | 每日 | 检查起名结果是否正常生成 |
| 合规页可访问 | 每周 | 访问 /privacy /terms /disclaimer |
| sitemap 可访问 | 每周 | curl sitemap.xml |
| robots 可访问 | 每周 | curl robots.txt |
| 错误兜底有效 | 每周 | 模拟 LLM 超时，检查友好错误提示 |
| 埋点静默 | 每周 | 生产环境 DevTools 确认无第三方请求 |
| localStorage 缺失引导 | 每周 | 清除 localStorage 后访问结果页 |

## 12. 回滚预案

| 场景 | 操作 |
|---|---|
| LLM API 大面积失败 | 保持服务运行，fallback 到基础推荐池 |
| 前端页面白屏 | 检查构建产物，回退到上一版本 |
| 合规风险 | 立即下线相关页面，审查内容后重新上线 |
| 流量异常 | 检查限流配置（当前 10 次/60 秒/IP） |

---

**检查人**：_______________  
**检查日期**：_______________  
**通过状态**：□ 全部通过  □ 存在问题（附说明）
