export interface CategoryConfig {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  iconName: string;
}

export interface SiteConfig {
  siteId: string;
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  themeColors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    bgLight: string;
    accentBg: string;
  };
  unifiedCTA: {
    buttonText: string;
    subText: string;
    badgeText: string;
    href: string;
  };
  categories: CategoryConfig[];
}

export const CURRENT_SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'kaigo';

export const KAIGO_SITE_CONFIG: SiteConfig = {
  siteId: 'kaigo',
  siteName: '親の介護施設えらびの相談室',
  siteTagline: '「今すぐ何をすればいい？」がすぐわかる、家族のための施設選び基準メディア',
  siteDescription: '親の認知症や体調悪化に直面した家族（45〜65歳）のための施設選び解説サイト。特別養護老人ホーム・有料老人ホーム・グループホームの違い、費用、家族の合意形成を平易に解説。',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://senior-kaigo.web.app',
  themeColors: {
    primary: '#E07A5F',       // Warm Peach/Coral
    primaryHover: '#D96B27',  // Deep Warm Peach
    secondary: '#81B29A',     // Calm Sage Green
    bgLight: '#FFFDF9',       // Warm Soft White
    accentBg: '#F4F1DE',      // Gentle Cream Accent
  },
  unifiedCTA: {
    buttonText: '無料で施設を探してもらう',
    subText: '希望のエリア・ご予算・お身体の状況に合わせた最適な施設をご案内',
    badgeText: '大手比較ポータル提携・相談完全無料',
    href: 'https://kaigo.lifull.net/',
  },
  categories: [
    {
      slug: 'criteria',
      name: '施設選びの判断基準',
      shortDescription: '親の介護度や認知症の症状から「何を選べばいいか」の明確な基準',
      description: 'たくさんの施設を比較して悩む前に、自分の親の身体状態や生活状況から真っ先に選ぶべき施設の種類と判断手順を提示します。',
      iconName: 'CheckSquare',
    },
    {
      slug: 'types',
      name: '施設の種類と違い',
      shortDescription: '特養・有料老人ホーム・グループホーム等の違いを平易に比較解説',
      description: '特別養護老人ホーム(特養)、有料老人ホーム、グループホーム、サ高住などの役割、受け入れ条件、サービスの違いを分かりやすく解説します。',
      iconName: 'Building2',
    },
    {
      slug: 'cost',
      name: '費用・お金の相談',
      shortDescription: '初期費用・月額費用・年金内で入れる施設と公的助成制度',
      description: '施設入居にかかる月額費用や一時金の目安、親の年金内で納める方法、高額介護サービス費などの負担軽減制度を詳しく解説します。',
      iconName: 'Coins',
    },
    {
      slug: 'timing',
      name: '入居のタイミング',
      shortDescription: '病院からの退院要請、認知症進行時、在宅介護限界の切り替え時期',
      description: '「まだ早いのでは」という罪悪感や迷いを解消し、親にとっても家族にとってもベストなタイミングで施設を検討する基準を教えます。',
      iconName: 'Clock',
    },
    {
      slug: 'family-agreement',
      name: '家族間の合意形成',
      shortDescription: '兄弟・親族との話し合い、本人の説得方法と罪悪感の乗り越え方',
      description: '介護施設への入居を巡る兄弟間の意見の対立や、本人が「施設に行きたくない」と言ったときの具体的な話し合いの進め方をまとめました。',
      iconName: 'Users',
    },
  ],
};

export const siteConfig: SiteConfig = KAIGO_SITE_CONFIG;
