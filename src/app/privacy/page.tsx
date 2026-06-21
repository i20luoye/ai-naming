import type { Metadata } from 'next';

import ComplianceLayout, { ComplianceSection, buildCompliancePageMeta } from '@/components/compliance/ComplianceLayout';

export const metadata: Metadata = buildCompliancePageMeta('隐私政策', '/privacy');

export default function PrivacyPage() {
  return (
    <ComplianceLayout
      title="隐私政策"
      subtitle="天衍是传统文化起名参考与 AI 辅助姓名创意工具。本政策说明我们在您使用服务时如何处理个人信息。"
    >
      <ComplianceSection number="一" title="产品定位">
        <p>
          天衍是一款基于八字喜用神分析与诗词典籍的 AI 起名工具，定位为传统文化数字化参考工具。
          本工具不提供医疗、法律、投资、命运预测建议，不承诺改运、旺财、旺事业、旺婚姻。
        </p>
        <p>所有起名结果仅供传统文化参考，不构成人生决策依据。</p>
      </ComplianceSection>

      <ComplianceSection number="二" title="我们收集的信息">
        <p>当您使用起名或测名功能时，我们会处理以下信息以生成报告：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>姓氏、性别、出生日期与出生时辰（用于八字排盘与五行推演）</li>
          <li>起名偏好（如风格、避用字、字数等可选设置）</li>
          <li>您主动输入的待测姓名（用于测名功能）</li>
        </ul>
        <p>
          上述信息仅用于本次生成报告，不会以明文形式用于统计分析、用户画像或第三方共享。
        </p>
      </ComplianceSection>

      <ComplianceSection number="三" title="信息处理方式">
        <p>
          您输入的出生信息仅在当前会话中用于生成起名或测名报告，报告生成后不会持久化存储在服务端数据库中。
          当前 MVP 阶段我们不接入持久化数据库，不建立用户账号体系。
        </p>
        <p>
          起名请求会发送至 AI 模型服务以生成候选名字，模型服务仅返回生成结果，不长期保留您的输入。
        </p>
      </ComplianceSection>

      <ComplianceSection number="四" title="我们不会做的事">
        <ul className="list-disc pl-6 space-y-1">
          <li>不会将您的出生信息用于商业广告推送</li>
          <li>不会将您的姓名与生辰信息出售给第三方</li>
          <li>不会在未告知的情况下将个人信息用于模型训练</li>
          <li>不会收集与起名功能无关的个人敏感信息</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection number="五" title="本地存储">
        <p>
          为方便您在浏览器中查看起名结果与历史记录，部分起名输入与结果会存储在您浏览器的本地存储（localStorage）中。
          这些数据仅保存在您的设备上，不会自动上传至服务器。您可以随时通过清除浏览器数据删除这些信息。
        </p>
      </ComplianceSection>

      <ComplianceSection number="六" title="未成年人保护">
        <p>
          天衍主要面向为宝宝起名的父母或监护人。若您是未成年人，请在监护人陪同下使用本服务，
          并确保监护人知悉并同意您输入的个人信息。
        </p>
      </ComplianceSection>

      <ComplianceSection number="七" title="政策更新">
        <p>
          本政策可能会根据产品迭代进行更新。重大变更会通过页面公告或站内通知告知用户。
          继续使用服务即视为您知悉并接受更新后的政策。
        </p>
      </ComplianceSection>

      <ComplianceSection number="八" title="联系我们">
        <p>如对本隐私政策有任何疑问，请联系：hello@tianyan.ai</p>
      </ComplianceSection>
    </ComplianceLayout>
  );
}
