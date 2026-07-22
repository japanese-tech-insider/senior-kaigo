import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { ArticleData } from './types';
import { siteConfig } from './site-config';

// 介護施設選びメディア用の初期モック記事（ペルソナ最適化済み）
export const INITIAL_ARTICLES: ArticleData[] = [
  {
    id: 'tokuyou-group-home-difference',
    slug: 'tokuyou-group-home-difference',
    title: '【認知症の親の施設選び】特養とグループホームどっちが良い？費用・手厚さ・入居条件を徹底比較',
    category: 'criteria',
    metaTitle: '認知症の親の施設選び｜特養とグループホームの違いと判断基準',
    metaDescription: '認知症が進行した親御さんの施設探しで迷う家族のために、公的施設である特別養護老人ホーム(特養)と専門ケアのグループホームの違いを費用・入居条件・手厚さで比較解説。',
    status: 'published',
    reviewIteration: 1,
    createdAt: '2026-07-01T09:00:00Z',
    publishedAt: '2026-07-01T10:00:00Z',
    readingTimeMinutes: 4,
    summaryList: [
      '要介護3以上で費用を最優先に抑えたい場合は、特別養護老人ホーム(特養)が第一候補になります。',
      '認知症の行動が目立ち、少人数でアットホームに見守ってほしい場合はグループホームが適しています。',
      '自力で悩む前に、ケアマネジャーへの相談や専門スタッフへの無料相談を活用するのが近道です。',
    ],
    faqList: [
      {
        question: 'グループホームに入るにはどのような条件が必要ですか？',
        answer: '医師による「認知症の診断」を受けていること、原則「要支援2以上」であること、および施設と同一の市区町村に住民票があることが条件です。',
      },
    ],
    body: `
## 1. 特養とグループホームの最大の違い
親御さんの認知症が進むと、在宅介護での見守りが難しくなり、安心できる施設を探す段階に入ります。代表的な2つの施設の特徴は以下の通りです。

- **特別養護老人ホーム(特養)** ＝ *公的で月額費用が安く抑えられ、終身利用できる施設（原則要介護3以上が対象）*
- **グループホーム** ＝ *5〜9人の少人数で専門スタッフのサポートを受けながら認知症ケアに特化して暮らす住まい*

---

## 2. 費用と手厚さの比較

| 比較項目 | 特別養護老人ホーム(特養) | 認知症対応型グループホーム |
| :--- | :--- | :--- |
| **月額費用目安** | 約8万〜15万円程度 | 約12万〜20万円程度 |
| **入居一時金** | 不要（0円） | 不要〜数十万円程度 |
| **対象の介護度** | 原則要介護3以上 | 要支援2 〜 要介護5 |
| **特徴** | 看護師の常駐など医療的ケアが手厚い | 少人数で家庭的な環境。環境変化が少ない |

---

## 3. 我が家に適した選び方の結論
要介護3以上で、かつ胃ろう等の医療的ケアが必要な場合は「特養」を最優先で検討してください。
一方で、お身体はある程度元気だが物忘れや徘徊があり、家庭的な雰囲気で穏やかに過ごさせたい場合は「グループホーム」が強く推奨されます。

> 💡 **焦って一人で決めないでください**
> 施設探しは膨大な選択肢があり、何社も直接問い合わせるのには大変な労力がかかります。無料相談窓口を賢く利用し、条件に合う施設をリストアップしてもらいましょう。
`,
  },
  {
    id: 'hospital-exit-facility-choice',
    slug: 'hospital-exit-facility-choice',
    title: '「退院が迫っている」と言われたら？病院から老人ホームを探す全手順と期限別の対処法',
    category: 'timing',
    metaTitle: '退院を迫られた時の老人ホームの探し方｜期限別の手順と一時入所',
    metaDescription: '入院中の親御さんの退院期限（リハビリ期限等）が迫り、次の老人ホームや施設を急ぎ探さなければならないご家族向けに、老健を活用した猶予期間の作り方や施設選定手順を解説。',
    status: 'published',
    reviewIteration: 1,
    createdAt: '2026-07-05T09:00:00Z',
    publishedAt: '2026-07-05T10:00:00Z',
    readingTimeMinutes: 3,
    summaryList: [
      '病院のソーシャルワーカーに相談し、リハビリ目的の「老健(一時的な公的施設)」への転院で時間的猶予を確保しましょう。',
      '退院期限までの短い時間で自力で探すのは困難なため、一括資料請求や無料施設紹介サービスを直ちに活用します。',
      '焦って契約せず、お身体の状況に合わせた民間有料ホームやサ高住の見学・体験入居を必ず行いましょう。',
    ],
    faqList: [
      {
        question: '病院から直接有料老人ホームへ入居することはできますか？',
        answer: 'はい、可能です。お身体の状況に応じて、医療的ケア（酸素吸入や胃ろう等）が必要な場合でも受け入れ可能な有料老人ホームを専門員を通じて迅速にマッチングできます。',
      },
    ],
    body: `
## 1. 退院期限を突きつけられた時の最初のステップ
病院から「来月までに退院してください」と言われると、大きな焦りを感じてしまいます。しかし、焦って不条理な施設を契約してはいけません。

まずは**病院の相談員（ソーシャルワーカー）**に連絡し、以下の点を確認します。
- 自宅復帰が本当に難しい理由の整理
- 次の行き先が決まるまで、同系列 of 療養病床や**老健(介護老人保健施設＝リハビリ復帰を目指す一時施設)**への中継が可能か

---

## 2. 期限までに最適な施設を見つける方法
ソーシャルワーカーに相談して少しの猶予を作ったら、並行して民間施設の検討を進めます。

1. **お身体の医療ニーズを整理**: 24時間看護師常駐が必要か、夜間のたん吸引が必要か等。
2. **無料のプロの紹介センターを活用**: 自力でネット検索して電話をする時間は足りません。条件を伝えるだけで当日〜翌日に候補を提示してくれる無料サービスが必須です。
3. **体験入所を依頼**: 急な転居で本人がパニックにならないよう、ショートステイ等を挟んで慣らすのも有効です。
`,
  },
];

