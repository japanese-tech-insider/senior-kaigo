/**
 * Job 1: generate-topics
 * 毎日朝6時(JST)に実行
 * 
 * 1. 直近30日間の使用済みキーワードを Firestore から取得
 * 2. Gemini API を使用して、重ならない新しいトピック（キーワード・切り口）を複数生成
 * 3. Firestore topics コレクションに status: "unused" で書き込み
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Firebase Admin 初期化
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

async function main() {
  console.log('=== [Job 1] generate-topics 開始 ===');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 GEMINI_API_KEY がセットされていません。');
  }

  const db = initFirebaseAdmin();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 利用可能なモデルをフォールバック付きで指定
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.log(`使用モデル: ${modelName}`);
  
  let model;
  try {
    model = genAI.getGenerativeModel({ model: modelName });
  } catch (e) {
    console.log(`モデル ${modelName} の初期化失敗、gemini-2.0-flash を試行します...`);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  // 1. 直近30日分のキーワードを取得して重複防止
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingTopicsSnapshot = await db.collection('topics')
    .where('createdAt', '>=', thirtyDaysAgo)
    .get();

  const usedKeywords = [];
  existingTopicsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.keyword) usedKeywords.push(data.keyword);
  });

  console.log(`直近30日間の登録済みキーワード (${usedKeywords.length}件):`, usedKeywords);

  // 2. Gemini API用プロンプト構築
  const prompt = `
あなたは「親が亡くなった後の実家整理」に特化したSEO専門メディアのコンテンツプロデューサーです。

【ペルソナ情報】
- ターゲット年齢: 45〜65歳 (スマホ閲覧メイン)
- 心理状態: 親の突然の不幸や介護で疲弊しており、時間的精神的ゆとりがない。
- ニーズ: 「自分の状況で今すぐ何をすべきか」の短く安心できる結論と具体的アドバイスを求めている。

【禁止事項・避けるべき切り口】
- 医療や法的決定に関する過度で断定的な助言 (弁護士や司法書士への相談を促す形にする)
- 読者の不安を煽り立てる扇動的な表現や過激な見出し

【既に過去30日間で使用されたキーワード一覧 (重複厳禁)】
${usedKeywords.length > 0 ? usedKeywords.join(', ') : 'なし'}

【指示】
上記ペルソナの悩みに合致し、検索ボリュームが見込める実家整理・空き家売却・解体費用・遺品整理・相続関係の「新しいトピック（キーワードと記事の切り口）」を5件、以下のJSON配列フォーマット厳守で生成してください。

[JSON出力フォーマット]
[
  {
    "keyword": "実家整理 費用 相場",
    "angle": "45歳以上で兄弟間トラブルなく実家整理費用を分担・安く抑えるコツ",
    "category": "jikka-jimai"
  }
]
※余計な挨拶やMarkdown解説コードブロックは含めず、純粋なJSON配列のみを出力してください。
`;

  console.log('Gemini APIにトピック候補の生成をリクエスト中...');
  
  let responseText;
  try {
    const result = await model.generateContent(prompt);
    responseText = result.response.text().trim();
  } catch (err) {
    console.warn(`モデル ${modelName} でのエラー、gemini-2.0-flash にて再リトライ...`, err.message);
    const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await fallbackModel.generateContent(prompt);
    responseText = result.response.text().trim();
  }

  // JSONパース
  let rawJson = responseText;
  if (rawJson.startsWith('```json')) {
    rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const generatedTopics = JSON.parse(rawJson);
  console.log(`生成されたトピック数: ${generatedTopics.length}件`);

  // 3. Firestore に保存
  const batch = db.batch();
  for (const topic of generatedTopics) {
    const docRef = db.collection('topics').doc();
    batch.set(docRef, {
      keyword: topic.keyword,
      angle: topic.angle,
      category: topic.category || 'jikka-jimai',
      status: 'unused',
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log('=== [Job 1] generate-topics 完了 (Firestoreに保存完了) ===');
}

main().catch((err) => {
  console.error('Job 1 エラー発生:', err);
  process.exit(1);
});
