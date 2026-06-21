/**
 * 客户端可安全读取的环境变量
 *
 * 安全规则：
 * - 客户端只允许读取 NEXT_PUBLIC_* 前缀的环境变量
 * - 服务端 secret 不得暴露到客户端
 * - 缺少 NEXT_PUBLIC_SITE_URL 时有安全 fallback，但不硬编码 localhost 为生产地址
 */

/** 客户端可读的公开环境变量 */
export interface PublicEnv {
  /** 站点 URL，用于 sitemap/canonical/JSON-LD */
  siteUrl: string;
  /** 应用环境 */
  appEnv: string;
}

/**
 * 读取客户端公开环境变量
 * 此函数可安全在客户端组件中调用
 */
export function getPublicEnv(): PublicEnv {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return {
    // 缺少 NEXT_PUBLIC_SITE_URL 时回退到 localhost，仅用于本地开发
    // 生产环境必须设置 NEXT_PUBLIC_SITE_URL，env-check 会在构建时警告
    siteUrl: siteUrl ? siteUrl.replace(/\/+$/, '') : 'http://localhost:5000',
    appEnv: process.env.NEXT_PUBLIC_APP_ENV?.trim() || process.env.NODE_ENV || 'development',
  };
}

/**
 * 判断当前是否为生产环境
 */
export function isProduction(): boolean {
  return getPublicEnv().appEnv === 'production';
}
