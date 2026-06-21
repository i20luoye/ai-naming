import { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo/site-config';

/**
 * 站点 robots
 *
 * 规则：
 * - Allow / 根路径
 * - Disallow /api/ 内部 API 路由
 * - Disallow 内部临时路径（个人结果页、临时报告页、Next.js 内部）
 * - 不阻止核心公开页面
 * - sitemap 指向 ${siteUrl}/sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/static/',
        // 个人结果页、临时报告页不应被索引
        '/name/result',
        '/name/detail',
        '/name/bazi',
        '/name/preference',
        '/test-name/result',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
