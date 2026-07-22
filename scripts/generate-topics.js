/**
 * Job 1: generate-topics
 * 毎日朝6時(JST)に実行
 * 「親の介護施設選び」特化メディア用トピック生成
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'kaigo';
const topicsCollection = siteId === 'kaigo' ? 'kaigo_topics' : 'topics';

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

const MOCK_TOPICS = [
  { keyword: '親 施設選び 認知症 判断基準', angle: '認知症進行時の要介護度と特養・グループホームの選択基準', category: 'criteria' },
  { keyword: '特養 有料老人ホーム 違い 費用', angle: '特別養護老人ホームと民間有料ホームの費用・手厚さ・入居待ち比較', category: 'types' },
  { keyword: '親 老人ホーム 費用 年金内', angle: '親の年金内で納める月額費用の抑え方と公的助成制度の活用', category: 'cost' },
  { keyword: '病院 退院迫る 老人ホーム 探し方', angle: '退院期限が迫った時の老健一時入所と急ぎの施設選び手順', category: 'timing' },
  { keyword: '親 施設入居 兄弟 対立 説得', angle: '介護施設選びで兄弟と意見が合わない時の話し合いと説得テクニック', category: 'family-agreement' },
];

async function generateTopicsWithGemini(genAI, prompt) {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const candidateModels = [primaryModel, 'gemini-1.5-flash', 'gemini-2.0-flash-lite'].filter(Boolean);

  for (const modelName of candidateModels) {
    try {
      console.log(`Gemini APIにトピック候補の生成をリクエスト中 (モデル: ${modelName})...`);
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

  console.warn('[フォールバック] 全モデルエラーのためモックトピックを出力します。');
  return MOCK_TOPICS;
}

async function main() {
  console.log(`=== [Job 1] generate-topics 開始 (SiteID: ${siteId}, Collection: ${topicsCollection}) ===`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 GEMINI_API_KEY がセットされていません。');
  }

  const db = initFirebaseAdmin();
  const genAI = new GoogleGenerativeAI(apiKey);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingTopicsSnapshot = await db.collection(topicsCollection)
    .where('createdAt', '>=', thirtyDaysAgo)
    .get();

  const usedKeywords = [];
  existingTopicsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.keyword) usedKeywords.push(data.keyword);
  });

  console.log(`直近30日間の登録済みキーワード (${usedKeywords.length}件):`, usedKeywords);

  const prompt = `
あなたは「親の介護施設選び」に特化したSEO専門メディアのコンテンツプロデューサーです。

【ペルソナ情報】
- ターゲット年齢: 45〜65歳 (介護をしている本人、または遠方に住む子世代。スマホ閲覧メイン)
- ITリテラシー: 中〜低。専門用語（特養、要介護度、ユニット型など）に馴染みがない。
- 心理状態: 親の認知症や体調悪化に直面し、焦りと罪悪感を抱えている。冷静に比較検討する余裕がなく、「今すぐ何をすればいいか」だけを知りたい。
- 求めているもの: 一覧比較ではなく、「自分の親の状況なら何を選べばいいか」の明確な判断基準。家族間（特に兄弟間）の意見の対立に悩んでいる。

【禁止事項・避けるべき切り口 (厳守)】
- 医療的な断定的助言 (例: 「〇〇の症状なら絶対〇〇病」など。必ず主治医やケアマネへの相談を前提とする)
- 施設の実名での評判・個別評価・批判 (特定の個別施設名を挙げての比較評価は絶対に行わない)
- 読者の不安を煽り立てる扇動的な表現や過激な見出し

【カテゴリ一覧 (下記5個のslugのいずれかを必ず選択)】
1. criteria (施設選びの判断基準)
2. types (施設の種類と違い)
3. cost (費用・お金)
4. timing (入居のタイミング)
5. family-agreement (家族間の合意形成)

【過去30日間で使用されたキーワード一覧 (重複厳禁)】
${usedKeywords.length > 0 ? usedKeywords.join(', ') : 'なし'}

【出力形式】
JSON配列で5件のトピック候補を出力してください。各要素は以下のオブジェクト構造にしてください:
[
  {
    "keyword": "検索キーワード (例: 認知症 親 老人ホーム 選び方)",
    "angle": "読者が抱く焦りや罪悪感を解消する切り口・提案内容",
    "category": "上記5つのslugのいずれか"
  }
]
`;

  let newTopics = await generateTopicsWithGemini(genAI, prompt);

  if (!Array.isArray(newTopics) || newTopics.length === 0) {
    console.warn('トピックが正常に取得できなかったためモックを使用します。');
    newTopics = MOCK_TOPICS;
  }

  console.log(`生成されたトピック数: ${newTopics.length}件`);

  let addedCount = 0;
  for (const item of newTopics) {
    if (!item.keyword || !item.category) continue;

    const querySnapshot = await db.collection(topicsCollection)
      .where('keyword', '==', item.keyword)
      .get();

    if (querySnapshot.empty) {
      await db.collection(topicsCollection).add({
        keyword: item.keyword,
        angle: item.angle || '',
        category: item.category,
        status: 'unused',
        createdAt: new Date(),
      });
      console.log(`[追加] トピック: ${item.keyword} (カテゴリ: ${item.category})`);
      addedCount++;
    } else {
      console.log(`[重複スキップ] トピック: ${item.keyword}`);
    }
  }

  console.log(`=== [Job 1] 完了: 新規 ${addedCount}件のトピックをFirestoreの ${topicsCollection} に保存しました ===`);
}

main().catch((err) => {
  console.error('Job 1 エラー:', err);
  process.exit(1);
});
