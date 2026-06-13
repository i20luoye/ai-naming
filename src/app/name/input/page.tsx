import { StepIndicator } from '@/components/tianyan/StepIndicator';
import { SubHeader } from '@/components/tianyan/SubHeader';

const steps = [
  { label: '输入' },
  { label: '排盘' },
  { label: '起名' },
  { label: '结果' },
];

export default function NameInputPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900">
      <SubHeader title="基本信息" stepLabel="[1/4]" backHref="/" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <StepIndicator steps={steps} currentStep={0} />

        <form id="nameInputForm" className="mt-8 space-y-5">
          {/* 姓氏 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">
              姓氏 <span className="text-vermilion">*</span>
            </label>
            <input
              id="surname"
              type="text"
              placeholder="请输入姓氏"
              maxLength={2}
              required
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
            />
            <p className="text-ink-500 text-xs mt-1.5">1-2个中文汉字</p>
          </div>

          {/* 性别 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-3">
              性别 <span className="text-vermilion">*</span>
            </label>
            <div className="flex gap-3" id="genderGroup">
              <button
                type="button"
                data-gender="male"
                className="gender-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm hover:border-gold-400/30"
              >
                <i className="fa-solid fa-mars mr-1.5" />男
              </button>
              <button
                type="button"
                data-gender="female"
                className="gender-btn flex-1 py-2.5 rounded-lg border border-gold-400/12 text-ink-300 transition-all text-sm hover:border-gold-400/30"
              >
                <i className="fa-solid fa-venus mr-1.5" />女
              </button>
            </div>
            <input type="hidden" id="gender" name="gender" required />
          </div>

          {/* 出生日期 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">
              出生日期 <span className="text-vermilion">*</span>
            </label>
            <input
              id="birthDate"
              type="date"
              required
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all [color-scheme:dark]"
            />
          </div>

          {/* 出生时间 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">
              出生时间 <span className="text-vermilion">*</span>
            </label>
            <input
              id="birthTime"
              type="time"
              required
              className="w-full bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all [color-scheme:dark]"
            />
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                id="unknownTime"
                className="w-4 h-4 rounded border-gold-400/30 bg-ink-800/60 text-gold-400 focus:ring-gold-400/20 accent-[#c8a45c]"
              />
              <span className="text-ink-400 text-sm">不确定具体时辰</span>
            </label>
          </div>

          {/* 出生地 */}
          <div className="jinming-card rounded-xl p-5">
            <label className="block text-sm text-ink-300 mb-2">出生地</label>
            <div className="flex gap-3">
              <select
                id="birthProvince"
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              >
                <option value="">选择省份</option>
                <option>北京</option>
                <option>上海</option>
                <option>广东</option>
                <option>浙江</option>
                <option>江苏</option>
                <option>四川</option>
                <option>湖北</option>
                <option>山东</option>
              </select>
              <select
                id="birthCity"
                className="flex-1 bg-ink-800/60 border border-gold-400/12 rounded-lg px-4 py-3 text-ink-100 focus:outline-none focus:border-gold-400/40 transition-all [color-scheme:dark]"
              >
                <option value="">选择城市</option>
              </select>
            </div>
            <p className="text-ink-500 text-xs mt-1.5">
              <i className="fa-solid fa-circle-info mr-1" />
              选填，用于真太阳时校正
            </p>
          </div>

          {/* 已出生Toggle */}
          <div className="jinming-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-300">宝宝是否已出生</span>
              <label className="toggle-switch">
                <input type="checkbox" id="isBorn" defaultChecked className="sr-only peer" />
                <div className="toggle-track"></div>
              </label>
            </div>
            <div id="notBornTip" className="hidden mt-3 p-3 rounded-lg bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              宝宝尚未出生，分析结果仅供参考
            </div>
          </div>

          {/* 隐私提示 */}
          <div className="flex items-center gap-2 text-ink-500 text-xs justify-center py-2">
            <i className="fa-solid fa-shield-halved" />
            您的信息仅用于分析，72小时后自动删除
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-ink-900/90 backdrop-blur-sm pt-4 pb-6 mt-4">
          <a
            href="/name/bazi"
            id="nextBtn"
            className="gold-btn block w-full py-3.5 rounded-lg text-ink-900 font-semibold text-center text-base"
          >
            下一步：排盘分析 <i className="fa-solid fa-arrow-right ml-1 text-sm" />
          </a>
        </div>
      </main>

      {/* Client script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  // Gender selection
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

  // Unknown time toggle
  const unknownTime = document.getElementById('unknownTime');
  const birthTime = document.getElementById('birthTime');
  unknownTime.addEventListener('change', function() {
    birthTime.disabled = this.checked;
    if (this.checked) birthTime.classList.add('opacity-40');
    else birthTime.classList.remove('opacity-40');
  });

  // Is born toggle
  const isBorn = document.getElementById('isBorn');
  const notBornTip = document.getElementById('notBornTip');
  isBorn.addEventListener('change', function() {
    notBornTip.classList.toggle('hidden', this.checked);
  });

  // Province-city simple mapping
  const cityMap = {
    '北京': ['东城区','西城区','朝阳区','海淀区'],
    '上海': ['黄浦区','徐汇区','静安区','浦东新区'],
    '广东': ['广州','深圳','佛山','东莞'],
    '浙江': ['杭州','宁波','温州','绍兴'],
    '江苏': ['南京','苏州','无锡','常州'],
    '四川': ['成都','绵阳','德阳','宜宾'],
    '湖北': ['武汉','宜昌','襄阳','荆州'],
    '山东': ['济南','青岛','烟台','潍坊'],
  };
  const provinceEl = document.getElementById('birthProvince');
  const cityEl = document.getElementById('birthCity');
  provinceEl.addEventListener('change', function() {
    const cities = cityMap[this.value] || [];
    cityEl.innerHTML = '<option value="">选择城市</option>' + cities.map(c => '<option>'+c+'</option>').join('');
  });
})();
          `,
        }}
      />
    </div>
  );
}
