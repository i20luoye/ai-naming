import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

test('test-name page does not keep a local simplified bazi preview algorithm', () => {
  const source = readProjectFile('src/app/test-name/page.tsx');

  assert.doesNotMatch(source, /function\s+calcBazi/);
  assert.doesNotMatch(source, /const\s+TIAN_GAN/);
  assert.doesNotMatch(source, /const\s+DI_ZHI/);
  assert.doesNotMatch(source, /new\s+Date\(2000,\s*0,\s*1\)/);
  assert.doesNotMatch(source, /\bbaziPreview\b/);
});

test('default package scripts are cross-platform and do not expose provider-branded aliases', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts: Record<string, string>;
  };

  assert.equal(packageJson.scripts.dev, 'next dev -p 5000');
  assert.equal(packageJson.scripts.build, 'next build');
  assert.equal(packageJson.scripts.start, 'next start -p 5000');
  assert.ok(packageJson.scripts['live:llm']);
  assert.deepEqual(
    Object.keys(packageJson.scripts).filter((key) => key.toLowerCase().includes('coze')),
    [],
  );
});

test('root layout does not depend on Google font downloads during build', () => {
  const source = readProjectFile('src/app/layout.tsx');

  assert.doesNotMatch(source, /next\/font\/google/);
  assert.doesNotMatch(source, /Noto_Serif_SC/);
  assert.doesNotMatch(source, /Noto_Sans_SC/);
  assert.doesNotMatch(source, /JetBrains_Mono/);
});

test('generate names API uses knowledge context and validation markers', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  assert.match(source, /buildNamingPrompt/);
  assert.match(source, /filterChars/);
  assert.match(source, /searchClassics/);
  assert.match(source, /validateGeneratedNames/);
  assert.match(source, /scoreGeneratedNames/);
  assert.match(source, /knowledgeBacked/);
  assert.match(source, /validationWarnings/);
});

test('name result page shows lightweight knowledge backing metadata', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  assert.match(source, /知识库校验/);
  assert.match(source, /validationWarnings/);
  assert.match(source, /qualityScore/);
});

test('name result fallback recommendations honor excluded characters', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  assert.match(source, /function generateVisibleAndLocked\(surname: string, xiList: string\[\], excludeChars/);
  assert.match(source, /excludeSet/);
  assert.match(source, /generateVisibleAndLocked\(inputData\.surname, baziData\.xiYong, prefData\?\.excludeChars/);
});

test('current naming QA report documents real-case quality review structure', () => {
  const source = readProjectFile('docs/current/naming-qa-report.md');

  for (const heading of [
    '测试目标',
    '测试范围',
    '测试维度',
    '通过标准',
    '测试案例表',
    '人工评分表',
    '问题汇总',
    '后续修复建议',
  ]) {
    assert.match(source, new RegExp(`## ${heading}`));
  }

  const caseCount = Array.from(source.matchAll(/\| QA-\d{3} \|/g)).length;
  assert.ok(caseCount >= 30, `expected at least 30 QA cases, got ${caseCount}`);
  assert.match(source, /knowledgeBacked 占比/);
  assert.match(source, /fallback 触发率/);
});

test('live LLM regression pack has script fixtures and report metrics', () => {
  const script = readProjectFile('scripts/live-llm-regression.ts');
  const cases = readProjectFile('src/lib/knowledge/fixtures/live-llm-cases.ts');
  const report = readProjectFile('docs/current/live-llm-regression-report.md');

  assert.match(script, /checkLlmPreflight/);
  assert.match(script, /BLOCKED_BY_CREDENTIALS/);
  assert.match(script, /writeBlockedCredentialsReport/);
  assert.match(script, /\/api\/generate-names/);
  assert.match(script, /LIVE_LLM_REGRESSION_CASES/);
  assert.match(script, /knowledgeBackedRate/);
  assert.match(script, /fabricatedSourceRisk/);

  const caseCount = Array.from(cases.matchAll(/id: 'LLM-\d{3}'/g)).length;
  assert.ok(caseCount >= 50, `expected at least 50 live LLM cases, got ${caseCount}`);

  for (const metric of [
    'knowledgeBackedRate',
    'warningRate',
    'downgradeRate',
    'rejectRate',
    'averageQualityScore',
    'fallbackRate',
    'duplicateNameRate',
    'forbiddenCharFailureRate',
    'fabricatedSourceRisk',
    'complianceViolationRate',
  ]) {
    assert.match(report, new RegExp(metric));
  }
});

test('generate names API has a safe missing-credentials preflight response', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  assert.match(source, /checkLlmPreflight/);
  assert.match(source, /LLM_CREDENTIALS_MISSING/);
  assert.match(source, /status:\s*503/);
  const missingCredentialResponse = source.match(/code:\s*'LLM_CREDENTIALS_MISSING'[\s\S]*?status:\s*503/);
  assert.ok(missingCredentialResponse);
  assert.doesNotMatch(missingCredentialResponse[0], /LLM_API_KEY/);
});

