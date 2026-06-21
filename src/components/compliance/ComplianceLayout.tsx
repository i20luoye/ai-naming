import type { ReactNode } from 'react';
import Link from 'next/link';

import { buildPageMeta } from '@/lib/seo/site-config';

/** 合规页面通用元数据构造器 */
export function buildCompliancePageMeta(title: string, path: string) {
  return buildPageMeta(path, {
    title: `${title} · 天衍`,
    description: `天衍${title}：明确产品定位为传统文化起名参考与 AI 辅助姓名创意工具，不提供医疗、法律、投资、命运预测建议。`,
    keywords: [title, '天衍', 'AI起名', '传统文化参考'],
  });
}

/** 合规页面通用布局 */
export default function ComplianceLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
      <div className="mb-10">
        <Link
          href="/"
          className="text-[12px] tracking-wider text-gold-400 hover:text-gold-300 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>

      <header className="mb-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wider mb-3 text-gold-200">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
        <div className="gold-line mt-6" />
      </header>

      <article className="space-y-8 text-[14px] leading-[1.9] text-foreground">
        {children}
      </article>

      <footer className="mt-16 pt-8 border-t border-gold-400/10">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          本页面由天衍团队维护。如对本{title}有任何疑问，请联系 hello@tianyan.ai。
        </p>
        <p className="text-[11px] text-muted-foreground mt-2">
          以上内容仅供传统文化参考，不构成人生决策依据。
        </p>
      </footer>
    </main>
  );
}

/** 合规页面通用段落组件 */
export function ComplianceSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold tracking-wider mb-3 text-gold-200">
        <span className="text-gold-400 mr-2">{number}</span>
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