// Firestore コレクション名の動的判定
const getArticlesCollectionName = () => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'kaigo';
  return siteId === 'kaigo' ? 'kaigo_articles' : 'articles';
};

export async function getArticles(): Promise<ArticleData[]> {
  try {
    const colName = getArticlesCollectionName();
    console.log(`[getArticles] Fetching from Firestore collection: ${colName}`);
    const articlesCol = collection(db, colName);
    const q = query(articlesCol, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    const articles: ArticleData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        topicId: data.topicId || '',
        slug: data.slug,
        title: data.title,
        category: data.category,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || '',
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || '',
        readingTimeMinutes: data.readingTimeMinutes || 4,
        summaryList: data.summaryList || [],
        faqList: data.faqList || [],
        body: data.body || '',
        reviewIteration: data.reviewIteration || 1,
      });
    });

    if (articles.length === 0) {
      console.log('[getArticles] Firestore is empty, falling back to INITIAL_ARTICLES');
      return INITIAL_ARTICLES;
    }

    // 最新公開順にソート
    return articles.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  } catch (err) {
    console.error('[getArticles] Firestore fetch failed, falling back to INITIAL_ARTICLES:', err);
    return INITIAL_ARTICLES;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleData | undefined> {
  try {
    const colName = getArticlesCollectionName();
    const articlesCol = collection(db, colName);
    const q = query(articlesCol, where('slug', '==', slug), where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        topicId: data.topicId || '',
        slug: data.slug,
        title: data.title,
        category: data.category,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || '',
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || '',
        readingTimeMinutes: data.readingTimeMinutes || 4,
        summaryList: data.summaryList || [],
        faqList: data.faqList || [],
        body: data.body || '',
        reviewIteration: data.reviewIteration || 1,
      };
    }
  } catch (err) {
    console.error(`[getArticleBySlug] Fetching slug ${slug} from Firestore failed:`, err);
  }

  // フォールバック
  const articles = INITIAL_ARTICLES;
  return articles.find((a) => a.slug === slug);
}

export async function getArticlesByCategory(categorySlug: string): Promise<ArticleData[]> {
  const articles = await getArticles();
  return articles.filter((a) => a.category === categorySlug);
}
