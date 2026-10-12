# ITパスポート試験 学習アプリ

ITパスポート試験の学習を支援するNext.jsアプリケーションです。

## 主な機能

- 10問単位でのクイズセッション
- 正解・不正解の判定と解説表示
- 学習履歴の記録と統計表示
- 間違えた問題の復習モード
- 分野別の学習進捗管理

## 技術スタック

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS
- **Database**: PostgreSQL (Supabase推奨)
- **ORM**: Prisma
- **認証**: NextAuth.js (今後実装予定)

## セットアップ手順

### 1. 環境変数の設定

`.env`ファイルにデータベース接続情報を設定します：

```bash
# PostgreSQL接続URL（Supabaseまたはローカル）
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Prismaクライアントの生成

```bash
npx prisma generate
```

### 4. データベースマイグレーション

```bash
# マイグレーションファイルの作成と適用
npx prisma migrate dev --name init
```

### 5. 問題データの抽出とインポート

```bash
# PDFから問題データを抽出（今後実装）
npm run extract-questions

# データベースにシードデータを投入
npx prisma db seed
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
itpassport-app/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── quiz/              # クイズページ
│   └── stats/             # 統計ページ
├── prisma/
│   └── schema.prisma      # データベーススキーマ
├── lib/
│   └── prisma.ts          # Prismaクライアント設定
├── scripts/
│   └── extract-questions.ts  # PDF抽出スクリプト
├── data/
│   └── questions.json     # 抽出した問題データ
└── components/            # Reactコンポーネント
```

## データベーススキーマ

### Question（問題）
- 100問のITパスポート試験問題
- カテゴリー分類（ストラテジ・マネジメント・テクノロジ）
- 4択の選択肢と正解
- 解説文（後で追加可能）

### User（ユーザー）
- ユーザー情報管理
- メール認証対応

### UserAnswer（回答履歴）
- 個別の回答記録
- 正誤判定
- 回答時間の記録

### QuizSession（クイズセッション）
- 10問単位の学習記録
- 通常モード・復習モード・分野別モード

### UserStats（統計情報）
- 総合・分野別の正答率
- 学習進捗の可視化
- 連続学習日数の記録

## 開発計画

- [x] Next.jsプロジェクト初期セットアップ
- [x] データベーススキーマ設計
- [ ] PDFからの問題データ抽出
- [ ] データベース初期化とシードデータ投入
- [ ] 10問出題機能の実装
- [ ] 回答・採点・解説表示機能
- [ ] 学習履歴管理機能
- [ ] 復習モード（間違えた問題）実装
- [ ] UI/UXの改善
- [ ] NextAuth.js認証の実装

## ライセンス

MIT