test('.env.example documents generic LLM configuration placeholders without provider branding', () => {
  const source = readProjectFile('.env.example');

  assert.match(source, /LLM_API_KEY=/);
  assert.match(source, /LLM_BASE_URL=https:\/\/apihub\.agnes-ai\.com\/v1/);
  assert.match(source, /LLM_MODEL=agnes-2\.0-flash/);
  assert.match(source, /\/api\/generate-names/);
  assert.match(source, /live regression/);
  assert.doesNotMatch(source, /COZE/i);
  assert.doesNotMatch(source, /doubao/i);
});

test('LLM API routes use configurable model instead of the removed doubao default', () => {
  const generateNamesSource = readProjectFile('src/app/api/generate-names/route.ts');
  const testNameSource = readProjectFile('src/app/api/test-name/route.ts');
  const liveScript = readProjectFile('scripts/live-llm-regression.ts');

  assert.match(generateNamesSource, /getLlmModel/);
  assert.match(testNameSource, /getLlmModel/);
  assert.match(liveScript, /agnes-2\.0-flash/);
  assert.doesNotMatch(generateNamesSource, /doubao-seed/);
  assert.doesNotMatch(testNameSource, /doubao-seed/);
  assert.doesNotMatch(liveScript, /doubao-seed/);
});

test('active runtime configuration and LLM API code do not expose removed provider branding', () => {
  const activeFiles = [
    '.env.example',
    'package.json',
    'next.config.ts',
    'src/server.ts',
    'src/lib/llm/preflight.ts',
    'src/lib/llm/client.ts',
    'src/app/api/generate-names/route.ts',
    'src/app/api/test-name/route.ts',
    'scripts/live-llm-regression.ts',
  ];

  for (const file of activeFiles) {
    const source = readProjectFile(file);
    assert.doesNotMatch(source, /coze/i, `${file} still contains removed provider branding`);
    assert.doesNotMatch(source, /doubao/i, `${file} still contains removed model branding`);
  }
});

test('live regression static guardrails confirm prompt contains quoteId/sourceStatus constraints', () => {
  const promptSource = readProjectFile('src/lib/knowledge/prompt/build-naming-prompt.ts');
  const validationSource = readProjectFile('src/lib/knowledge/validation/validate-generated-names.ts');
  const scoringSource = readProjectFile('src/lib/knowledge/scoring/score-generated-names.ts');
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');

  // prompt 必须向模型提供 quoteId 和 sourceStatus 约束
  assert.match(promptSource, /quoteId=/);
  assert.match(promptSource, /poemSourceId/);
  assert.match(promptSource, /sourceStatus/);
  assert.match(promptSource, /不要为了.*编造出处/);

  // validation 必须用 poemSourceId 校验出处，并识别 fabricated source
  assert.match(validationSource, /poemSourceId/);
  assert.match(validationSource, /fabricatedSource/);
  assert.match(validationSource, /quoteIdSet/);
  assert.match(validationSource, /sourceStatus.*none/);

  // scoring 必须对 fabricated source 严重扣分
  assert.match(scoringSource, /编造出处/);
  assert.match(scoringSource, /qualityScore < 65/);

  // route 必须包含 retry/repair 机制
  assert.match(routeSource, /attemptRepair/);
  assert.match(routeSource, /repairedFromReject/);
  assert.match(routeSource, /repairWarnings/);
  assert.match(routeSource, /最多重试 1 次/);
});

test('generate names API route increases knowledge supply limits', () => {
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');

  // 候选字池上限提升到 35-50
  assert.match(routeSource, /CANDIDATE_CHAR_LIMIT\s*=\s*4[0-9]/);
  // 出处卡上限提升到 12-20
  assert.match(routeSource, /CLASSIC_QUOTE_LIMIT\s*=\s*1[2-9]/);
});

