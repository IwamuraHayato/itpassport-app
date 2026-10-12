import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 データベース内容を確認中...\n');

  try {
    // 問題数の確認
    const totalQuestions = await prisma.question.count();
    console.log(`📊 総問題数: ${totalQuestions}問`);

    // カテゴリー別の問題数
    const strategyCount = await prisma.question.count({ where: { category: 'STRATEGY' } });
    const managementCount = await prisma.question.count({ where: { category: 'MANAGEMENT' } });
    const technologyCount = await prisma.question.count({ where: { category: 'TECHNOLOGY' } });

    console.log(`\n📂 カテゴリー別問題数:`);
    console.log(`   ストラテジ系 (STRATEGY): ${strategyCount}問`);
    console.log(`   マネジメント系 (MANAGEMENT): ${managementCount}問`);
    console.log(`   テクノロジ系 (TECHNOLOGY): ${technologyCount}問`);

    // 問題番号の範囲確認
    const minQuestion = await prisma.question.findFirst({ orderBy: { questionNo: 'asc' } });
    const maxQuestion = await prisma.question.findFirst({ orderBy: { questionNo: 'desc' } });
    console.log(`\n📝 問題番号範囲: ${minQuestion?.questionNo} ～ ${maxQuestion?.questionNo}`);

    // サンプルデータの確認（問1, 問35, 問55）
    console.log(`\n📄 サンプルデータ確認:`);

    const question1 = await prisma.question.findUnique({ where: { questionNo: 1 } });
    if (question1) {
      console.log(`\n【問1】(${question1.category})`);
      console.log(`問題文: ${question1.questionText.substring(0, 50)}...`);
      console.log(`選択肢A: ${question1.choiceA.substring(0, 30)}...`);
      console.log(`正解: ${question1.correctAnswer}`);
    }

    const question35 = await prisma.question.findUnique({ where: { questionNo: 35 } });
    if (question35) {
      console.log(`\n【問35】(${question35.category})`);
      console.log(`問題文: ${question35.questionText.substring(0, 50)}...`);
      console.log(`正解: ${question35.correctAnswer}`);
    }

    const question55 = await prisma.question.findUnique({ where: { questionNo: 55 } });
    if (question55) {
      console.log(`\n【問55】(${question55.category})`);
      console.log(`問題文: ${question55.questionText.substring(0, 50)}...`);
      console.log(`正解: ${question55.correctAnswer}`);
    }

    // ユーザー確認
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany();
    console.log(`\n👥 登録ユーザー数: ${userCount}人`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // 統計データ確認
    const statsCount = await prisma.userStats.count();
    console.log(`\n📈 ユーザー統計レコード数: ${statsCount}件`);

    // データ整合性チェック
    console.log(`\n✅ データ整合性チェック:`);

    // 重複チェック
    const duplicates = await prisma.$queryRaw<Array<{ questionNo: number; count: number }>>`
      SELECT questionNo, COUNT(*) as count
      FROM Question
      GROUP BY questionNo
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length === 0) {
      console.log(`   ✓ 問題番号の重複なし`);
    } else {
      console.log(`   ✗ 重複あり:`, duplicates);
    }

    // 欠番チェック
    const missingNumbers: number[] = [];
    for (let i = 1; i <= 100; i++) {
      const exists = await prisma.question.findUnique({ where: { questionNo: i } });
      if (!exists) {
        missingNumbers.push(i);
      }
    }

    if (missingNumbers.length === 0) {
      console.log(`   ✓ 問題番号の欠番なし (1-100すべて存在)`);
    } else {
      console.log(`   ✗ 欠番あり:`, missingNumbers);
    }

    // 正解データの確認
    const answersCheck = await prisma.question.findMany({
      where: { correctAnswer: { in: ['A', 'B', 'C', 'D'] } }
    });
    console.log(`   ✓ 正解データ: ${answersCheck.length}問が有効な正解を持っています`);

    console.log(`\n✨ データベースチェック完了！`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
