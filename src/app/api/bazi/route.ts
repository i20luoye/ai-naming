import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/lib/bazi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: '缺少必填参数: birthDate, birthTime' },
        { status: 400 }
      );
    }

    const result = calculateBazi(birthDate, birthTime);

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
