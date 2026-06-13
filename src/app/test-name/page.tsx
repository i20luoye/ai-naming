import Link from 'next/link';
import { JinmingCard } from '@/components/tianyan/GoldLine';
import { SiteHeader } from '@/components/tianyan/SiteHeader';

export default function TestNamePage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-ink-50 mb-2">测名评分</h1>
          <p className="text-ink-400 text-sm">已有名字？看看五行匹配度和文化内涵</p>
        </div>

        <form id="testNameForm" className="space-y-5">
          {/* 名字输入 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">
              名字 <span className="text-vermilion">*</span>
            </label>
            <div className="flex gap-3">
              <input
                id="surname"
                type="text"
                placeholder="姓氏"
                maxLength={2}
                required
                className="w-1/3 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
              />
              <input
                id="givenName"
                type="text"
                placeholder="名字（不含姓氏）"
                maxLength={2}
                required
                className="w-2/3 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-all"
              />
            </div>
          </div>

          {/* 出生信息 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">出生信息</label>

            {/* 性别 */}
            <div className="flex gap-3 mb-4" id="genderGroup">
              <button
                type="button"
                data-gender="male"
                className="gender-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm"
              >
                <i className="fa-solid fa-mars mr-1.5" />男
              </button>
              <button
                type="button"
                data-gender="female"
                className="gender-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm"
              >
                <i className="fa-solid fa-venus mr-1.5" />女
              </button>
            </div>
            <input type="hidden" id="gender" name="gender" required />

            {/* 出生日期 */}
            <div className="mb-4">
              <label className="text-ink-400 text-xs mb-1 block">出生日期</label>
              <input
                id="birthDate"
                type="date"
                className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              />
            </div>

            {/* 出生时间 */}
            <div className="mb-4">
              <label className="text-ink-400 text-xs mb-1 block">出生时间</label>
              <input
                id="birthTime"
                type="time"
                className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="unknownTime"
                  className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
                />
                <span className="text-ink-400 text-xs">不确定时辰</span>
              </label>
            </div>

            {/* 出生地 */}
            <div>
              <label className="text-ink-400 text-xs mb-1 block">出生地</label>
              <select
                id="birthProvince"
                className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              >
                <option value="">选择省份（选填）</option>
                <option>北京</option><option>上海</option><option>广东</option>
                <option>浙江</option><option>江苏</option><option>四川</option>
              </select>
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-ink-900/90 backdrop-blur-sm pt-4 pb-6 mt-4">
          <Link
            href="/test-name/result"
            className="gold-btn block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base"
          >
            开始测名 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </Link>
        </div>

        <p className="text-ink-500 text-xs text-center mt-2">
          仅供传统文化参考
        </p>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  const genderBtns = document.querySelectorAll('.gender-btn');
  const genderInput = document.getElementById('gender');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      genderBtns.forEach(b => {
        b.classList.remove('bg-gold-400/20', 'border-gold-400/50', 'text-gold-400');
        b.classList.add('border-gold-400/12', 'text-ink-300');
      });
      this.classList.remove('border-gold-400/12', 'text-ink-300');
      this.classList.add('bg-gold-400/20', 'border-gold-400/50', 'text-gold-400');
      genderInput.value = this.dataset.gender;
    });
  });
  const unknownTime = document.getElementById('unknownTime');
  const birthTime = document.getElementById('birthTime');
  if (unknownTime && birthTime) {
    unknownTime.addEventListener('change', function() {
      birthTime.disabled = this.checked;
      birthTime.classList.toggle('opacity-40', this.checked);
    });
  }
})();
          `,
        }}
      />
    </div>
  );
}
