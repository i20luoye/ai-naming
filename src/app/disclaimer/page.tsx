import type { Metadata } from 'next';

import ComplianceLayout, { ComplianceSection, buildCompliancePageMeta } from '@/components/compliance/ComplianceLayout';

export const metadata: Metadata = buildCompliancePageMeta('免责声明', '/disclaimer');

export default function DisclaimerPage() {
  return (
    <ComplianceLayout
      title="免责声明"
      subtitle="天衍是传统文化起名参考与 AI 辅助姓名创意工具。请在使用前仔细阅读以下免责声明。"
    >
      <ComplianceSection number="一" title="产品定位">
        <p>
          天衍是一款基于八字喜用神分析与诗词典籍的 AI 起名工具，定位为传统文化数字化参考工具。
          本工具不提供医疗、法律、投资、命运预测建议。
        </p>
        <p>
          本工具不承诺改运、旺财、旺事业、旺婚姻。所有起名与测名结果仅供传统文化参考，
          不构成人生决策依据，亦不构成对个人命运的任何预测或保证。
        </p>
      </ComplianceSection>

      <ComplianceSection number="二" title="结果仅供参考">
        <p>
          天衍生成的起名建议、五行分析、三才五格推演、姓名测评报告等内容，
          由 AI 模型基于传统文化语料实时生成，可能存在偏差、不完整或不适用情形。
        </p>
        <p>
          生成结果不构成对个人命运、性格、健康、事业、婚姻的任何预测、判断或保证。
          起名、改名涉及个人重大决策，建议结合家庭意见与专业命名顾问综合判断。
        </p>
      </ComplianceSection>

      <ComplianceSection number="三" title="不构成专业建议">
        <ul className="list-disc pl-6 space-y-1">
          <li>本服务不提供医疗建议，不替代专业医师的诊断与治疗</li>
          <li>本服务不提供法律建议，不替代专业律师的法律意见</li>
          <li>本服务不提供投资建议，不构成对任何投资行为的推荐</li>
          <li>本服务不提供命运预测，不对个人未来事件作出任何保证</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection number="四" title="传统文化口径">
        <p>
          天衍所涉及的八字、五行、三才五格、喜用神等内容，均属于中国传统文化参考体系。
          这些体系具有历史文化价值，但其与现代科学之间的关系尚无统一共识。
        </p>
        <p>
          我们尊重传统文化，同时明确告知用户：上述内容仅供文化参考与个人兴趣研究，
          不应作为人生重大决策的唯一依据。
        </p>
      </ComplianceSection>

      <ComplianceSection number="五" title="用户责任">
        <p>
          用户基于天衍生成的结果作出的任何决定，包括但不限于命名、改名、测名等行为，
          其后果由用户自行承担。天衍团队不对用户决策产生的任何直接或间接损失负责。
        </p>
      </ComplianceSection>

      <ComplianceSection number="六" title="第三方服务">
        <p>
          天衍在生成起名结果时，会调用 AI 模型服务。模型服务由第三方提供，
          其数据处理方式受第三方服务条款约束。我们已尽合理努力选择可靠的模型服务供应商，
          但不对第三方服务的可用性、稳定性作出保证。
        </p>
      </ComplianceSection>

      <ComplianceSection number="七" title="联系我们">
        <p>如对本免责声明有任何疑问，请联系：hello@tianyan.ai</p>
      </ComplianceSection>
    </ComplianceLayout>
  );
}