test('pre-launch quality gate: repair prompt contains excludeChars strong constraint', () => {
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');

  // attemptRepair 必须接收 excludeChars 参数
  assert.match(routeSource, /excludeChars:\s*string\[\]/);
  // repair prompt 必须明确重复避用字约束
  assert.match(routeSource, /避用字强约束/);
  assert.match(routeSource, /绝对不能包含上述任何一个避用字/);
  // repair 后必须立即过滤命中避用字的结果
  assert.match(routeSource, /repair 后立即过滤掉仍命中避用字的结果/);
});

test('pre-launch quality gate: final returned names hard-filter excludeChars', () => {
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');

  // 最终返回前必须有硬过滤兜底
  assert.match(routeSource, /硬过滤兜底/);
  assert.match(routeSource, /命中用户避用字不展示为正常推荐/);
  // excludeCharSet 必须被构造并用于过滤
  assert.match(routeSource, /excludeCharSet\s*=\s*new Set\(excludeChars\)/);
});

test('pre-launch quality gate: knowledgeBacked=false names carry fallback marker', () => {
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');
  const nameGenSource = readProjectFile('src/lib/name-generation.ts');

  // route 必须在 knowledgeBacked=false 时打 sourceStatus: 'fallback' 标记
  assert.match(routeSource, /sourceStatus:\s*'fallback'/);
  // route 必须把 fallback 名字的 qualityLevel 改为「基础候选」
  assert.match(routeSource, /qualityLevel:\s*'基础候选'/);
  // route 必须添加 fallback 提示语
  assert.match(routeSource, /当前知识样例暂无充足典籍支撑，已提供基础候选参考/);
  // route 必须避免 score=0 被当作正式质量分展示
  assert.match(routeSource, /qualityScore === 0/);

  // name-generation 必须导出 BASIC_CANDIDATE_LABEL 和 BASIC_CANDIDATE_HINT
  assert.match(nameGenSource, /export const BASIC_CANDIDATE_LABEL/);
  assert.match(nameGenSource, /export const BASIC_CANDIDATE_HINT/);
  // normalizeGeneratedNames 必须根据 knowledgeBacked=false/sourceStatus=fallback 切换 label
  assert.match(nameGenSource, /isBasicCandidate\s*=\s*item\.knowledgeBacked === false/);
  assert.match(nameGenSource, /sourceLabel:\s*isBasicCandidate \? BASIC_CANDIDATE_LABEL/);
});

test('pre-launch quality gate: result page shows basic candidate label and hides score=0', () => {
  const pageSource = readProjectFile('src/app/name/result/page.tsx');

  // 必须引入 BASIC_CANDIDATE_LABEL 和 BASIC_CANDIDATE_HINT
  assert.match(pageSource, /BASIC_CANDIDATE_LABEL/);
  assert.match(pageSource, /BASIC_CANDIDATE_HINT/);
  // 必须计算 isBasicCandidate
  assert.match(pageSource, /isBasicCandidate\s*=/);
  // 基础候选不展示「五行优选」顶标
  assert.match(pageSource, /isTop && !isBasicCandidate/);
  // 基础候选不展示正式质量分
  assert.match(pageSource, /showFormalQualityScore/);
  assert.match(pageSource, /!isBasicCandidate/);
  // 基础候选展示提示语
  assert.match(pageSource, /\{BASIC_CANDIDATE_HINT\}/);
});

test('pre-launch quality gate: fabricatedSourceRisk static guardrail still holds', () => {
  const validationSource = readProjectFile('src/lib/knowledge/validation/validate-generated-names.ts');
  const scoringSource = readProjectFile('src/lib/knowledge/scoring/score-generated-names.ts');

  // validation 仍然必须识别 fabricated source
  assert.match(validationSource, /fabricatedSource/);
  assert.match(validationSource, /quoteIdSet/);
  // scoring 仍然必须重罚 fabricated source
  assert.match(scoringSource, /编造出处/);
  assert.match(scoringSource, /-45/);
});

test('pre-launch quality gate: rejectRate does not rebound due to excludeChars filter', () => {
  const routeSource = readProjectFile('src/app/api/generate-names/route.ts');

  // 硬过滤只是把命中避用字的名字从展示中剔除，不应把所有名字都 reject
  // 验证逻辑：displayableNames 为空时仍回退到 scoredNames（不会因过滤导致空列表）
  assert.match(routeSource, /displayableNames\.length > 0 \? displayableNames : scoredNames/);
  // attemptRepair 仍受「最多重试 1 次」约束
  assert.match(routeSource, /最多重试 1 次/);
});

/* ================================================================
   SEO / GEO & Paywall Preflight Pack 测试
   ================================================================ */

