import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface QuestionData {
  year: number;
  questionNo: number;
  category: 'STRATEGY' | 'MANAGEMENT' | 'TECHNOLOGY';
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty?: number;
}

async function main() {
  console.log('🌱 データベースシードを開始します...\n');

  // 既存の問題データを削除
  console.log('🗑️  既存のデータをクリアしています...');
  await prisma.userAnswer.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany();
  await prisma.question.deleteMany();
  console.log('✅ 既存データをクリアしました\n');

  // 問題データを読み込み（複数年度対応）
  const dataDir = path.join(__dirname, '../data');
  const years = [2023, 2024, 2025, 2026]; // 令和5年～令和8年
  let totalImported = 0;

  for (const year of years) {
    const questionsPath = path.join(dataDir, `questions-${year}.json`);

    if (!fs.existsSync(questionsPath)) {
      console.log(`⏭️  ${year}年度のデータが見つかりません: questions-${year}.json`);
      continue;
    }

    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(questionsPath, 'utf-8')
    );

    console.log(`📚 ${year}年度: ${questionsData.length}問をインポート中...`);

    // 問題データを一括挿入
    for (const question of questionsData) {
      await prisma.question.create({
        data: {
          year: question.year,
          questionNo: question.questionNo,
          category: question.category,
          questionText: question.questionText,
          choiceA: question.choiceA,
          choiceB: question.choiceB,
          choiceC: question.choiceC,
          choiceD: question.choiceD,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty || 1,
        },
      });
    }

    totalImported += questionsData.length;
    console.log(`✅ ${year}年度: ${questionsData.length}問完了\n`);
  }

  console.log('✅ 問題データのインポートが完了しました\n');

  // テストユーザーを作成
  console.log('👤 テストユーザーを作成しています...');
  const testUser = await prisma.user.create({
    data: {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: null, // 認証は後で実装
    },
  });

  // ユーザー統計を初期化
  await prisma.userStats.create({
    data: {
      userId: testUser.id,
    },
  });

  console.log('✅ テストユーザーを作成しました\n');

  // 統計情報を表示
  const totalQuestions = await prisma.question.count();
  const yearStats = await prisma.question.groupBy({
    by: ['year'],
    _count: true,
  });

  console.log('📊 年度別問題数:');
  yearStats.forEach((stat) => {
    console.log(`   ${stat.year}年度: ${stat._count}問`);
  });
  console.log(`   合計: ${totalQuestions}問\n`);

  const categoryStats = await prisma.question.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('📊 カテゴリー別問題数（全年度）:');
  categoryStats.forEach((stat) => {
    const categoryName =
      stat.category === 'STRATEGY'
        ? 'ストラテジ系'
        : stat.category === 'MANAGEMENT'
        ? 'マネジメント系'
        : 'テクノロジ系';
    console.log(`   ${categoryName}: ${stat._count}問`);
  });

  console.log('\n✨ シード完了！');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
