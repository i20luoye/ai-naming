// Diagnostic Smoke Test - detect Vercel FUNCTION_INVOCATION_TIMEOUT vs our PARSE_FAILURE
const BASE = 'https://ai-naming-six.vercel.app';

interface TestResult {
  desc: string;
  status: number;
  ok: boolean;
  nameCount: number;
  errorType: string;
  detail: string;
  isVercelTimeout: boolean;
}

async function testGenerateNames(
  surname: string,
  gender: string,
  birthDate: string,
  birthTime: string,
  xi: string[],
  ji: string[],
  dm: string,
  dw: string,
  desc: string,
): Promise<TestResult> {
  const body = JSON.stringify({
    surname,
    gender,
    birthDate,
    birthTime,
    xiYong: { xi, ji },
    dayMaster: dm,
    dayMasterWuxing: dw,
  });
  try {
    const res = await fetch(`${BASE}/api/generate-names`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await res.text();
    // 检测 Vercel 平台级超时（非 JSON 响应体）
    const isVercelTimeout =
      text.includes('FUNCTION_INVOCATION_TIMEOUT') ||
      text.includes('An error occurred with your deployment');

    let j: any;
    try {
      j = JSON.parse(text);
    } catch {
      j = { parseError: text.substring(0, 300) };
    }
    const nameCount = j.data?.names?.length || 0;
    const result: TestResult = {
      desc,
      status: res.status,
      ok: res.status === 200 && nameCount > 0,
      nameCount,
      errorType: j.errorType || 'N/A',
      detail: (j.detail || j.error || j.parseError || 'N/A').substring(0, 120),
      isVercelTimeout,
    };
    if (result.ok) {
      console.log(
        `  ✓ ${desc.padEnd(12)} 200 names=${nameCount} kb=${j.knowledgeBacked}`,
      );
    } else if (isVercelTimeout) {
      console.log(
        `  ✗ ${desc.padEnd(12)} ${res.status} VERCEL_TIMEOUT (function killed at 10s)`,
      );
    } else {
      console.log(
        `  ✗ ${desc.padEnd(12)} ${res.status} errorType=${result.errorType} detail=${result.detail}`,
      );
    }
    return result;
  } catch (e) {
    console.log(`  ✗ ${desc.padEnd(12)} FETCH_ERROR ${(e as Error).message}`);
    return {
      desc,
      status: 0,
      ok: false,
      nameCount: 0,
      errorType: 'FETCH_ERROR',
      detail: (e as Error).message,
      isVercelTimeout: false,
    };
  }
}

async function main() {
  console.log('=== Naming Flows (5 cases) with diagnostics ===\n');
  const results: TestResult[] = [];

  const cases: Array<Parameters<typeof testGenerateNames>> = [
    ['林', 'male', '2024-03-15', '14:00', ['木', '水'], ['土', '金'], '壬', '水', '林男木水'],
    ['王', 'female', '2023-11-20', '08:00', ['火', '木'], ['水', '金'], '丁', '火', '王女火木'],
    ['张', 'male', '2024-06-01', '22:00', ['土', '火'], ['木', '水'], '戊', '土', '张男土火'],
    ['李', 'female', '2024-01-10', '06:00', ['金', '土'], ['火', '木'], '辛', '金', '李女金土'],
    ['陈', 'male', '2023-09-28', '16:00', ['水', '金'], ['火', '土'], '癸', '水', '陈男水金'],
  ];

  for (const c of cases) {
    const r = await testGenerateNames(...c);
    results.push(r);
    await new Promise((r) => setTimeout(r, 3000));
  }

  const success = results.filter((r) => r.ok).length;
  const vercelTimeouts = results.filter((r) => r.isVercelTimeout).length;
  const parseFailures = results.filter(
    (r) => !r.ok && !r.isVercelTimeout && r.errorType !== 'FETCH_ERROR',
  ).length;

  console.log('\n=== Summary ===');
  console.log(`Success:          ${success}/${results.length} (${Math.round((success / results.length) * 100)}%)`);
  console.log(`Vercel Timeouts:  ${vercelTimeouts}`);
  console.log(`Parse Failures:   ${parseFailures}`);
  console.log(`Target:           ≥80% success`);

  if (success / results.length >= 0.8) {
    console.log('\n✓ PASSED — ready for Day 2 熟人测试');
  } else {
    console.log('\n✗ BELOW TARGET — consider Vercel Pro upgrade ($20/mo) for 60s timeout');
  }
}

main().catch(console.error);
