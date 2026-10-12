'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  year: number;
  questionNo: number;
  category: string;
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
}

interface Answer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
}

interface QuizResult {
  questionId: number;
  questionNo: number;
  questionText: string;
  category: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, 'A' | 'B' | 'C' | 'D'>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    results: QuizResult[];
    summary: {
      total: number;
      correct: number;
      incorrect: number;
      score: number;
    };
  } | null>(null);

  // 問題を取得
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/quiz');
        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('問題の取得に失敗しました:', error);
        alert('問題の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // 回答を選択
  const handleSelectAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentIndex].id, answer);
    setAnswers(newAnswers);
  };

  // 次の問題へ
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 前の問題へ
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 採点
  const handleSubmit = async () => {
    if (answers.size < questions.length) {
      const unanswered = questions.length - answers.size;
      if (!confirm(`未回答の問題が${unanswered}問あります。採点しますか？`)) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const answersArray: Answer[] = Array.from(answers.entries()).map(
        ([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })
      );

      const response = await fetch('/api/quiz/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('採点に失敗しました:', error);
      alert('採点に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ロード中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">問題を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // 結果表示
  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              クイズ結果
            </h1>

            {/* スコア表示 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {results.summary.score}点
                </div>
                <div className="text-sm text-gray-600 mt-1">スコア</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {results.summary.correct}問
                </div>
                <div className="text-sm text-gray-600 mt-1">正解</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">
                  {results.summary.incorrect}問
                </div>
                <div className="text-sm text-gray-600 mt-1">不正解</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {results.summary.total}問
                </div>
                <div className="text-sm text-gray-600 mt-1">合計</div>
              </div>
            </div>

            {/* 各問題の詳細 */}
            <div className="space-y-4">
              {results.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`border rounded-lg p-4 ${
                    result.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          問{result.questionNo}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                          {result.category}
                        </span>
                        {result.isCorrect ? (
                          <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded font-medium">
                            ✓ 正解
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded font-medium">
                            ✗ 不正解
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap mb-3">
                        {result.questionText}
                      </p>

                      {/* 選択肢 */}
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                          const choiceKey =
                            `choice${choice}` as keyof QuizResult;
                          const isCorrect = result.correctAnswer === choice;
                          const isSelected = result.selectedAnswer === choice;

                          return (
                            <div
                              key={choice}
                              className={`p-3 rounded border ${
                                isCorrect
                                  ? 'bg-green-100 border-green-300'
                                  : isSelected
                                  ? 'bg-red-100 border-red-300'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-700">
                                  {choice === 'A'
                                    ? 'ア'
                                    : choice === 'B'
                                    ? 'イ'
                                    : choice === 'C'
                                    ? 'ウ'
                                    : 'エ'}
                                  :
                                </span>
                                <span className="text-gray-800">
                                  {result[choiceKey] as string}
                                </span>
                                {isCorrect && (
                                  <span className="ml-auto text-green-700 font-bold">
                                    正解
                                  </span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="ml-auto text-red-700 font-bold">
                                    あなたの回答
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* アクションボタン */}
            <div className="mt-6 flex gap-4">
              <Link
                href="/quiz"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-medium"
              >
                もう一度挑戦
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition text-center font-medium"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // クイズ画面
  // 問題データの存在チェック
  if (!questions || questions.length === 0 || !questions[currentIndex]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">問題の読み込みに失敗しました</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers.get(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ヘッダー */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                ITパスポート試験 練習問題
              </h1>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ホームに戻る
              </Link>
            </div>

            {/* プログレスバー */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* 回答状況 */}
            <div className="text-sm text-gray-600">
              回答済み: {answers.size} / {questions.length}問
            </div>
          </div>

          {/* 問題 */}
          {currentQuestion && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-600">
                  問{currentQuestion.questionNo}
                </span>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded font-medium">
                  {currentQuestion.year}年度
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {currentQuestion.category}
                </span>
              </div>

              <p className="text-lg text-gray-800 mb-6 whitespace-pre-wrap">
                {currentQuestion.questionText}
              </p>

              {/* 選択肢 */}
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                  const choiceKey = `choice${choice}` as keyof Question;
                  const isSelected = selectedAnswer === choice;

                  return (
                    <button
                      key={choice}
                      onClick={() => handleSelectAnswer(choice)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700 mr-2">
                            {choice === 'A'
                              ? 'ア'
                              : choice === 'B'
                              ? 'イ'
                              : choice === 'C'
                              ? 'ウ'
                              : 'エ'}
                            :
                          </span>
                          <span className="text-gray-800">
                            {currentQuestion[choiceKey]}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              前の問題
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                次の問題
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isSubmitting ? '採点中...' : '採点する'}
              </button>
            )}
          </div>

          {/* 問題番号ナビゲーション */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">問題番号で移動:</p>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`aspect-square rounded-lg text-sm font-medium transition ${
                    index === currentIndex
                      ? 'bg-blue-600 text-white'
                      : answers.has(q.id)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
