import fs from 'fs';
import path from 'path';

// pdf-parseはCommonJS形式
const pdfParse: (dataBuffer: Buffer) => Promise<{ text: string; numpages: number }> = require('pdf-parse');

interface Question {
  questionNo: number;
  category: 'STRATEGY' | 'MANAGEMENT' | 'TECHNOLOGY';
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

// カテゴリーを判定
function getCategory(questionNo: number): 'STRATEGY' | 'MANAGEMENT' | 'TECHNOLOGY' {
  if (questionNo >= 1 && questionNo <= 34) return 'STRATEGY';
  if (questionNo >= 35 && questionNo <= 54) return 'MANAGEMENT';
  return 'TECHNOLOGY';
}

// 日本語の選択肢記号を英語に変換
function convertAnswer(japaneseAnswer: string): 'A' | 'B' | 'C' | 'D' {
  const mapping: { [key: string]: 'A' | 'B' | 'C' | 'D' } = {
    'ア': 'A',
    'イ': 'B',
    'ウ': 'C',
    'エ': 'D'
  };
  return mapping[japaneseAnswer] || 'A';
}

async function extractAnswers(pdfPath: string): Promise<Map<number, 'A' | 'B' | 'C' | 'D'>> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  const answerMap = new Map<number, 'A' | 'B' | 'C' | 'D'>();

  // 正解パターン: 問1→ア
  const answerPattern = /問(\d+)→([ア-エ])/g;
  let match;

  while ((match = answerPattern.exec(text)) !== null) {
    const questionNo = parseInt(match[1]);
    const answer = convertAnswer(match[2]);
    answerMap.set(questionNo, answer);
  }

  console.log(`✅ 正解データを ${answerMap.size} 問抽出しました`);
  return answerMap;
}

async function extractQuestions(questionsPdfPath: string, answersPdfPath: string): Promise<Question[]> {
  // 正解データを先に取得
  const answerMap = await extractAnswers(answersPdfPath);

  // 問題PDFを読み込み
  const dataBuffer = fs.readFileSync(questionsPdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  const questions: Question[] = [];

  // 問題を問番号で分割（問1から問100まで）
  for (let i = 1; i <= 100; i++) {
    const nextNum = i + 1;
    const pattern = new RegExp(
      `問${i}[\\s\\S]*?(?=問${nextNum}|$)`,
      'g'
    );

    const match = text.match(pattern);
    if (!match) {
      console.warn(`⚠️ 問${i} が見つかりませんでした`);
      continue;
    }

    const questionBlock = match[0];

    // 問題文を抽出（問番号の後から選択肢の前まで）
    const questionTextMatch = questionBlock.match(/問\d+\s+([\s\S]*?)(?=ア[\s\S]*?イ[\s\S]*?ウ[\s\S]*?エ)/);
    let questionText = questionTextMatch ? questionTextMatch[1].trim() : '';

    // 選択肢を抽出
    const choiceAMatch = questionBlock.match(/ア\s+(.*?)(?=イ|$)/s);
    const choiceBMatch = questionBlock.match(/イ\s+(.*?)(?=ウ|$)/s);
    const choiceCMatch = questionBlock.match(/ウ\s+(.*?)(?=エ|$)/s);
    const choiceDMatch = questionBlock.match(/エ\s+(.*?)(?=問\d+|$)/s);

    const choiceA = choiceAMatch ? choiceAMatch[1].trim().split('\n')[0].trim() : '';
    const choiceB = choiceBMatch ? choiceBMatch[1].trim().split('\n')[0].trim() : '';
    const choiceC = choiceCMatch ? choiceCMatch[1].trim().split('\n')[0].trim() : '';
    const choiceD = choiceDMatch ? choiceDMatch[1].trim().split('\n')[0].trim() : '';

    // 正解を取得
    const correctAnswer = answerMap.get(i) || 'A';

    questions.push({
      questionNo: i,
      category: getCategory(i),
      questionText,
      choiceA,
      choiceB,
      choiceC,
      choiceD,
      correctAnswer
    });
  }

  console.log(`✅ ${questions.length} 問の問題を抽出しました`);

  // カテゴリー別の統計
  const strategyCount = questions.filter(q => q.category === 'STRATEGY').length;
  const managementCount = questions.filter(q => q.category === 'MANAGEMENT').length;
  const technologyCount = questions.filter(q => q.category === 'TECHNOLOGY').length;

  console.log(`📊 ストラテジ系: ${strategyCount}問`);
  console.log(`📊 マネジメント系: ${managementCount}問`);
  console.log(`📊 テクノロジ系: ${technologyCount}問`);

  return questions;
}

async function main() {
  const parentDir = path.join(__dirname, '../../');
  const questionsPdfPath = path.join(parentDir, '2026r08_ip_qs.pdf');
  const answersPdfPath = path.join(parentDir, '2026r08_ip_ans.pdf');
  const outputPath = path.join(__dirname, '../data/questions.json');

  console.log('🚀 PDF抽出を開始します...\n');

  // PDFファイルの存在確認
  if (!fs.existsSync(questionsPdfPath)) {
    console.error(`❌ 問題PDFが見つかりません: ${questionsPdfPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(answersPdfPath)) {
    console.error(`❌ 解答PDFが見つかりません: ${answersPdfPath}`);
    process.exit(1);
  }

  try {
    const questions = await extractQuestions(questionsPdfPath, answersPdfPath);

    // JSONファイルに保存
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf-8');
    console.log(`\n✅ データを保存しました: ${outputPath}`);

    // サンプル表示
    console.log('\n📝 抽出サンプル（問1）:');
    console.log(JSON.stringify(questions[0], null, 2));

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
