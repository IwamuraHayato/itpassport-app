import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('📊 データベース検証を開始します...\n');

  try {
    // 1. 総問題数の確認
    const totalQuestions = await prisma.question.count();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  総問題数');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   総数: ${totalQuestions}問`);
    console.log(`   期待値: 400問`);
    console.log(`   結果: ${totalQuestions === 400 ? '✅ OK' : '❌ NG'}\n`);

    // 2. 年度別の問題数確認
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  年度別問題数');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const yearStats = await prisma.question.groupBy({
      by: ['year'],
      _count: true,
    });

    const years = [2023, 2024, 2025, 2026];
    let yearCheckOK = true;

    for (const year of years) {
      const stat = yearStats.find(s => s.year === year);
      const count = stat?._count || 0;
      const isOK = count === 100;
      if (!isOK) yearCheckOK = false;

      console.log(`   ${year}年度: ${count}問 ${isOK ? '✅' : '❌'}`);
    }
    console.log(`   結果: ${yearCheckOK ? '✅ 全年度OK' : '❌ 問題あり'}\n`);

    // 3. カテゴリー別問題数確認
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  カテゴリー別問題数（全年度）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const categoryStats = await prisma.question.groupBy({
      by: ['category'],
      _count: true,
    });

    categoryStats.forEach(stat => {
      const categoryName =
        stat.category === 'STRATEGY' ? 'ストラテジ系' :
        stat.category === 'MANAGEMENT' ? 'マネジメント系' : 'テクノロジ系';
      console.log(`   ${categoryName}: ${stat._count}問`);
    });
    console.log();

    // 4. 各年度のカテゴリー別分布確認
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  各年度のカテゴリー分布');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const year of years) {
      const yearCategoryStats = await prisma.question.groupBy({
        by: ['category'],
        where: { year },
        _count: true,
      });

      console.log(`   ${year}年度:`);
      yearCategoryStats.forEach(stat => {
        const categoryName =
          stat.category === 'STRATEGY' ? 'ストラテジ系' :
          stat.category === 'MANAGEMENT' ? 'マネジメント系' : 'テクノロジ系';
        console.log(`      ${categoryName}: ${stat._count}問`);
      });
    }
    console.log();

    // 5. 問題番号の範囲と重複チェック
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣  問題番号の検証');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let duplicateCheckOK = true;
    let rangeCheckOK = true;

    for (const year of years) {
      const yearQuestions = await prisma.question.findMany({
        where: { year },
        select: { questionNo: true },
        orderBy: { questionNo: 'asc' },
      });

      const questionNos = yearQuestions.map(q => q.questionNo);
      const uniqueNos = new Set(questionNos);

      // 重複チェック
      const hasDuplicates = questionNos.length !== uniqueNos.size;
      if (hasDuplicates) duplicateCheckOK = false;

      // 範囲チェック（1-100）
      const min = Math.min(...questionNos);
      const max = Math.max(...questionNos);
      const rangeOK = min === 1 && max === 100;
      if (!rangeOK) rangeCheckOK = false;

      console.log(`   ${year}年度: 範囲 ${min}-${max} ${rangeOK ? '✅' : '❌'}, 重複 ${hasDuplicates ? '❌ あり' : '✅ なし'}`);
    }
    console.log(`   結果: ${duplicateCheckOK && rangeCheckOK ? '✅ 全年度OK' : '❌ 問題あり'}\n`);

    // 6. サンプルデータの確認
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6️⃣  サンプルデータ確認');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const year of years) {
      const sampleQuestion = await prisma.question.findFirst({
        where: { year, questionNo: 1 },
      });

      if (sampleQuestion) {
        console.log(`   ${year}年度 問1:`);
        console.log(`      問題文: ${sampleQuestion.questionText.substring(0, 60)}...`);
        console.log(`      正解: ${sampleQuestion.correctAnswer}`);
        console.log(`      カテゴリー: ${sampleQuestion.category}`);
      } else {
        console.log(`   ${year}年度 問1: ❌ データなし`);
      }
    }
    console.log();

    // 7. データの完全性チェック
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('7️⃣  データの完全性チェック');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const incompleteData = await prisma.question.findMany({
      where: {
        OR: [
          { questionText: '' },
          { choiceA: '' },
          { choiceB: '' },
          { choiceC: '' },
          { choiceD: '' },
        ],
      },
    });

    console.log(`   空のフィールドがある問題: ${incompleteData.length}件 ${incompleteData.length === 0 ? '✅' : '❌'}`);

    if (incompleteData.length > 0) {
      console.log('   問題のあるデータ:');
      incompleteData.slice(0, 5).forEach(q => {
        console.log(`      - ${q.year}年度 問${q.questionNo}`);
      });
    }
    console.log();

    // 8. 総合判定
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 総合判定');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allChecksOK =
      totalQuestions === 400 &&
      yearCheckOK &&
      duplicateCheckOK &&
      rangeCheckOK &&
      incompleteData.length === 0;

    if (allChecksOK) {
      console.log('   ✅ すべてのチェックに合格しました！');
      console.log('   データベースは正常に構築されています。');
    } else {
      console.log('   ❌ 一部のチェックに失敗しました。');
      console.log('   上記の詳細を確認してください。');
    }
    console.log();

  } catch (error) {
    console.error('❌ 検証中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
