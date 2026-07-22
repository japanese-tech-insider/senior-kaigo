/**
 * Job 2: generate-article
 * 毎日朝7時(JST)に実行
 * 「親の介護施設選び」特化メディア用記事自動生成
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { google } = require('googleapis');

const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'kaigo';
const topicsCollection = siteId === 'kaigo' ? 'kaigo_topics' : 'topics';
const articlesCollection = siteId === 'kaigo' ? 'kaigo_articles' : 'articles';

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountVar) {
      throw new Error('環境変数 FIREBASE_SERVICE_ACCOUNT_KEY がセットされていません。');
    }
    const serviceAccount = typeof serviceAccountVar === 'string'
      ? JSON.parse(serviceAccountVar)
      : serviceAccountVar;

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore();
}

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail API 認証環境変数がセットされていません。');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createRawHtmlEmail({ to, from, subject, htmlBody }) {
  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    htmlBody,
  ];
  const email = emailLines.join('\r\n');
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function convertMarkdownToHtml(markdownText) {
  if (!markdownText) return '';
  let html = markdownText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: bold; color: #7c2d12; margin-top: 16px; margin-bottom: 8px;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; font-weight: bold; color: #7c2d12; border-bottom: 2px solid #e07a5f; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px;">$1</h2>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #c85a32; font-weight: bold; background-color: #fdf8f5; padding: 2px 4px;">$1</strong>');
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote style="border-left: 4px solid #e07a5f; background-color: #fdf8f5; padding: 10px 14px; margin: 12px 0; color: #7c2d12; font-weight: 500;">$1</blockquote>');
  html = html.replace(/\n/g, '<br />');

  return html;
}

function generateArticleMock(topicData) {
  return {
    slug: `kaigo-facility-guide-${Date.now()}`,
    title: `${topicData.keyword}「今すぐ何をすべき？」失敗しない施設選びの手順`,
    metaTitle: `${topicData.keyword}｜後悔しない介護施設選びの判断基準`,
    metaDescription: `${topicData.keyword}についてポイントを整理して解説。我が家に最適な選び方と無料相談のタイミングを提示します。`,
    summaryList: [
      '親御さんの認知症・要介護度の状態に合わせて「特養」か「民所有料」かをまず見極めるのが安心です。',
      '費用は親の年金受給額を基準にし、高額介護サービス費などの公的助成制度を最大限活用しましょう。',
      '家族だけで抱え込まず、無料の施設探し窓口を活用して条件に合う最新情報を手に入れるのが第一歩です。',
    ],
    faqList: [
      {
        question: '特養（特別養護老人ホーム）には誰でも入れますか？',
        answer: '原則として「要介護3以上」の判定を受けた方が対象です。要介護1〜2の方はサ高住や民間有料老人ホーム、グループホームが主な検討対象となります。',
      },
      {
        question: '親が「老人ホームに行きたくない」と言った時はどうすればいいですか？',
        answer: '無理に説得せず、まずは見学や数日間の体験入所（ショートステイ）から試してもらうか、ケアマネジャーなどの専門家から伝えてもらうのがスムーズです。',
      },
    ],
    body: `
## はじめに
親の介護や認知症の進行に直面すると、「どの老人ホームを選べばいいか分からない」「兄弟で意見が合わない」と焦りや罪悪感を抱えてしまいがちです。

本記事では、難しい専門用語を使わずに、我が家の状況に合った**後悔しない施設選びの判断基準**を明快に解説します。

---

## 1. まず知っておくべき「施設の種類と主な対象」
介護施設にはいくつかの種類がありますが、大きく分けて以下の公的施設と民間施設があります。

* **特別養護老人ホーム(特養)** ＝ *費用が安く終身利用できる公的施設（原則要介護3以上）*
* **有料老人ホーム** ＝ *民間企業が運営し手厚いサービスや医療連携が受けられる施設*
* **グループホーム** ＝ *認知症の方が少人数で共同生活を送る専用施設*

---

## 2. 親の年金内で納めるための費用のポイント
介護施設にかかる月額費用は、施設の種類や部屋のタイプ（個室か相部屋か）によって大きく異なります。
親の年金月額（例：月10〜15万円）に合わせた施設を探す場合、自治体の負担限度額認定（食費・居住費の軽減制度）を活用するのが効果的です。

---

## まとめ：無料の相談窓口を活用して最適な一歩を
たくさんの施設を一覧で比べるのは大変な作業です。自分たちだけで悩まず、希望条件を伝えて無料で探してもらう専門サービスを賢く活用しましょう。
`,
    readingTimeMinutes: 4,
  };
}

async function generateArticleWithGemini(genAI, topicData) {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const candidateModels = [primaryModel, 'gemini-1.5-pro', 'gemini-2.0-flash'].filter(Boolean);

  const prompt = `
あなたは「親の介護施設選び」専門情報メディアの上級編集者です。
以下の【トピック情報】と【要件】に基づいて、SEO最適化された高品質な解説記事をJSON形式で作成してください。

【トピック情報】
- キーワード: ${topicData.keyword}
- 切り口・構成案: ${topicData.angle}
- カテゴリ: ${topicData.category}

【ペルソナ情報】
- ターゲット: 45〜65歳 (介護をしている本人、または子世代)
- 状態: 焦りと罪悪感を抱え、長文を読む余裕がない。スマホ閲覧メイン。
- 求めているもの: 一覧比較ではなく「我が家の状況ならどうすべきか」の明確な結論。

【記事の厳守要件】
1. **結論ファースト構成**: 冒頭の \`summaryList\` (3項目) に「この記事はこんな人向け」「結論、まずこれをすればいい」を明確に提示する。
2. **専門用語の平易な言い換え併記**: 本文中で専門用語（特養、有料老人ホーム、グループホーム、サ高住、老健、要介護度、ユニット型など）を出す場合、必ず直後に \`(例: 特別養護老人ホーム(特養)＝費用が比較的に安く終身過ごせる公的施設)\` のように平易なカッコ書き言い換えを併記すること。
3. **禁止事項 (ネガティブプロンプト)**:
   - 医療的な断定的助言は絶対避ける (必ず主治医やケアマネジャーへの相談を前提とする)
   - 特定の個別施設の実名評価・批判・比較は絶対に行わない
   - 不安を煽るような過激・脅迫的な表現は使わない
4. **統一CTA誘導**: 記事末尾や区切りで「無料で施設を探してもらう」という統一文言の無料相談窓口を活用することを推奨する。
5. **JSON形式**:
   - \`slug\`: 英数ハイフン小文字 (例: \`dementia-facility-selection-guide\`)
   - \`title\`: 魅力的なタイトル (32文字前後)
   - \`metaTitle\`: SEOメタタイトル
   - \`metaDescription\`: SEOメタ説明文 (120文字前後)
   - \`summaryList\`: 結論・要約の配列 (3要素)
   - \`faqList\`: よくある質問の配列 (\`question\` と \`answer\` を含む3〜4要素)
   - \`body\`: Markdown形式の本文 (見出しH2/H3、箇条書き、平易言い換え併記)
   - \`readingTimeMinutes\`: 読了目安時間 (数値, 例: 4)

JSON以外の説明文章は含めず、純粋なJSONオブジェクトのみを出力してください。
`;

  for (const modelName of candidateModels) {
    try {
      console.log(`Gemini APIに記事生成をリクエスト中 (モデル: ${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      return JSON.parse(responseText);
    } catch (err) {
      console.warn(`モデル [${modelName}] 試行エラー (${err.message})。次の候補へ切り替えます。`);
    }
  }

  console.warn('[フォールバック] 全モデルエラーのためモック記事を出力します。');
  return generateArticleMock(topicData);
}

async function main() {
  console.log(`=== [Job 2] generate-article 開始 (SiteID: ${siteId}, Topics: ${topicsCollection}, Articles: ${articlesCollection}) ===`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 GEMINI_API_KEY がセットされていません。');
  }

  const db = initFirebaseAdmin();
  const genAI = new GoogleGenerativeAI(apiKey);

  const topicsSnapshot = await db.collection(topicsCollection)
    .where('status', '==', 'unused')
    .limit(1)
    .get();

  if (topicsSnapshot.empty) {
    console.log('未使用のトピックがありません。[Job 2] を終了します。');
    return;
  }

  const topicDoc = topicsSnapshot.docs[0];
  const topicData = topicDoc.data();
  console.log(`対象トピック取得 (ID: ${topicDoc.id}): "${topicData.keyword}"`);

  const articleOutput = await generateArticleWithGemini(genAI, topicData);

  const articleData = {
    slug: articleOutput.slug || `kaigo-guide-${Date.now()}`,
    topicId: topicDoc.id,
    title: articleOutput.title,
    metaTitle: articleOutput.metaTitle || articleOutput.title,
    metaDescription: articleOutput.metaDescription || '',
    category: topicData.category,
    summaryList: articleOutput.summaryList || [],
    faqList: articleOutput.faqList || [],
    body: articleOutput.body || '',
    readingTimeMinutes: articleOutput.readingTimeMinutes || 4,
    status: 'pending_review',
    createdAt: new Date(),
    publishedAt: null,
  };

  const articleRef = await db.collection(articlesCollection).add(articleData);
  console.log(`Firestore の ${articlesCollection} に記事を保存しました (ID: ${articleRef.id}, slug: ${articleData.slug})`);

  await topicDoc.ref.update({
    status: 'used',
    usedAt: new Date(),
  });
  console.log(`トピック ${topicDoc.id} のステータスを "used" に更新しました。`);

  // レビューメール送信
  try {
    const gmail = getGmailClient();
    const reviewerEmail = process.env.GMAIL_USER_EMAIL;
    if (!reviewerEmail) {
      console.warn('GMAIL_USER_EMAIL がセットされていないためメール送信をスキップします。');
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senior-kaigo.web.app';
    const previewUrl = `${siteUrl}/articles/${articleData.slug}`;

    const summaryHtml = articleData.summaryList.map((s, i) => `
      <li style="margin-bottom: 6px; color: #1f2937;">
        <strong style="color: #7c2d12;">[結論 ${i + 1}]</strong> ${s}
      </li>
    `).join('');

    const bodyHtmlConverted = convertMarkdownToHtml(articleData.body);

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: -apple-system, sans-serif; line-height: 1.7; color: #374151; background-color: #fffdf9; margin: 0; padding: 20px;">
      <div style="max-w: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #fed7aa; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="background-color: #c85a32; padding: 20px 24px; color: #ffffff;">
          <span style="background-color: rgba(255,255,255,0.2); font-size: 12px; padding: 3px 8px; border-radius: 4px; font-weight: bold;">[記事レビュー依頼]</span>
          <h1 style="font-size: 20px; font-weight: bold; margin: 10px 0 0 0; color: #ffffff;">${articleData.title}</h1>
        </div>

        <div style="padding: 24px;">
          
          <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #9a3412;">
              <strong>【アクションのお願い】</strong><br>
              本メールに <strong>「OK」</strong> と返信すると本番公開されます。<br>
              修正点がある場合は <strong>「NG 〇〇を修正して」</strong> と返信してください。
            </p>
          </div>

          <table style="width: 100%; font-size: 13px; color: #4b5563; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6; width: 100px;"><strong>カテゴリ:</strong></td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6; color: #ea580c; font-weight: bold;">${articleData.category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;"><strong>キーワード:</strong></td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;">${topicData.keyword}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;"><strong>プレビュー:</strong></td>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6;"><a href="${previewUrl}" style="color: #ea580c; text-decoration: underline;">${previewUrl}</a></td>
            </tr>
          </table>

          <div style="background-color: #fdf8f5; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: bold; color: #9a3412; margin: 0 0 10px 0;">💡 結論ファースト サマリー (冒頭表示)</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 14px;">
              ${summaryHtml}
            </ol>
          </div>

          <h3 style="font-size: 16px; font-weight: bold; color: #111827; margin: 24px 0 12px 0; border-bottom: 2px solid #ea580c; padding-bottom: 4px;">📝 本文プレビュー</h3>
          <div style="font-size: 15px; color: #374151; line-height: 1.8;">
            ${bodyHtmlConverted}
          </div>

        </div>

        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          親の介護施設えらびの相談室 自動記事生成パイプライン
        </div>
      </div>
    </body>
    </html>
    `;

    const rawEmail = createRawHtmlEmail({
      to: reviewerEmail,
      from: reviewerEmail,
      subject: `【レビュー依頼】親の介護施設選び: ${articleData.title}`,
      htmlBody: htmlBody,
    });

    const sendRes = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawEmail,
      },
    });

    const gmailThreadId = sendRes.data.threadId;
    console.log(`レビューメールを送信しました (${reviewerEmail}), Thread ID: ${gmailThreadId}`);

    // Thread ID を記事に記録しておく (Job 3 での返信検知に必要)
    await db.collection(articlesCollection).doc(articleRef.id).update({
      gmailThreadId: gmailThreadId,
    });

  } catch (err) {
    console.error('Gmail送信エラー:', err.message);
  }

  console.log('=== [Job 2] 完了 ===');
}

main().catch((err) => {
  console.error('Job 2 エラー:', err);
  process.exit(1);
});
