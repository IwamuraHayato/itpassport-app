import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function checkQuestion1() {
  console.log('問題1の詳細確認\n');

  try {
    const question = await prisma.question.findUnique({
      where: { questionNo: 1 }
    });

    if (!question) {
      console.log('問題1が見つかりませんでした');
      return;
    }

    console.log('='.repeat(80));
    console.log(`【問${question.questionNo}】 カテゴリ: ${question.category}`);
    console.log('='.repeat(80));
    console.log('\n問題文:');
    console.log(question.questionText);
    console.log('\n選択肢:');
    console.log(`ア: ${question.choiceA}`);
    console.log(`\nイ: ${question.choiceB}`);
    console.log(`\nウ: ${question.choiceC}`);
    console.log(`\nエ: ${question.choiceD}`);
    console.log(`\n正解: ${question.correctAnswer}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestion1();
