import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportQuestions() {
  console.log('既存の問題データをエクスポート中...\n');

  try {
    const questions = await prisma.question.findMany({
      orderBy: { questionNo: 'asc' }
    });

    console.log(`✓ ${questions.length}問のデータを取得しました`);

    // year フィールドを追加（2026年度として）
    const questionsWithYear = questions.map(q => ({
      year: 2026,
      questionNo: q.questionNo,
      category: q.category,
      questionText: q.questionText,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty
    }));

    // JSONファイルに保存
    fs.writeFileSync(
      'data/questions-2026.json',
      JSON.stringify(questionsWithYear, null, 2),
      'utf-8'
    );

    console.log('✓ data/questions-2026.json に保存しました\n');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportQuestions();
