import fs from 'fs';
import path from 'path';

interface QuestionData {
  year: number;
  questionNo: number;
  category: string;
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: string;
  explanation?: string;
  difficulty: number;
}

// 2026年度のデータを読み込み
const questions2026: QuestionData[] = JSON.parse(
  fs.readFileSync('data/questions-2026.json', 'utf-8')
);

console.log('📚 令和5年～7年度のダミーデータを作成します...\n');

// 各年度のダミーデータを作成
const years = [2023, 2024, 2025];

for (const year of years) {
  const yearQuestions = questions2026.map(q => ({
    ...q,
    year: year,
    questionText: `[${year}年度版] ${q.questionText}`,
  }));

  const outputPath = `data/questions-${year}.json`;
  fs.writeFileSync(
    outputPath,
    JSON.stringify(yearQuestions, null, 2),
    'utf-8'
  );

  console.log(`✅ ${year}年度: ${yearQuestions.length}問 → ${outputPath}`);
}

console.log('\n✨ ダミーデータ作成完了！');
console.log('\n⚠️  注意: これはダミーデータです。');
console.log('実際の過去問データがある場合は、該当ファイルを置き換えてください。\n');
