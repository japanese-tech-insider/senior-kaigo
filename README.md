# 実家整理特化情報メディア (senior-jikka)

「親が亡くなった後の実家整理」に特化した、45〜65歳読者向けメディアサイトおよびAI自動記事生成・Gmail承認パイプラインです。

---

## 🛠️ 技術スタック & 構成

- **フロントエンド**: Next.js 15 (App Router, モバイルファースト) + Tailwind CSS + Lucide Icons
- **データベース**: Cloud Firestore (`topics`, `articles`, `processed_emails`)
- **ホスティング**: Firebase Hosting / App Hosting
- **自動化パイプライン**: GitHub Actions + Gemini API + Gmail API (OAuth2 Refresh Token)
- **SEO/パフォーマンス**: 動的 JSON-LD (Article, FAQPage) / 動的 OGP / 動的 `sitemap.xml` / オンデマンド ISR 再検証 API (`/api/revalidate`)

---

## 📱 デザイン・UX設計のこだわり (ペルソナ最適化)

1. **結論ファースト構成**: 記事冒頭3行で「この記事で分かること」「あなたの状況での結論」を即表示。
2. **簡単3ステップ診断UI**: トップページで「今の状況」「実家との距離」「優先したい課題」を選択するだけで最適な結論とおすすめ手順に誘導。
3. **1セクション1メッセージ**: 箇条書き・比較表・ワンポイントアドバイスアイコンを多用し、長文ブロックを完全排除。
4. **統一CTA**: ボタンデザインと文言を「**無料で相談してみる**」の1種類に統一し、読者の迷いを解消。
5. **高齢層向けフォント**: フォントサイズ17〜18px基準、行間1.85倍でゆったり読みやすいデザイン。
6. **5つの主要カテゴリ**:
   - `jikka-jimai`: 実家じまいの進め方
   - `akiya`: 空き家の管理・売却
   - `kaitai`: 解体費用・手引き
   - `ihin-seiri`: 遺品整理のコツ・相場
   - `souzoku`: 相続手続きとの関係

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
| `NEXT_PUBLIC_SITE_URL` | 本番メディアサイトの URL (例: `https://senior-jikka.web.app`) |
| `REVALIDATE_SECRET_TOKEN` | オンデマンド ISR 再検証 API の認証用ランダム文字列 |

---

## ⚙️ GitHub Actions ワークフロー構成

- **`generate-topics.yml`** (毎日 朝 6:00 JST 実行)
  - Gemini API で重複のない新しいトピック候補を生成し `topics` (status: "unused") に保存。
- **`generate-article.yml`** (毎日 朝 7:00 JST 実行)
  - 未使用トピックを取得し、ペルソナ最適化プロンプトで記事を生成。`articles` (status: "pending_review") に保存し、Gmail でレビュー依頼メールを送信。
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