test('SEO: site-config reads NEXT_PUBLIC_SITE_URL and builds absolute canonical URL', () => {
  const source = readProjectFile('src/lib/seo/site-config.ts');

  // 必须从环境变量读取 siteUrl
  assert.match(source, /process\.env\.NEXT_PUBLIC_SITE_URL/);
  // 不硬编码 localhost 为生产地址（仅作为本地开发回退）
  assert.match(source, /本地开发回退/);
  // 必须提供 canonical URL 构造函数
  assert.match(source, /export function buildCanonicalUrl/);
  // 必须提供站点配置函数
  assert.match(source, /export function getSiteConfig/);
  // 必须包含必要字段
  assert.match(source, /siteName/);
  assert.match(source, /siteUrl/);
  assert.match(source, /defaultTitle/);
  assert.match(source, /defaultDescription/);
  assert.match(source, /defaultKeywords/);
  assert.match(source, /socialImage/);
});

test('SEO: sitemap excludes /api/ and temporary result pages, uses absolute URLs', () => {
  const source = readProjectFile('src/app/sitemap.ts');

  // 必须使用 buildCanonicalUrl 构造绝对 URL
  assert.match(source, /buildCanonicalUrl/);
  // 必须包含核心公开页面
  assert.match(source, /path:\s*'\/'/);
  assert.match(source, /path:\s*'\/name\/input'/);
  assert.match(source, /path:\s*'\/test-name'/);
  assert.match(source, /path:\s*'\/privacy'/);
  assert.match(source, /path:\s*'\/terms'/);
  assert.match(source, /path:\s*'\/disclaimer'/);
  // 不得包含 /api/ 路由
  assert.doesNotMatch(source, /path:\s*'\/api\//);
  // 不得包含个人结果页、临时报告页
  assert.doesNotMatch(source, /path:\s*'\/name\/result'/);
  assert.doesNotMatch(source, /path:\s*'\/test-name\/result'/);
  assert.doesNotMatch(source, /path:\s*'\/name\/detail'/);
});

test('SEO: robots disallows /api/ and points to sitemap', () => {
  const source = readProjectFile('src/app/robots.ts');

  // 必须 Allow /
  assert.match(source, /allow:\s*'/);
  // 必须 Disallow /api/
  assert.match(source, /'\/api\/'/);
  // 必须 Disallow 内部临时路径
  assert.match(source, /'\/name\/result'/);
  assert.match(source, /'\/test-name\/result'/);
  // 必须指向 sitemap（使用模板字符串构造 sitemap URL）
  assert.match(source, /sitemap:\s*`\$\{siteUrl\}\/sitemap\.xml`/);
  assert.match(source, /\/sitemap\.xml/);
  // 必须使用 getSiteUrl
  assert.match(source, /getSiteUrl/);
});

test('SEO: JSON-LD helpers output valid schema.org structure without fake ratings', () => {
  const source = readProjectFile('src/lib/seo/json-ld.ts');

  // 必须提供 WebSite / Organization / WebApplication / BreadcrumbList / FAQPage helper
  assert.match(source, /export function buildWebSiteJsonLd/);
  assert.match(source, /export function buildOrganizationJsonLd/);
  assert.match(source, /export function buildWebApplicationJsonLd/);
  assert.match(source, /export function buildBreadcrumbJsonLd/);
  assert.match(source, /export function buildFaqJsonLd/);
  // 必须使用 @context 和 @type
  assert.match(source, /'@context':\s*'https:\/\/schema\.org'/);
  // 不得包含虚假评分
  assert.doesNotMatch(source, /aggregateRating/);
  // 不得包含合规风险词
  assert.doesNotMatch(source, /算命/);
  assert.doesNotMatch(source, /改运/);
  assert.doesNotMatch(source, /旺财/);
  assert.doesNotMatch(source, /保证旺/);
});

test('SEO: compliance pages do not contain risk words and emphasize product positioning', () => {
  const privacySource = readProjectFile('src/app/privacy/page.tsx');
  const termsSource = readProjectFile('src/app/terms/page.tsx');
  const disclaimerSource = readProjectFile('src/app/disclaimer/page.tsx');

  for (const [name, source] of [
    ['privacy', privacySource],
    ['terms', termsSource],
    ['disclaimer', disclaimerSource],
  ] as const) {
    // 必须强调产品定位：传统文化参考 + AI 辅助
    assert.match(source, /传统文化/, `${name} should mention 传统文化`);
    // 必须声明不提供医疗/法律/投资/命运预测建议
    assert.match(source, /不提供/, `${name} should declare what it does not provide`);
    // 不得包含"算命"作为服务描述（合规页中可以用"不提供算命"声明，但不能作为服务提供）
    assert.doesNotMatch(source, /提供算命/, `${name} must not provide 算命`);
    // 不得有正向承诺改运/旺财/旺事业/旺婚姻（用负向回顾断言排除"不承诺改运"等否定声明）
    assert.doesNotMatch(source, /(?<!不)承诺改运/, `${name} must not promise 改运`);
    assert.doesNotMatch(source, /可以改运|能改运|会改运/, `${name} must not claim 改运 capability`);
    assert.doesNotMatch(source, /保证旺财|可以旺财|能旺财/, `${name} must not claim 旺财 capability`);
    assert.doesNotMatch(source, /保证旺事业|可以旺事业/, `${name} must not claim 旺事业`);
    assert.doesNotMatch(source, /保证旺婚姻|可以旺婚姻/, `${name} must not claim 旺婚姻`);
  }

  // 合规页必须包含"不承诺改运、旺财"等否定声明（这是合规要求，不是风险词）
  assert.match(privacySource, /不承诺改运/);
  assert.match(termsSource, /不承诺改运/);
  assert.match(disclaimerSource, /不承诺改运/);

  // 隐私政策必须说明出生信息仅用于生成报告
  assert.match(privacySource, /仅用于/);
  // 免责声明必须声明不构成专业建议
  assert.match(disclaimerSource, /不构成.*建议/);
});

test('Paywall: result page contains free vs full report entitlement copy', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  // 必须有免费版权益文案
  assert.match(source, /免费版/);
  assert.match(source, /3 个名字/);
  assert.match(source, /基础五行分析/);
  // 必须有完整报告权益文案
  assert.match(source, /完整报告/);
  assert.match(source, /更多候选名字/);
  assert.match(source, /完整评分解释/);
  assert.match(source, /出处与字义详解/);
  assert.match(source, /音韵与避用字校验/);
  assert.match(source, /可复制\/分享\/下载报告/);
  // 必须有价格占位
  assert.match(source, /¥29\.9 起/);
});

test('Paywall: unlock button does not call real payment API', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  // 解锁按钮必须 disabled
  assert.match(source, /data-paywall="unlock-button"/);
  assert.match(source, /data-action="coming-soon"/);
  assert.match(source, /disabled/);
  // 必须有「即将上线」文案
  assert.match(source, /即将上线/);
  // 必须声明不产生扣费
  assert.match(source, /不会产生任何扣费/);
  // 不得调用支付 API
  assert.doesNotMatch(source, /\/api\/payment/);
  assert.doesNotMatch(source, /\/api\/pay/);
  assert.doesNotMatch(source, /createOrder/);
  assert.doesNotMatch(source, /fetch.*payment/);
});

