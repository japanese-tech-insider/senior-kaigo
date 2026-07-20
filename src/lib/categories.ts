export interface Category {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  iconName: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'jikka-jimai',
    name: '実家じまいの進め方',
    shortDescription: '全体の手順やスケジュール、後回しにしないための基礎知識',
    description: '親が亡くなった直後や介護後の混乱した状態で、何から手をつけるべきかを段階別に分かりやすく解説します。',
    iconName: 'ClipboardList',
  },
  {
    slug: 'akiya',
    name: '空き家の管理・売却',
    shortDescription: '放置するリスクや固定資産税、売却・譲渡の手引き',
    description: '誰も住まなくなった実家を放置した場合の税金リスクや、売却・特例控除の活用方法を解説します。',
    iconName: 'Home',
  },
  {
    slug: 'kaitai',
    name: '解体費用・手引き',
    shortDescription: '木造・鉄骨の解体費用相場や補助金、失敗しない解体業者の選び方',
    description: '家屋を解体する場合の平均費用や相場、自治体の助成金制度、業者比較の注意点をまとめています。',
    iconName: 'Hammer',
  },
  {
    slug: 'ihin-seiri',
    name: '遺品整理のコツ・相場',
    shortDescription: '自分で整理する方法と遺品整理業者の相場・費用抑え方',
    description: '大量の荷物を家族で分担して整理するステップと、プロの業者に依頼する場合の費用目安を提示します。',
    iconName: 'Package',
  },
  {
    slug: 'souzoku',
    name: '相続手続きとの関係',
    shortDescription: '名義変更・名義変更前の整理・相続放棄の注意点',
    description: '実家の片付けや売却を進める上で切っても切り離せない「名義変更」や「相続手続き」の基本ルールを明快に解説します。',
    iconName: 'FileText',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}
