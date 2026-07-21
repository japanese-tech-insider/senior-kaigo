export interface GlossaryItem {
  slug: string;
  term: string;
  reading: string;
  easyMeaning: string;
  summary: string;
  description: string;
  relatedCategorySlug: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    slug: 'tokuyou',
    term: '特別養護老人ホーム（特養）',
    reading: 'とくべつようごろうじんほーむ',
    easyMeaning: '公的な介護施設（比較的に費用が安く、終身で過ごせる場所）',
    summary: '社会福祉法人や自治体が運営する公的施設。費用が安く抑えられ、終身利用も可能ですが、入居には「原則要介護3以上」が必要です。',
    description: '特養（とくよう）は、自力での生活が困難な要介護高齢者のための公的介護施設です。入居時一時金が不要で、月額費用も民間施設より抑えられるため人気が高く、地域によっては待機者（順番待ち）が発生します。',
    relatedCategorySlug: 'types',
  },
  {
    slug: 'yuuryou-roujin-home',
    term: '有料老人ホーム',
    reading: 'ゆうりょうろうじんほーむ',
    easyMeaning: '民間企業が運営する手厚い介護・生活ケアつき老人ホーム',
    summary: '民間企業が運営し、介護付き・住宅型・健康型の3タイプがあります。充実した介護サービスや医療連携、快適な設備が魅力です。',
    description: '有料老人ホームは民間企業が運営する施設で、要支援から要介護5まで幅広く受入が可能です。24時間看護師常駐の施設やリハビリ設備が充実した施設など選択肢が豊富ですが、初期費用や月額費用は特養より高めになる傾向があります。',
    relatedCategorySlug: 'types',
  },
  {
    slug: 'group-home',
    term: 'グループホーム（認知症対応型）',
    reading: 'ぐるーぷほーむ',
    easyMeaning: '認知症の方が少人数で共同生活をしながら専門ケアを受ける施設',
    summary: '1グループ5〜9名の少人数ユニットで、専門スタッフのサポートを受けながら穏やかに生活する認知症専用の住まいです。',
    description: '認知症の診断を受けた高齢者が、家事などを分担しながらアットホームな環境で暮らす施設です。環境の変化に弱い認知症の方でも、顔なじみのスタッフと穏やかな時間を過ごせる点が大きなメリットです（入居条件に同一市区町村の住民票が必要です）。',
    relatedCategorySlug: 'types',
  },
  {
    slug: 'sakouju',
    term: 'サ高住（サービス付き高齢者向け住宅）',
    reading: 'さーびすすきこうれいしゃむけじゅうたく',
    easyMeaning: '安否確認・生活相談サービスがついたバリアフリー賃貸住宅',
    summary: '自立〜軽度の要介護者が対象。バリアフリー設計で専門スタッフによる見守り・生活相談が受けられる高齢者向けの賃貸マンションです。',
    description: 'サ高住（さこうじゅ）は、一般的な賃貸住宅に近い自由な暮らしを維持しつつ、安否確認や緊急時対応などの見守りサービスを受けられる住まいです。必要に応じて外部の訪問介護サービスなどを組み合わせて利用します。',
    relatedCategorySlug: 'types',
  },
  {
    slug: 'rouken',
    term: '老健（介護老人保健施設）',
    reading: 'ろうけん',
    easyMeaning: '退院後にリハビリをして自宅復帰を目指すための一時的な施設',
    summary: '医療・リハビリに特化した施設。原則3〜6ヶ月程度の短期滞在で、自宅復帰や他の施設へ移るまでの準備期間として利用します。',
    description: '老健（ろうけん）は、病院を退院した後に直接自宅へ戻るのが難しい場合、医師や作業療法士のもとでリハビリを行い身体機能を回復させる施設です。ずっと暮らし続ける終身利用の施設ではない点に注意が必要です。',
    relatedCategorySlug: 'timing',
  },
  {
    slug: 'youkaigodo',
    term: '要介護度（要支援1〜2 / 要介護1〜5）',
    reading: 'ようかいごど',
    easyMeaning: '国が定める「介護がどれくらい必要か」の7段階のレベル',
    summary: '自治体の認定調査で決まる介護の必要度。入居できる施設の種類や受けられる公的サービスの給付限度額の基準になります。',
    description: '要介護度は、介護の手間を客観的に示す指標です。軽い順に「要支援1・2」「要介護1〜5」の全7段階に分けられます。特養の入居には原則「要介護3以上」が必要など、施設探しの最も基本となる条件です。',
    relatedCategorySlug: 'criteria',
  },
  {
    slug: 'unit-gata',
    term: 'ユニット型（個室）',
    reading: 'ゆにっとがた',
    easyMeaning: '10人前後のグループごとに個室と専用リビングが用意された部屋タイプ',
    summary: '従来の多床室（4人部屋等）と異なり、個室でプライバシーが保たれ、少人数グループで一人ひとりに寄り添ったケアが受けられます。',
    description: 'ユニット型は、10人程度の入居者を1つの「ユニット」として位置づけ、専用の共有リビングと個室が用意された形態です。プライバシーが確保できる反面、従来型の相部屋よりも居室料や居住費が高くなる傾向があります。',
    relatedCategorySlug: 'criteria',
  },
];

export function getGlossaryBySlug(slug: string): GlossaryItem | undefined {
  return GLOSSARY_ITEMS.find((item) => item.slug === slug);
}
