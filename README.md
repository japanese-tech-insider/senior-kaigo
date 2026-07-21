# 親の介護施設選び特化情報メディア (senior-kaigo)

「親の介護施設選び」に特化した、45〜65歳読者向けメディアサイトおよびAI自動記事生成・Gmail承認パイプラインです。焦りや罪悪感を抱える家族向けに、結論ファースト構成、平易な専門用語の言い換え、暖色系で安心感のあるデザインシステムを提供します。

---

## 🛠️ 技術スタック & 構成

- **フロントエンド**: Next.js 16 (App Router, モバイルファースト, 暖色系テーマ) + Tailwind CSS + Lucide Icons
- **データベース**: Cloud Firestore (`topics`, `articles`, `processed_emails`)
- **ホスティング**: Firebase Hosting / App Hosting
- **自動化パイプライン**: GitHub Actions + Gemini API + Gmail API (OAuth2 Refresh Token)
- **SEO/パフォーマンス**: 動的 JSON-LD (Article, FAQPage) / 動的 OGP / 動的 `sitemap.xml` / オンデマンド ISR 再検証 API (`/api/revalidate`)

---

## 📱 デザイン・UX設計のこだわり (ペルソナ最適化)

1. **結論ファースト構成**: 記事冒頭で「この記事はこんな人向け」「結論、まずこれをすればいい」を明示。
2. **3ステップ親の状況診断UI**: トップページで「生活・身体状況」「今一番の悩み」「要介護度」を選択するだけで我が家に最適な結論とおすすめ手順に誘導。
3. **暖色系・安心感パレット**: アプリコットオレンジ・ウォームホワイト・セージグリーンを採用し、読者の切迫感や罪悪感を和らげるトーン。
4. **統一CTA**: ボタン文言を「**無料で施設を探してもらう**」の1種類に統一し、読者の迷いを解消。
5. **平易な介護用語集**: 「特養」「有料老人ホーム」「グループホーム」「サ高住」「要介護度」等の専門用語に必ず平易な言い換えを併記。
6. **5つの主要カテゴリ**:
   - `criteria`: 施設選びの判断基準
   - `types`: 施設の種類と違い
   - `cost`: 費用・お金
   - `timing`: 入居のタイミング
   - `family-agreement`: 家族間の合意形成

---

## 🔐 Gmail API OAuth2 リフレッシュトークン取得手順

GitHub Actions ジョブが Gmail API 経由でレビュー依頼メールの送信・返信確認を行うため、以下の手順で `GMAIL_REFRESH_TOKEN` を取得してください。

### ステップ 1: Google Cloud Console の設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスします。
2. プロジェクトを作成（または既存プロジェクトを選択）し、**Gmail API** を有効化します。
3. **OAuth 同意画面** を設定します:
   - User Type: 「外部」または「内部」を選択
   - アプリ名、ユーザーサポートメールを入力
   - スコープに `https://mail.google.com/` または `https://www.googleapis.com/auth/gmail.modify` を追加
   - テストユーザーに自身の Gmail アドレスを追加します。
4. **認証情報** > **認証情報を作成** > **OAuth クライアント ID** を選択します:
   - アプリケーションの種類: **デスクトップ アプリケーション**
   - 名前: `Gmail Actions Client`
5. 発行された `Client ID` と `Client Secret` を手元に控えます。

### ステップ 2: トークン取得スクリプトの実行
ローカル環境で以下のコマンドを実行します:

```bash
export GMAIL_CLIENT_ID="取得したClient_ID"
export GMAIL_CLIENT_SECRET="取得したClient_Secret"

node scripts/get-gmail-token.js
```

1. ターミナルに表示された URL をブラウザで開き、Google アカウントでログイン・許可を与えます。
2. 画面に表示された **認証コード** をターミナルに入力して Enter を押します。
3. コンソールに `Refresh Token` が表示されます。

---

## 🔑 GitHub Secrets 設定マニュアル

GitHub リポジトリの **Settings > Secrets and variables > Actions** に以下の Secrets を登録してください。

| Secret 名 | 内容 |
| :--- | :--- |
| `GEMINI_API_KEY` | Gemini API の API キー |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firestore 操作用の Firebase サービスアカウントキー (JSON 文字列) |
| `GMAIL_CLIENT_ID` | Google OAuth2 クライアント ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth2 クライアント Secret |
| `GMAIL_REFRESH_TOKEN` | 上記手順で取得した OAuth2 リフレッシュトークン |
| `GMAIL_USER_EMAIL` | レビュー依頼の送信先兼送信元 Gmail アドレス |
| `NEXT_PUBLIC_SITE_URL` | 本番メディアサイトの URL (例: `https://senior-kaigo.web.app`) |
| `REVALIDATE_SECRET_TOKEN` | オンデマンド ISR 再検証 API の認証用ランダム文字列 |

---

## ⚙️ GitHub Actions ワークフロー構成

- **`generate-topics.yml`** (毎日 朝 6:00 JST 実行)
  - Gemini API で重複のない新しい介護施設選びのトピック候補を生成し `topics` (status: "unused") に保存。
- **`generate-article.yml`** (毎日 朝 7:00 JST 実行)
  - 未使用トピックを取得し、ペルソナ最適化・結論ファースト・平易言い換え併記プロンプトで記事を生成。`articles` (status: "pending_review") に保存し、Gmail でレビュー依頼メールを送信。
- **`check-review-replies.yml`** (15〜30分おき実行)
  - 返信メールを受信解析。「OK」で status: "published" に変更＋ISR即時反映、「NG」でフィードバック保存＋トピック再生成へ戻す。

---

## 🚀 ローカル開発 & ビルド確認

```bash
# 依存ライブラリのインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルドテスト
npm run build
```