test('SEO: .env.example contains NEXT_PUBLIC_SITE_URL', () => {
  const source = readProjectFile('.env.example');

  assert.match(source, /NEXT_PUBLIC_SITE_URL=/);
  // 必须有注释说明用途
  assert.match(source, /sitemap.*robots.*canonical.*JSON-LD|canonical.*JSON-LD.*sitemap/i);
});

test('SEO: result page shows quality score explanation copy, not just numbers', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  // 必须有质量分解释型文案
  assert.match(source, /评分依据/);
  // 必须有兜底解释文案
  assert.match(source, /综合五行匹配.*出处可信度.*音韵字义评分/);
});

/* ================================================================
   Public Beta Readiness Pack 测试
   ================================================================ */

test('Beta: client-side code does not read LLM_API_KEY', () => {
  // 客户端可读的环境变量文件不应包含 LLM_API_KEY
  const publicEnvSource = readProjectFile('src/lib/env/public-env.ts');
  assert.doesNotMatch(publicEnvSource, /LLM_API_KEY/);

  // 服务端环境变量文件应包含 LLM_API_KEY 但标记为服务端专用
  const serverEnvSource = readProjectFile('src/lib/env/server-env.ts');
  assert.match(serverEnvSource, /LLM_API_KEY/);
  assert.match(serverEnvSource, /服务端/);

  // public-env 只读取 NEXT_PUBLIC_* 前缀变量
  assert.match(publicEnvSource, /NEXT_PUBLIC_/);
  assert.doesNotMatch(publicEnvSource, /process\.env\.LLM_/);
});

