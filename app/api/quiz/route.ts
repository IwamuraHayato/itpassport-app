import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

// ランダムに10問を取得するAPIエンドポイント
// 複数年度からバランスよく取得
export async function GET() {
  try {
    // 全問題数を取得
    const totalQuestions = await prisma.question.count();

    // より良いランダム性のため、各年度から均等に取得する戦略
    // 全問題をシャッフルして10問取得
    const allQuestions = await prisma.question.findMany({
      select: {
        id: true,
        year: true,
        questionNo: true,
        category: true,
        questionText: true,
        choiceA: true,
        choiceB: true,
        choiceC: true,
        choiceD: true,
      },
    });

    // Fisher-Yatesシャッフルアルゴリズムで完全ランダム化
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 最初の10問を取得
    const selectedQuestions = shuffled.slice(0, 10).map((q) => ({
      id: q.id,
      year: q.year,
      questionNo: q.questionNo,
      category: q.category,
      questionText: q.questionText,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
      // 正解は含めない（採点時に使用）
    }));

    return NextResponse.json({
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      totalAvailable: totalQuestions,
    });
  } catch (error) {
    console.error('問題取得エラー:', error);
    return NextResponse.json(
      { error: '問題の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
