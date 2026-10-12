import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

interface Answer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
}

interface CheckAnswersRequest {
  answers: Answer[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckAnswersRequest = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '無効なリクエスト形式です' },
        { status: 400 }
      );
    }

    // 各問題の正解を取得して採点
    const results = await Promise.all(
      answers.map(async (answer) => {
        const question = await prisma.question.findUnique({
          where: { id: answer.questionId },
          select: {
            id: true,
            questionNo: true,
            questionText: true,
            choiceA: true,
            choiceB: true,
            choiceC: true,
            choiceD: true,
            correctAnswer: true,
            category: true,
          },
        });

        if (!question) {
          return {
            questionId: answer.questionId,
            isCorrect: false,
            error: '問題が見つかりません',
          };
        }

        const isCorrect = question.correctAnswer === answer.selectedAnswer;

        return {
          questionId: question.id,
          questionNo: question.questionNo,
          questionText: question.questionText,
          category: question.category,
          choiceA: question.choiceA,
          choiceB: question.choiceB,
          choiceC: question.choiceC,
          choiceD: question.choiceD,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
        };
      })
    );

    // 正解数を計算
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalQuestions = results.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return NextResponse.json({
      results,
      summary: {
        total: totalQuestions,
        correct: correctCount,
        incorrect: totalQuestions - correctCount,
        score,
      },
    });
  } catch (error) {
    console.error('採点エラー:', error);
    return NextResponse.json(
      { error: '採点に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
