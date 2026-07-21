/**
 * Job 2: generate-article
 * 毎日朝7時(JST)に実行
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { google } = require('googleapis');

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

function generateArticleMock(topicData) {
  return {
    slug: `jikka-seiri-guide-${Date.now()}`,
    title: `${topicData.keyword}「何から始める？」後回しにしない順番とポイント解説`,
    metaTitle: `${topicData.keyword}の手引き｜失敗しない進め方と手順`,
    metaDescription: `${topicData.keyword}についてポイントを整理して解説。手順と無料査定相談のタイミングを提示します。`,
    summaryList: [
      'まずは「貴重品・重要書類の確保」と「契約の確認」を優先するのが安心です。',
      '不用品処分や実家売却は家族で方針を話し合ってから進めましょう。',
      '自力で抱え込まず専門の無料査定・見積もり相談を活用するのが第一歩です。',
    ],
    faqList: [
      {
        question: '片付けを始めるタイミングはいつが良いですか？',
        answer: '重要書類の探索はすぐに始めて構いません。大型家具の処分等は法要後に親族で相談して進めるのが安心です。',
      },
      {
        question: '費用を抑えるポイントはありますか？',
        answer: '出張買取で価値のある品を事前に買い取ってもらい、複数の専門事業者から査定を取り寄せるのがおすすめです。',
      },
    ],
    body: `
## 1. 最優先で手をつけるべきポイント

実家整理や空き家対策では、最初から全てを片付けようとせず重要な準備から進めることが大切です。

- **重要書類の確保**: 預金通帳、権利証、保険証券を優先的に確認します。
- **公共料金等の契約整理**: 片付け中に使う電気・水道を残し、不要な契約の手続きを進めます。
- **防犯対策**: 長期不在となる場合は戸締りや郵便物の転送を手配します。

---

## 2. 専門相談を活用するメリット

自力で数ヶ月かけるよりも、専門の無料査定・見積もり相談を活用することで手間や負担を減らせます。

> 💡 **一人で抱え込まずご相談ください**
> 無料の見積もりや現地の査定を取り寄せることで、実家の現状価値と今後の選択肢が明確になります。
`,
  };
}

async function generateArticleWithGemini(genAI, prompt, topicData) {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const candidateModels = [primaryModel, 'gemini-1.5-flash', 'gemini-2.0-flash-lite'].filter(Boolean);

  for (const modelName of candidateModels) {
    try {
      console.log(`Gemini APIに記事全文の生成を依頼中 (モデル: ${modelName}, responseMimeType: application/json)...`);
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

  console.warn('[Consultant風フォールバック] 全モデルエラーのためモック記事を出力します。');
  return generateArticleMock(topicData);
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

  const previousFeedback = topicData.lastFeedbackNotes || '';

  const prompt = `
あなたは「親が亡くなった後の実家整理」特化メディアのプロライターです。
以下のトピックに基づいて、読者が最高に見やすく、最短で「安心できる次の一歩」を得られる解説記事を生成してください。

【対象トピック】
- キーワード: ${topicData.keyword}
- 切り口/アングル: ${topicData.angle}
- カテゴリ: ${topicData.category || 'jikka-jimai'}
${previousFeedback ? `\n【前回の修正要求 (Feedback Notes)】\n${previousFeedback}\n上記修正要求を確実に反映してください。` : ''}

【UX・デザイン・コンプライアンス規則 (絶対遵守)】
1. 冒頭結論サマリー (summaryList): 冒頭3行で「この記事で分かること」「あなたの状況ならこうすべき」がひと目で分かる3つの要点箇条書き。
2. 構成: 1セクション＝1つのメッセージ。長文だけのブロックは避け、箇条書き、比較表 (Markdown Table)、引用枠 (> 💡) を多用する。
3. 信頼性・コンプライアンス厳守:
   - 「絶対」「100%」「即日対応」「しつこい営業電話一切なし」などの根拠のない断定や誇大広告、優良誤認表現は禁止。
   - 法律・税金・不動産名義変更に関する記述では、必ず「個別の判断は弁護士・税理士・司法書士等の有資格者や管轄行政窓口にご相談ください」という注意事項を本文中に含めること。
4. FAQ: 読者が不安に思いがちな2つの疑問とその明快な回答 (faqList)。
5. CTA誘導表現: 専門買取・一括査定・見積もり相談窓口への案内文言は「無料で相談・査定してみる」と統一表現する。

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

  const generatedArticle = await generateArticleWithGemini(genAI, prompt, topicData);

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
    createdAt: FieldValue.serverTimestamp(),
  };

  await articleRef.set(articleDataToSave);

  await db.collection('topics').doc(topicId).update({
    status: 'used',
  });

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
