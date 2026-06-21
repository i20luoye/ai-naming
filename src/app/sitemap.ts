import { MetadataRoute } from 'next';

import { buildCanonicalUrl } from '@/lib/seo/site-config';

/**
 * 站点 sitemap
 *
 * 规则：
 * - 只包含可公开索引的核心页面
 * - 不包含 /api/ 路由
 * - 不包含个人结果页、临时报告页（如 /name/result、/test-name/result）
 * - 使用绝对 URL
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicPages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    // 首页：最高优先级，每日更新
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    // 起名输入页：核心入口
    { path: '/name/input', changeFrequency: 'weekly', priority: 0.9 },
    // 测名页：核心入口
    { path: '/test-name', changeFrequency: 'weekly', priority: 0.9 },
    // 合规页面：低频更新，但需要被搜索引擎收录
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return publicPages.map((page) => ({
    url: buildCanonicalUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
