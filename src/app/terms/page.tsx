import type { Metadata } from 'next';

import ComplianceLayout, { ComplianceSection, buildCompliancePageMeta } from '@/components/compliance/ComplianceLayout';

export const metadata: Metadata = buildCompliancePageMeta('服务条款', '/terms');

export default function TermsPage() {
  return (
    <ComplianceLayout
      title="服务条款"
      subtitle="使用天衍服务即视为您已阅读并同意本条款。天衍是传统文化起名参考与 AI 辅助姓名创意工具。"
    >
      <ComplianceSection number="一" title="服务性质">
        <p>
          天衍是一款基于八字喜用神分析与诗词典籍的 AI 起名工具，提供起名参考与姓名测评功能。
          本服务定位为传统文化数字化参考工具，不提供医疗、法律、投资、命运预测建议。
        </p>
        <p>
          本服务不承诺改运、旺财、旺事业、旺婚姻。所有起名与测名结果仅供传统文化参考，
          不构成人生决策依据，亦不构成对个人命运的任何预测或保证。
        </p>
      </ComplianceSection>

      <ComplianceSection number="二" title="使用条件">
        <ul className="list-disc pl-6 space-y-1">
          <li>您应确保输入的信息真实有效，并对输入内容自行承担责任</li>
          <li>您不得利用本服务从事违法或侵犯他人权益的活动</li>
          <li>您不得通过自动化脚本对服务进行恶意刷量或攻击</li>
          <li>起名结果仅供参考，最终命名决定权归您或您的监护人所有</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection number="三" title="知识产权">
        <p>
          天衍生成的起名建议、五行分析、姓名测评报告等内容，由 AI 模型基于传统文化语料实时生成。
          生成内容不构成独创性作品，您可自由使用生成的名字用于个人命名用途。
        </p>
        <p>
          天衍站点界面、品牌标识、文案等版权归天衍团队所有，未经授权不得复制、转载或用于商业用途。
        </p>
      </ComplianceSection>

      <ComplianceSection number="四" title="免责声明">
        <p>
          天衍起名与测名结果由 AI 模型生成，可能存在偏差或不适用情形。
          我们不对生成内容的准确性、完整性、适用性作出明示或暗示的保证。
        </p>
        <p>
          您因使用本服务产生的任何直接或间接损失，天衍团队不承担赔偿责任。
          起名、改名涉及个人重大决策，建议结合家庭意见与专业命名顾问综合判断。
        </p>
      </ComplianceSection>

      <ComplianceSection number="五" title="服务变更与中止">
        <p>
          天衍团队保留根据业务发展调整、暂停或终止部分或全部服务的权利。
          重大变更会通过页面公告或站内通知提前告知用户。
        </p>
      </ComplianceSection>

      <ComplianceSection number="六" title="条款更新">
        <p>
          本条款可能会根据业务发展与法律法规要求进行更新。继续使用服务即视为您接受更新后的条款。
        </p>
      </ComplianceSection>

      <ComplianceSection number="七" title="联系我们">
        <p>如对本服务条款有任何疑问，请联系：hello@tianyan.ai</p>
      </ComplianceSection>
    </ComplianceLayout>
  );
}
