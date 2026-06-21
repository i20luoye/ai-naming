/**
 * JSON-LD 结构化数据 helper
 *
 * 设计原则：
 * - 字段真实、克制、准确
 * - 不写虚假评分、虚假用户量、虚假公司资质
 * - 不写合规风险词（命运预测、运势承诺等）
 * - 使用 schema.org 标准类型
 */

import { getSiteConfig, buildCanonicalUrl } from './site-config';

/** JSON-LD 对象类型（宽松约束，便于嵌套） */
export type JsonLd = Record<string, unknown>;

/** WebSite schema：描述站点本身 */
export function buildWebSiteJsonLd(): JsonLd {
  const config = getSiteConfig();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.siteUrl,
    description: config.defaultDescription,
    inLanguage: config.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/test-name?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Organization schema：描述运营主体（不写虚假资质） */
export function buildOrganizationJsonLd(): JsonLd {
  const config = getSiteConfig();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.siteName,
    url: config.siteUrl,
    email: config.email,
    description: '传统文化起名参考与 AI 辅助姓名创意工具的开发与运营团队。',
  };
}

/** WebApplication schema：描述产品本身 */
export function buildWebApplicationJsonLd(): JsonLd {
  const config = getSiteConfig();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.siteName,
    url: config.siteUrl,
    description: config.defaultDescription,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    inLanguage: config.locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      description: '提供免费基础起名参考，完整报告权益即将上线。',
    },
    // 不写虚假评分字段，避免误导用户
  };
}

/** BreadcrumbList schema：面包屑导航 */
export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

/** FAQPage schema：常见问题 */
export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqJsonLd(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * 将多个 JSON-LD 对象序列化为 script 标签内容数组
 * 用于在页面中通过 <script type="application/ld+json"> 注入
 */
export function serializeJsonLd(items: JsonLd[]): string[] {
  return items.map((item) => JSON.stringify(item));
}
