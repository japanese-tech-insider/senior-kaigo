export interface GlossaryItem {
  slug: string;
  term: string;
  reading: string;
  summary: string;
  description: string;
  relatedCategorySlug: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    slug: 'tokutei-akiya',
    term: '特定空き家',
    reading: 'とくていあきや',
    summary: '放置すると危険・有害と判断された空き家。指定されると固定資産税の軽減措置（最大1/6）が解除されます。',
    description: '倒壊の危険性や衛生上の害がある空き家に対して自治体が指定します。指定を受けると固定資産税の減額特例が適用されなくなり、負担が実質6倍に跳ね上がるリスクがあります。',
    relatedCategorySlug: 'akiya',
  },
  {
    slug: 'ihin-seirishi',
    term: '遺品整理士',
    reading: 'いひんせいりし',
    summary: '遺品整理の取り扱いや法令知識を持つ民間資格保有者。悪質業者を見極める指標の一つです。',
    description: '一般社団法人遺品整理士認定協会が認定する資格。不用品回収におけるトラブルを避けるため、見積もり時に在籍有無を確認することが推奨されます。',
    relatedCategorySlug: 'ihin-seiri',
  },
  {
    slug: '3000man-koujo',
    term: '空き家の3,000万円特別控除',
    reading: 'さんせんまんえんとくべつこうじょ',
    summary: '相続した空き家を売却した際、譲渡所得から最高3,000万円まで控除できる税制特例。',
    description: '昭和56年5月31日以前に建築された旧耐震基準の戸建て住宅を相続し、耐震リフォームまたは解体後に売却した場合に適用できます。',
    relatedCategorySlug: 'souzoku',
  },
  {
    slug: 'choukyou-todokede',
    term: '滅失登記 (建物滅失登記)',
    reading: 'めっしつとうき',
    summary: '家屋を解体した後に登記簿を閉鎖する手続き。解体完了から1ヶ月以内に行う必要があります。',
    description: '建物を壊した際、法務局で手続きを行わないと固定資産税の計算に誤りが生じたり、土地売却が進まなくなったりします。土地家屋調査士に依頼するか自分で行います。',
    relatedCategorySlug: 'kaitai',
  },
  {
    slug: 'souzoku-touki-gedamukai',
    term: '相続登記の義務化',
    reading: 'そうぞくとうきのお義務か',
    summary: '不動産を取得したことを知った日から3年以内に登記を行わなければ過料が発生する制度。',
    description: '2024年4月から施行された改正法。実家を売却・解体する前にも、まず親から相続人への名義変更（相続登記）が必須となります。',
    relatedCategorySlug: 'souzoku',
  },
];

export function getGlossaryBySlug(slug: string): GlossaryItem | undefined {
  return GLOSSARY_ITEMS.find((item) => item.slug === slug);
}