test('Beta: analytics payload does not contain sensitive fields', () => {
  const trackSource = readProjectFile('src/lib/analytics/track.ts');

  // 必须有敏感字段过滤列表
  assert.match(trackSource, /SENSITIVE_PAYLOAD_KEYS/);
  // 必须过滤以下敏感字段
  const sensitiveFields = ['birthDate', 'birthTime', 'fullName', 'surname', 'givenName', 'phone', 'wechat', 'idCard', 'ip', 'rawPrompt', 'rawAIOutput', 'llmApiKey', 'apiKey'];
  for (const field of sensitiveFields) {
    assert.match(trackSource, new RegExp(field), `track.ts must filter sensitive field: ${field}`);
  }
  // 必须有 sanitizePayload 函数
  assert.match(trackSource, /function sanitizePayload/);
  // 生产环境必须静默
  assert.match(trackSource, /isProduction/);
});

test('Beta: sitemap still excludes personal result pages', () => {
  const source = readProjectFile('src/app/sitemap.ts');

  // 不包含个人结果页
  assert.doesNotMatch(source, /path:\s*'\/name\/result'/);
  assert.doesNotMatch(source, /path:\s*'\/name\/detail'/);
  assert.doesNotMatch(source, /path:\s*'\/test-name\/result'/);
  // 不包含 API 路由
  assert.doesNotMatch(source, /path:\s*'\/api\//);
});

test('Beta: robots still disallows personal result pages and API', () => {
  const source = readProjectFile('src/app/robots.ts');

  assert.match(source, /'\/api\/'/);
  assert.match(source, /'\/name\/result'/);
  assert.match(source, /'\/test-name\/result'/);
});

test('Beta: unlock button still does not call real payment API', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  // 解锁按钮仍 disabled
  assert.match(source, /data-paywall="unlock-button"/);
  assert.match(source, /disabled/);
  // 不调用支付 API
  assert.doesNotMatch(source, /\/api\/payment/);
  assert.doesNotMatch(source, /\/api\/pay/);
  assert.doesNotMatch(source, /createOrder/);
});

test('Beta: public-beta-checklist exists with key check items', () => {
  const source = readProjectFile('docs/current/public-beta-checklist.md');

  // 必须包含关键检查项
  assert.match(source, /环境变量检查/);
  assert.match(source, /sitemap 检查/);
  assert.match(source, /robots 检查/);
  assert.match(source, /canonical 检查/);
  assert.match(source, /JSON-LD 检查/);
  assert.match(source, /合规页面检查/);
  assert.match(source, /结果页 noindex/);
  assert.match(source, /LLM API 检查/);
  assert.match(source, /埋点隐私检查/);
  assert.match(source, /移动端主流程检查/);
  assert.match(source, /上线后人工巡检/);
  // 必须有回滚预案
  assert.match(source, /回滚预案/);
});

test('Beta: generate-names returns friendly error when LLM credentials missing', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  // 必须有 LLM preflight 检查
  assert.match(source, /checkLlmPreflight/);
  // 凭证缺失时返回 503
  assert.match(source, /LLM_CREDENTIALS_MISSING/);
  assert.match(source, /503/);
  // 不暴露 secret
  assert.match(source, /missingKeys/);
  assert.doesNotMatch(source, /apiKey.*error response/);
});

test('Beta: test-name returns friendly error when LLM credentials missing', () => {
  const source = readProjectFile('src/app/api/test-name/route.ts');

  // 必须有 LLM preflight 检查
  assert.match(source, /checkLlmPreflight/);
  // 凭证缺失时返回 503
  assert.match(source, /LLM_CREDENTIALS_MISSING/);
  assert.match(source, /503/);
  // JSON 解析失败不返回 raw（不伪成功）
  assert.doesNotMatch(source, /success: true,\s*data:\s*\{ raw: response\.content \}/);
  // JSON 解析失败返回 502
  assert.match(source, /测名结果解析失败/);
  assert.match(source, /502/);
});

test('Beta: result page shows guidance when localStorage data missing', () => {
  const source = readProjectFile('src/app/name/result/page.tsx');

  // 必须有 dataMissing 状态
  assert.match(source, /dataMissing/);
  assert.match(source, /setDataMissing\(true\)/);
  // 必须展示友好提示而非静默跳转
  assert.match(source, /起名信息不完整/);
  assert.match(source, /重新填写/);
  // 不再直接 router.push('/name/input') 作为唯一处理
  // 检查 dataMissing 条件渲染存在
  assert.match(source, /if \(dataMissing\)/);
});

