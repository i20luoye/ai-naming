/**
 * API 限流工具
 * 基于内存的简单 IP 限流（MVP 阶段足够）
 * 生产环境建议替换为 Redis 方案
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 定期清理过期条目（每5分钟）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** 时间窗口（秒），默认60 */
  windowMs?: number;
  /** 窗口内最大请求数，默认10 */
  maxRequests?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * 检查 IP 是否超过限流
 * @param ip 客户端 IP
 * @param options 限流配置
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const windowMs = (options.windowMs ?? 60) * 1000;
  const maxRequests = options.maxRequests ?? 10;
  const now = Date.now();

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // 新窗口
    const resetTime = now + windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * 从请求中提取客户端 IP
 */
export function getClientIp(request: Request): string {
  // 优先从代理头获取
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}
