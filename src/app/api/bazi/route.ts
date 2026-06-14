import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/lib/bazi';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // IP 限流
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, { maxRequests: 20, windowMs: 60 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { birthDate, birthTime, longitude } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: '缺少必填参数: birthDate, birthTime' },
        { status: 400 }
      );
    }

    const result = calculateBazi(birthDate, birthTime, longitude);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('八字排盘计算错误:', error);
    return NextResponse.json(
      { error: '排盘计算失败，请检查输入信息' },
      { status: 500 }
    );
  }
}
