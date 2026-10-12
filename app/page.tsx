import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ITパスポート試験
          </h1>
          <p className="text-xl text-gray-600">練習問題アプリ</p>
        </header>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {/* 機能カード */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              学習メニュー
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* クイズカード */}
              <Link
                href="/quiz"
                className="group relative overflow-hidden rounded-lg border-2 border-blue-200 hover:border-blue-400 transition p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg"
              >
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                    10問チャレンジ
                  </h3>
                  <p className="text-gray-600 text-sm flex-1">
                    ランダムに選ばれた10問に挑戦！本番さながらの問題演習で実力をチェックできます。
                  </p>
                  <div className="mt-4 text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                    問題を開始する
                    <span className="transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>

              {/* 復習モード（準備中） */}
              <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 bg-gray-50 opacity-60 cursor-not-allowed">
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    復習モード
                  </h3>
                  <p className="text-gray-600 text-sm flex-1">
                    間違えた問題を集中的に復習して、弱点を克服しましょう。
                  </p>
                  <div className="mt-4 text-gray-400 font-medium">
                    準備中...
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              </div>

              {/* 学習履歴（準備中） */}
              <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 bg-gray-50 opacity-60 cursor-not-allowed">
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    学習履歴
                  </h3>
                  <p className="text-gray-600 text-sm flex-1">
                    あなたの学習記録と統計を確認できます。成長の軌跡を見てみましょう。
                  </p>
                  <div className="mt-4 text-gray-400 font-medium">
                    準備中...
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              </div>

              {/* 分野別学習（準備中） */}
              <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 bg-gray-50 opacity-60 cursor-not-allowed">
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    分野別学習
                  </h3>
                  <p className="text-gray-600 text-sm flex-1">
                    ストラテジ系・マネジメント系・テクノロジ系から選んで学習できます。
                  </p>
                  <div className="mt-4 text-gray-400 font-medium">
                    準備中...
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          {/* 問題データ情報 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              収録問題について
            </h3>

            {/* 年度別問題数 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">年度別収録数</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-indigo-600">100問</div>
                  <div className="text-xs text-gray-600">令和8年 (2026)</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">100問</div>
                  <div className="text-xs text-gray-600">令和7年 (2025)</div>
                </div>
                <div className="bg-cyan-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-cyan-600">100問</div>
                  <div className="text-xs text-gray-600">令和6年 (2024)</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-teal-600">100問</div>
                  <div className="text-xs text-gray-600">令和5年 (2023)</div>
                </div>
              </div>
            </div>

            {/* カテゴリー別問題数 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">カテゴリー別収録数（全年度）</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    136問
                  </div>
                  <div className="text-sm text-gray-600">
                    ストラテジ系
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    80問
                  </div>
                  <div className="text-sm text-gray-600">
                    マネジメント系
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    184問
                  </div>
                  <div className="text-sm text-gray-600">
                    テクノロジ系
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 rounded-full">
                <span className="text-sm font-medium text-gray-700">総問題数:</span>
                <span className="text-2xl font-bold text-indigo-700">400問</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              ※ 令和5年（2023年）～令和8年（2026年）度 ITパスポート試験の過去問を収録
            </p>
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>© 2026 ITパスポート練習問題アプリ</p>
        </footer>
      </div>
    </div>
  );
}
