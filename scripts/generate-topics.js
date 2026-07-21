/**
 * Job 1: generate-topics
 * 毎日朝6時(JST)に実行
 * 
 * consultant プロジェクトを参考に構造化JSON指定 (responseMimeType: application/json)
 * および堅牢なモックフォールバック機構を実装
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

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

// consultant方式：万が一APIエラー(429等)が発生した場合のモック用トピックライブラリ
const MOCK_TOPICS = [
  { keyword: '実家整理 費用 相場', angle: '45歳以上で兄弟間トラブルなく実家整理費用を分担・抑える手順', category: 'jikka-jimai' },
  { keyword: '空き家 放置 固定資産税 6倍', angle: '特定空き家指定による減額解除リスクと事前の現状査定対策', category: 'akiya' },
  { keyword: '実家 解体費用 30坪 木造', angle: '構造別解体坪単価と自治体の老朽危険家屋補助金活用術', category: 'kaitai' },
  { keyword: '遺品整理 業者 相場 間取り', angle: '部屋別費用相場と高価買取査定を併用した費用相殺テクニック', category: 'ihin-seiri' },
  { keyword: '相続登記 義務化 実家売却', angle: '親の名義のままの実家をスムーズに名義変更し売却する流れ', category: 'souzoku' },
];

async function generateTopicsWithGemini(genAI, prompt) {
  try {
    console.log('Gemini APIにトピック候補の生成をリクエスト中...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    return JSON.parse(responseText);
  } catch (err) {
    console.warn(`[Consultant風フォールバック] Gemini APIエラー (${err.message})。モックトピックを使用します。`);
    return MOCK_TOPICS;
  }
}

async function main() {
  console.log('=== [Job 1] generate-topics 開始 ===');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 GEMINI_API_KEY がセットされていません。');
  }

  const db = initFirebaseAdmin();
  const genAI = new GoogleGenerativeAI(apiKey);

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
`;

  const generatedTopics = await generateTopicsWithGemini(genAI, prompt);
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