test('Beta: generate-names 502 response does not expose raw AI output', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  // 502 响应不应包含 raw 字段
  // 检查解析失败分支不返回 raw
  const lines = source.split('\n');
  let inParseFailBlock = false;
  let blockContent = '';
  for (const line of lines) {
    if (line.includes('解析失败') || line.includes('!parsed.ok')) {
      inParseFailBlock = true;
    }
    if (inParseFailBlock) {
      blockContent += line + '\n';
      if (line.includes('});') && blockContent.includes('502')) {
        break;
      }
    }
  }
  // 502 块中不应包含 raw: parsed.raw
  assert.doesNotMatch(blockContent, /raw:\s*parsed\.raw/, '502 response must not expose raw AI output');
});

test('Beta: analytics events cover key funnel stages', () => {
  const source = readProjectFile('src/lib/analytics/events.ts');

  // 必须覆盖关键漏斗阶段
  const requiredEvents = [
    'home_view',
    'start_naming_click',
    'birth_info_submit',
    'bazi_result_view',
    'preference_submit',
    'names_generate_success',
    'names_generate_failed',
    'result_view',
    'paywall_view',
    'unlock_click',
    'basic_candidate_view',
    'knowledge_backed_result_view',
    'validation_warning_view',
    'test_name_submit',
    'test_name_success',
    'test_name_failed',
  ];
  for (const event of requiredEvents) {
    assert.match(source, new RegExp(event), `events.ts must define: ${event}`);
  }
});

/* ================================================================
   Production Deploy & Smoke Test Pack 测试
   ================================================================ */

test('Smoke: production-smoke-test.md exists with core URL checks', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 文档必须存在且包含核心 URL 检查项
  const requiredUrls = ['/', '/name/input', '/test-name', '/privacy', '/terms', '/disclaimer', '/sitemap.xml', '/robots.txt'];
  for (const url of requiredUrls) {
    assert.match(source, new RegExp(url.replace(/\//g, '\\/')), `smoke test must cover URL: ${url}`);
  }
  // 必须包含 HTTP 200 检查
  assert.match(source, /HTTP 200/);
  // 必须包含不白屏检查
  assert.match(source, /不白屏/);
});

test('Smoke: document lists required environment variables', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须列出所有必填环境变量
  assert.match(source, /NEXT_PUBLIC_SITE_URL/);
  assert.match(source, /NEXT_PUBLIC_APP_ENV/);
  assert.match(source, /LLM_API_KEY/);
  assert.match(source, /LLM_BASE_URL/);
  assert.match(source, /LLM_MODEL/);
  // 必须标注必填
  assert.match(source, /必填/);
});

test('Smoke: document states .env.local must not be committed and no real keys', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须声明 .env.local 不得提交
  assert.match(source, /\.env\.local.*不得提交|不提交.*\.env\.local/);
  // 必须声明不写真实 key
  assert.match(source, /不写真实.*key|不写真实 key/);
  // 必须声明 NEXT_PUBLIC_SITE_URL 不得是 localhost
  assert.match(source, /localhost/);
  assert.match(source, /不得是.*localhost|不是.*localhost/);
});

test('Smoke: document states unlock button does not call real payment', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须声明解锁按钮不调用支付 API
  assert.match(source, /不调用支付/);
  assert.match(source, /不创建订单|不跳转支付/);
});

test('Smoke: document states LLM errors must not expose sensitive data', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须声明不暴露 raw prompt
  assert.match(source, /不暴露.*raw prompt|不暴露.*prompt 原文/);
  // 必须声明不暴露 raw AI output
  assert.match(source, /不暴露.*raw AI output|不暴露.*raw/);
  // 必须声明不暴露 API key
  assert.match(source, /不暴露.*API key|不暴露.*api key/i);
  // 必须声明不暴露 stack trace
  assert.match(source, /不暴露.*stack trace|不暴露.*stack/);
});

test('Smoke: document contains 3-day small traffic test plan', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须包含 3 天测试计划
  assert.match(source, /Day 1/);
  assert.match(source, /Day 2/);
  assert.match(source, /Day 3/);
  // Day 1 必须包含自测 10 次
  assert.match(source, /10 次/);
  // Day 2 必须包含熟人测试
  assert.match(source, /熟人/);
  // Day 3 必须包含决策
  assert.match(source, /决策|决定/);
});

