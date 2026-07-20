/**
 * Job 2: generate-article
 * 毎日朝7時(JST)に実行
 * 
 * 1. Firestore topics コレクションから status: "unused" のトピックを1件取得
 * 2. Gemini API で要件に沿った Markdown 記事を生成
 *    (UX方針: 結論ファースト・冒頭3行・1セクション1メッセージ・箇条書き・統一CTA・FAQ)
 * 3. 過去に NG 判定されたトピックの再生生時は feedbackNotes をプロンプトに組み込む
 * 4. 生成結果を Firestore articles に status: "pending_review" で保存
 * 5. topic の status を "used" に更新
 * 6. Gmail API でレビュー担当者に承認リクエストメールを送信し threadId / messageId を記録
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const { google } = require('googleapis');

function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountVar) {
      throw new Error('環境変数 FIREBASE_SERVICE_ACCOUNT_KEY がセットされていません。');
    }
    const serviceAccount = typeof serviceAccountVar === 'string'
      ? JSON.parse(serviceAccountVar)
      : serviceAccountVar;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.firestore();
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

function createRawEmail({ to, from, subject, body }) {
  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ];
  const email = emailLines.join('\r\n');
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function main() {
  console.log('=== [Job 2] generate-article 開始 ===');

  const apiKey = process.env.GEMINI_API_KEY;
  const userEmail = process.env.GMAIL_USER_EMAIL;
  if (!apiKey || !userEmail) {
    throw new Error('環境変数 GEMINI_API_KEY または GMAIL_USER_EMAIL が見つかりません。');
  }

  const db = initFirebaseAdmin();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // 1. status: "unused" のトピックを1件取得
  const topicsSnapshot = await db.collection('topics')
    .where('status', '==', 'unused')
    .limit(1)
    .get();

  if (topicsSnapshot.empty) {
    console.log('生成対象の未使用トピック (status: "unused") がありません。処理を終了します。');
    return;
  }

  const topicDoc = topicsSnapshot.docs[0];
  const topicData = topicDoc.data();
  const topicId = topicDoc.id;

  console.log(`対象トピック取得 [ID: ${topicId}]:`, topicData.keyword);

  // 前回のフィードバック notes があるか確認
  const previousFeedback = topicData.lastFeedbackNotes || '';

  // 2. LLM プロンプト作成 (ペルソナ・UX規則の厳格注入)
  const prompt = `
あなたは「親が亡くなった後の実家整理」特化メディアのプロライターです。
以下のトピックに基づいて、読者が最高に見やすく、最短で「安心できる次の一歩」を得られる解説記事を生成してください。

【対象トピック】
- キーワード: ${topicData.keyword}
- 切り口/アングル: ${topicData.angle}
- カテゴリ: ${topicData.category || 'jikka-jimai'}
${previousFeedback ? `\n【前回の修正要求 (Feedback Notes)】\n${previousFeedback}\n上記修正要求を確実に反映してください。` : ''}

【UX・デザイン規則 (絶対遵守)】
1. 冒頭結論サマリー (summaryList): 冒頭3行で「この記事で分かること」「あなたの状況ならこうすべき」がひと目で分かる3つの要点箇条書き。
2. 構成: 1セクション＝1つのメッセージ。長文だけのブロックは避け、箇条書き、比較表 (Markdown Table)、引用枠 (> 💡) を多用する。
3. 文言: 45〜65歳の読者向けに専門用語や難しい横文字は避け、丁寧な平易な日本語を使う。医療や法律の断定表現は避ける。
4. FAQ: 読者が不安に思いがちな2つの疑問とその明快な回答 (faqList)。
5. CTA文言: 記事内のボタン案内文言言及は統一して「無料で相談してみる」とする。

【出力フォーマット】
以下のJSONオブジェクト形式のみを出力してください（Markdownコードブロックで囲まないでください）。

{
  "slug": "英語のハイフン区切りスラッグ (例: jikka-seiri-hiyou-souba)",
  "title": "読者の目を惹く記事タイトル (例: 親が亡くなった後の実家整理は何から始める？手順と費用)",
  "metaTitle": "SEO用メタタイトル (35文字以内)",
  "metaDescription": "SEO用メタディスクリプション (100文字程度)",
  "summaryList": [
    "冒頭結論1: ...",
    "冒頭結論2: ...",
    "冒頭結論3: ..."
  ],
  "faqList": [
    { "question": "質問1", "answer": "回答1" },
    { "question": "質問2", "answer": "回答2" }
  ],
  "body": "Markdown形式の本文 (H2セクション, 箇条書き, 表を含む)"
}
`;

  console.log('Gemini APIに記事全文の生成を依頼中...');
  const result = await model.generateContent(prompt);
  let responseText = result.response.text().trim();

  if (responseText.startsWith('```json')) {
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const generatedArticle = JSON.parse(responseText);

  // 3. Firestore articles に pending_review で保存
  const articleRef = db.collection('articles').doc();
  const articleDataToSave = {
    topicId,
    slug: generatedArticle.slug,
    title: generatedArticle.title,
    body: generatedArticle.body,
    metaTitle: generatedArticle.metaTitle,
    metaDescription: generatedArticle.metaDescription,
    summaryList: generatedArticle.summaryList || [],
    faqList: generatedArticle.faqList || [],
    category: topicData.category || 'jikka-jimai',
    status: 'pending_review',
    reviewIteration: (topicData.reviewIteration || 0) + 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await articleRef.set(articleDataToSave);
  console.log(`Firestore articles に保存完了 [Article ID: ${articleRef.id}]`);

  // 4. トピックの status を "used" に変更
  await db.collection('topics').doc(topicId).update({
    status: 'used',
  });

  // 5. Gmail API で承認担当者へ通知メール送信
  console.log('Gmail APIで承認担当者にメールを送信中...');
  const gmail = getGmailClient();

  const emailSubject = `【実家整理メディア 記事レビュー依頼】${generatedArticle.title}`;
  const emailBody = `実家整理特化メディアの自動生成記事のレビュー依頼です。

■ 記事ID: ${articleRef.id}
■ タイトル: ${generatedArticle.title}
■ カテゴリ: ${topicData.category || 'jikka-jimai'}
■ メタDescription: ${generatedArticle.metaDescription}

【冒頭結論サマリー】
${(generatedArticle.summaryList || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

==================================================
【承認・却下の返信方法】
- 公開する場合: このメールに「OK」とだけ返信してください。
- 修正・再生成する場合: 「NG」と記載し、続けて修正理由・改善指示を返信してください。
==================================================

【生成本文 (Markdown)】
${generatedArticle.body}
`;

  const raw = createRawEmail({
    to: userEmail,
    from: userEmail,
    subject: emailSubject,
    body: emailBody,
  });

  const sentMail = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  // メール送信用 ID (threadId / messageId) を記事ドキュメントに保存
  await articleRef.update({
    gmailMessageId: sentMail.data.id,
    gmailThreadId: sentMail.data.threadId,
  });

  console.log(`=== [Job 2] generate-article 完了 (Gmail MessageId: ${sentMail.data.id}) ===`);
}

main().catch((err) => {
  console.error('Job 2 エラー発生:', err);
  process.exit(1);
});
