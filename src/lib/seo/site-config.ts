/**
 * 站点级 SEO 配置
 *
 * 设计原则：
 * - siteUrl 从 NEXT_PUBLIC_SITE_URL 读取，不硬编码 localhost 为生产地址
 * - 提供 canonical URL 构造函数，确保 sitemap / robots / meta 使用绝对 URL
 * - 字段克制、真实，不写虚假公司资质、不写虚假用户量
 */

/** 站点基础配置 */
export interface SiteConfig {
  /** 站点名称 */
  siteName: string;
  /** 站点根 URL（不含末尾斜杠） */
  siteUrl: string;
  /** 默认页面标题 */
  defaultTitle: string;
  /** 默认页面描述 */
  defaultDescription: string;
  /** 默认关键词 */
  defaultKeywords: string[];
  /** 社交分享图占位（绝对 URL 或相对路径） */
  socialImage: string;
  /** 联系邮箱（用于 Organization JSON-LD） */
  email: string;
  /** 默认语言 */
  locale: string;
}

/** 从环境变量读取站点 URL，回退到 localhost 仅用于本地开发 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  // 本地开发回退，不作为生产地址
  return 'http://localhost:5000';
}

/** 站点配置（运行时从环境变量读取 siteUrl） */
export function getSiteConfig(): SiteConfig {
  const siteUrl = getSiteUrl();
  return {
    siteName: '天衍',
    siteUrl,
    defaultTitle: '天衍 · AI 八字智能起名',
    defaultDescription:
      '基于八字喜用神分析与诗词典籍的 AI 起名工具，提供五行补益参考、三才五格推演与姓名测评。传统文化数字化工具，仅供参考。',
    defaultKeywords: [
      'AI起名',
      '八字起名',
      '宝宝起名',
      '喜用神',
      '五行',
      '诗词起名',
      '姓名测评',
      '天衍',
    ],
    socialImage: `${siteUrl}/og-image.png`,
    email: 'hello@tianyan.ai',
    locale: 'zh-CN',
  };
}

/**
 * 构造绝对 canonical URL
 * @param path 相对路径，如 '/name/input' 或 '/'，默认 '/'
 * @returns 绝对 URL，如 'https://tianyan.app/name/input'
 */
export function buildCanonicalUrl(path: string = '/'): string {
  const { siteUrl } = getSiteConfig();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

/**
 * 构造页面级 metadata 的辅助函数
 * @param path 当前页面路径
 * @param overrides 标题/描述等覆盖项
 */
export function buildPageMeta(
  path: string,
  overrides: { title?: string; description?: string; keywords?: string[] } = {},
) {
  const config = getSiteConfig();
  const canonical = buildCanonicalUrl(path);
  return {
    title: overrides.title || config.defaultTitle,
    description: overrides.description || config.defaultDescription,
    keywords: overrides.keywords || config.defaultKeywords,
    alternates: { canonical },
    openGraph: {
      title: overrides.title || config.defaultTitle,
      description: overrides.description || config.defaultDescription,
      url: canonical,
      siteName: config.siteName,
      locale: config.locale,
      type: 'website' as const,
      images: [{ url: config.socialImage }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: overrides.title || config.defaultTitle,
      description: overrides.description || config.defaultDescription,
      images: [config.socialImage],
    },
  };
}
