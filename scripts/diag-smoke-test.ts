// Diagnostic Smoke Test - focus on 502 errorType/detail
const BASE = 'https://ai-naming-six.vercel.app';

async function testGenerateNames(surname: string, gender: string, birthDate: string, birthTime: string, xi: string[], ji: string[], dm: string, dw: string, desc: string): Promise<void> {
  const body = JSON.stringify({ surname, gender, birthDate, birthTime, xiYong: { xi, ji }, dayMaster: dm, dayMasterWuxing: dw });
  try {
    const res = await fetch(`${BASE}/api/generate-names`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const text = await res.text();
    let j: any;
    try { j = JSON.parse(text); } catch { j = { parseError: text.substring(0, 200) }; }
    const nameCount = j.data?.names?.length || 0;
    if (res.status === 200) {
      console.log(`Case ${desc.padEnd(12)}: 200 names=${nameCount} kb=${j.knowledgeBacked}`);
    } else {
      console.log(`Case ${desc.padEnd(12)}: ${res.status} errorType=${j.errorType || 'N/A'} detail=${j.detail || j.parseError || j.error || 'N/A'}`);
    }
  } catch (e) {
    console.log(`Case ${desc.padEnd(12)}: FETCH_ERROR ${(e as Error).message}`);
  }
}

async function main() {
  console.log('=== Naming Flows (5 cases) with diagnostics ===');
  await testGenerateNames('林', 'male', '2024-03-15', '14:00', ['木', '水'], ['土', '金'], '壬', '水', '林男木水');
  await new Promise(r => setTimeout(r, 3000));
  await testGenerateNames('王', 'female', '2023-11-20', '08:00', ['火', '木'], ['水', '金'], '丁', '火', '王女火木');
  await new Promise(r => setTimeout(r, 3000));
  await testGenerateNames('张', 'male', '2024-06-01', '22:00', ['土', '火'], ['木', '水'], '戊', '土', '张男土火');
  await new Promise(r => setTimeout(r, 3000));
  await testGenerateNames('李', 'female', '2024-01-10', '06:00', ['金', '土'], ['火', '木'], '辛', '金', '李女金土');
  await new Promise(r => setTimeout(r, 3000));
  await testGenerateNames('陈', 'male', '2023-09-28', '16:00', ['水', '金'], ['火', '土'], '癸', '水', '陈男水金');
  console.log('\n=== Done ===');
}

main().catch(console.error);