test('Smoke: document contains rollback plan', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须包含回滚预案
  assert.match(source, /回滚预案/);
  assert.match(source, /回滚/);
  // 必须包含 LLM 失败场景
  assert.match(source, /LLM.*失败|LLM.*大面积/);
  // 必须包含白屏场景
  assert.match(source, /白屏/);
});

/* ================================================================
   Production Blocker Fix Pack 测试
   ================================================================ */

test('Blocker: env-check marks NEXT_PUBLIC_SITE_URL as missing in production', () => {
  const source = readProjectFile('src/lib/env/env-check.ts');

  // 生产环境缺失 NEXT_PUBLIC_SITE_URL 应标记为 missing（阻断），而非仅 warning
  assert.match(source, /publicEnv\.appEnv === 'production'/);
  assert.match(source, /missing\.push\('NEXT_PUBLIC_SITE_URL'\)/);
});

test('Blocker: site-config warns in production when NEXT_PUBLIC_SITE_URL missing', () => {
  const source = readProjectFile('src/lib/seo/site-config.ts');

  // 生产环境 fallback localhost 时应输出警告
  assert.match(source, /appEnv === 'production'/);
  assert.match(source, /console\.warn/);
  // 不硬编码生产域名
  assert.doesNotMatch(source, /ai-naming-six\.vercel\.app/);
});

test('Blocker: generate-names has maxDuration and Edge runtime for Vercel', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  // 必须导出 maxDuration
  assert.match(source, /export const maxDuration/);
  // 值应在合理范围（20-60 秒；Edge Runtime Hobby 上限 25s）
  assert.match(source, /maxDuration\s*=\s*(?:[2-5]\d|60)/);
  // 必须使用 Edge Runtime（Hobby 25s 超时 vs Serverless 10s）
  assert.match(source, /runtime\s*=\s*['"]edge['"]/);
});

test('Blocker: LLM client has AbortController timeout and retry', () => {
  const source = readProjectFile('src/lib/llm/client.ts');

  // 必须有 AbortController
  assert.match(source, /AbortController/);
  assert.match(source, /controller\.signal/);
  // 必须有超时配置
  assert.match(source, /timeoutMs|DEFAULT_TIMEOUT_MS/);
  // 必须有重试逻辑
  assert.match(source, /MAX_RETRIES/);
  // 不暴露 API key / stack trace
  assert.match(source, /不暴露.*API key|不暴露.*stack/i);
});

test('Blocker: generate-names does not return success=true with 0 names', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  // 必须有 0 名字兜底逻辑
  assert.match(source, /finalNames\.length === 0/);
  // 兜底应走基础候选 fallback
  assert.match(source, /sourceStatus.*fallback/);
  assert.match(source, /基础候选/);
  // 如果仍然为 0，应返回 502 而非 success=true
  assert.match(source, /success: false/);
  assert.match(source, /status: 502/);
});

test('Blocker: compliance page title does not duplicate 天衍', () => {
  const source = readProjectFile('src/components/compliance/ComplianceLayout.tsx');

  // buildCompliancePageMeta 不应在 title 中手动拼接 ' · 天衍'
  // 因为 layout 的 title.template 会自动追加
  const metaMatch = source.match(/buildCompliancePageMeta[\s\S]*?title:\s*([^,\n]+)/);
  if (metaMatch) {
    // title 应该只是变量名（如 title），不应包含 ' · 天衍' 拼接
    assert.doesNotMatch(metaMatch[1], /· 天衍/);
  }
});

test('Blocker: production-smoke-test.md contains Vercel Redeploy requirement', () => {
  const source = readProjectFile('docs/current/production-smoke-test.md');

  // 必须包含 Vercel 环境变量配置说明
  assert.match(source, /Vercel/);
  assert.match(source, /Redeploy/);
  // 必须强调修改环境变量后必须 Redeploy
  assert.match(source, /必须 Redeploy|必须.*重新部署/);
});

test('Blocker: generate-names 502 still does not expose sensitive data', () => {
  const source = readProjectFile('src/app/api/generate-names/route.ts');

  // 502 响应不应包含 raw 字段
  const error502Match = source.match(/status:\s*502[\s\S]*?\)/);
  if (error502Match) {
    assert.doesNotMatch(error502Match[0], /raw:/);
  }
  // catch 块不应暴露 error 详情
  const catchMatch = source.match(/catch[\s\S]*?NextResponse\.json\([\s\S]*?\)/);
  if (catchMatch) {
    assert.doesNotMatch(catchMatch[0], /error\.message|error\.stack/);
  }
});
