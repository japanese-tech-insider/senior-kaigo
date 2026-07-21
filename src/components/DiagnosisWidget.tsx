'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles, HeartHandshake } from 'lucide-react';
import { UnifiedCTA } from './UnifiedCTA';
import { siteConfig } from '@/lib/site-config';

interface Option {
  id: string;
  label: string;
  subText?: string;
}

interface Question {
  id: number;
  title: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Q1. 親御さんの現在の生活・身体状況は？',
    options: [
      { id: 'dementia_limit', label: '認知症の症状があり一人暮らしが限界', subText: '物忘れ・徘徊・火の不始末などが心配' },
      { id: 'hospital_exit', label: '病院に入院中で早期の退院を迫られている', subText: 'リハビリ期限が迫り次の行き先を探したい' },
      { id: 'sudden_decline', label: '急な体調悪化で自力生活が難しくなった', subText: '起き上がりや入浴・トイレに介助が必要' },
      { id: 'family_burnout', label: '在宅介護を続けているが家族が限界', subText: '仕事や家事との両立で体力的・精神的に疲れ果てている' },
    ],
  },
  {
    id: 2,
    title: 'Q2. 今一番心配・迷っていることは？',
    options: [
      { id: 'type_choice', label: '特養・有料・グループホーム等の違いが分からない', subText: 'うちの親にはどの種類の施設が合うか知りたい' },
      { id: 'cost_worry', label: '毎月の費用や一時金がいくらかかるか不安', subText: '親の年金内で入れるか・安く抑える方法を知りたい' },
      { id: 'family_conflict', label: '兄弟・親族間での意見の対立や本人の拒否', subText: '「まだ早い」「可哀想」と言われ話し合いが進まない' },
    ],
  },
  {
    id: 3,
    title: 'Q3. お父様・お母様の要介護度はどのくらい？',
    options: [
      { id: 'care_high', label: '要介護3〜5 (常時介護が必要・車椅子など)', subText: '特養の入居要件をクリアしている状態' },
      { id: 'care_mid', label: '要介護1〜2 (一部介助・見守りが必要)', subText: '有料老人ホームやサ高住などが主な対象' },
      { id: 'care_unknown', label: '要支援・まだ申請していない・分からない', subText: 'まずは要介護認定の申請からスタート' },
    ],
  },
];

interface RecommendationResult {
  title: string;
  conclusion: string;
  steps: string[];
  recommendedArticleSlug: string;
  recommendedArticleTitle: string;
  ctaText: string;
}

export const DiagnosisWidget: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const handleSelectOption = (questionId: number, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans: Record<number, string>) => {
    const q1 = ans[1];
    const q2 = ans[2];
    const q3 = ans[3];

    if (q1 === 'hospital_exit') {
      setResult({
        title: '【退院期限でお悩みの方】老健で一時復帰しつつ、無料施設探しで同時並行がベスト！',
        conclusion: '病院の退院要請に焦って妥協した施設を選ばないよう注意が必要です。まずはリハビリ目的の「老健(介護老人保健施設)」で3ヶ月つなぎつつ、条件に合う有料老人ホームや特養を同時に探し始めましょう。',
        steps: [
          '1. 病院のソーシャルワーカーに「老健への一時入所」を相談する',
          '2. 専門の無料相談サービスで希望エリア・予算に合う施設リストを取り寄せる',
          '3. 見学・体験入所を行い、親本人の様子に合うか確かめる',
        ],
        recommendedArticleSlug: 'hospital-exit-facility-choice',
        recommendedArticleTitle: '「退院が迫っている」と言われたら？病院から老人ホームを探す全手順と期限別の対処法',
        ctaText: '無料で条件に合う施設を探してもらう',
      });
    } else if (q1 === 'dementia_limit' || q3 === 'care_high') {
      setResult({
        title: '【認知症・要介護3以上】費用を抑える「特養」または専門ケアの「グループホーム」が第一候補！',
        conclusion: '要介護3以上であれば、最も公的助成が厚く安価な「特別養護老人ホーム(特養)」の入居対象となります。認知症の行動が目立つ場合は、9人の少人数で手厚く見守る「グループホーム」も非常に有力な選択肢です。',
        steps: [
          '1. ケアマネジャーに特養の入居申込（待機登録）を早めに出す',
          '2. 地域の「認知症対応型グループホーム」の空き状況を確認する',
          '3. 入居待ちの間の在宅ショートステイや民間有料老人ホームを併用検討する',
        ],
        recommendedArticleSlug: 'tokuyou-group-home-difference',
        recommendedArticleTitle: '【認知症の親の施設選び】特養とグループホームどっちが良い？費用・手厚さ・入居条件を徹底比較',
        ctaText: '無料で認知症対応の施設を探してもらう',
      });
    } else if (q2 === 'cost_worry') {
      setResult({
        title: '【費用面・年金でお悩みの方】「高額介護サービス費制度」の活用と年金内施設を限定検索！',
        conclusion: '親の年金月額（例：月10〜15万円）の範囲内で収まる施設は存在します。入居一時金0円の民間有料ホームやサ高住、公的助成（高額介護サービス費制度・特定入所者介護サービス費）を上限まで活用しましょう。',
        steps: [
          '1. 親の「年金受給額」と「預貯金」の正確な上限額を把握する',
          '2. 居住地・近隣エリアで「月額15万円以下・一時金0円」の施設を検索する',
          '3. 自治体に負担限度額認定（食費・居住費の軽減制度）を申請する',
        ],
        recommendedArticleSlug: 'nenkin-dake-facility-cost',
        recommendedArticleTitle: '親の年金だけで老人ホームに入れる？費用を月10万円前後に抑える公的制度と施設選び',
        ctaText: '予算に合う無料の施設を探してもらう',
      });
    } else if (q2 === 'family_conflict') {
      setResult({
        title: '【兄弟・家族の意見対立】第三者（ケアマネ・専門員）を交えた客観的判断が解決の鍵！',
        conclusion: '「介護している長男/長女」と「遠方に住む兄弟」で認識がズレるのは自然なことです。家族だけで話し合わず、ケアマネジャーの判定やプロの無料提案資料を家族全員に共有して話し合いを進めましょう。',
        steps: [
          '1. 家族の感情論ではなく「ケアマネの判定」と「具体的費用」を数字で提示する',
          '2. プロから取り寄せた「おすすめ施設パンフレット」を兄弟に郵送・共有する',
          '3. まずは体験入居（ショートステイ）から段階的に試してもらう',
        ],
        recommendedArticleSlug: 'family-agreement-kyoudai-tairitsu',
        recommendedArticleTitle: '「兄弟と意見が合わない」親の介護施設選びで揉めないための説得テクニックと役割分担',
        ctaText: '家族で共有できる無料資料を取り寄せる',
      });
    } else {
      setResult({
        title: '【まず基礎から確認】親の身体状態にピッタリの「安心施設選び診断」が完了しました！',
        conclusion: '焦って決めず、まずは親の身体状況（要介護度）に合わせた施設の種類を知ることが、後悔しない施設選びの第一歩です。',
        steps: [
          '1. お近くの地域包括支援センターで「要介護認定」の手続きをする',
          '2. 特養・有料・サ高住など各施設の特徴を理解する',
          '3. 専門スタッフの無料カウンセリングで候補を絞り込む',
        ],
        recommendedArticleSlug: 'kaigo-facility-type-guide',
        recommendedArticleTitle: '【初心者向け】老人ホーム全7種類の特徴・費用・入居条件をわかりやすく図解比較',
        ctaText: '無料で条件に合う施設を探してもらう',
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#E07A5F]/40 rounded-3xl p-5 md:p-8 shadow-md my-6">
      <div className="flex items-center gap-2 text-[#C85A32] font-bold text-sm md:text-base mb-2">
        <Sparkles className="w-5 h-5 text-[#E07A5F]" />
        <span>たった3問・選択するだけ（匿名・無料）</span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-snug">
        親の状況に合わせた「後悔しない施設選び」診断クイズ
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        「選択肢が多すぎて決められない」「今すぐ何をすればいいか知りたい」という方に。当てはまる選択肢をタップするだけで
        <strong className="text-[#C85A32] font-bold">我が家に最適な答えとおすすめ手順</strong>がすぐ分かります。
      </p>

      {/* 診断結果表示 */}
      {result ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E07A5F] shadow-sm animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 bg-[#E07A5F] text-white text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>診断結果が出ました</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-[#7c2d12] mb-3 leading-snug">
            {result.title}
          </h3>

          <div className="bg-[#FDF8F5] rounded-2xl p-4 md:p-5 mb-5 border border-orange-200">
            <h4 className="font-bold text-[#C85A32] text-sm md:text-base mb-1.5 flex items-center gap-1.5">
              <HeartHandshake className="w-5 h-5" />
              <span>親御さんの状況に応じた最適アドバイス</span>
            </h4>
            <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-4">
              {result.conclusion}
            </p>
            <div className="border-t border-orange-200 pt-3">
              <span className="text-xs font-bold text-[#C85A32] block mb-2">【まずやるべき3ステップ】</span>
              <ul className="space-y-2 text-sm md:text-base text-gray-800 font-medium">
                {result.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#E07A5F] font-bold">✔</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-6 p-4 bg-orange-50/60 rounded-xl border border-orange-200">
            <span className="text-xs text-[#C85A32] font-bold block mb-1">
              📖 あなたの悩みに直結するおすすめ解説記事
            </span>
            <Link
              href={`/articles/${result.recommendedArticleSlug}`}
              className="text-base md:text-lg font-bold text-[#7c2d12] hover:underline flex items-center justify-between gap-2 group"
            >
              <span>{result.recommendedArticleTitle}</span>
              <ArrowRight className="w-5 h-5 shrink-0 text-[#E07A5F] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <UnifiedCTA title="診断結果に合わせて条件に合う施設を専門スタッフに探してもらう" buttonText={result.ctaText} />

          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>もう一度最初から選択し直す</span>
            </button>
          </div>
        </div>
      ) : (
        /* 質問フォーム */
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-orange-100 rounded-full h-3 mb-6">
            <div
              className="bg-[#E07A5F] h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          <div className="mb-4 text-xs font-bold text-[#C85A32] uppercase tracking-wider">
            質問 {currentStep + 1} / 全 {QUESTIONS.length} 問
          </div>

          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            {QUESTIONS[currentStep].title}
          </h3>

          <div className="space-y-3">
            {QUESTIONS[currentStep].options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(QUESTIONS[currentStep].id, opt.id)}
                className="w-full text-left p-4 rounded-2xl border-2 border-orange-100 bg-white hover:border-[#E07A5F] hover:bg-[#FDF8F5] active:bg-orange-100 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="text-base md:text-lg font-bold text-gray-900 group-hover:text-[#7c2d12]">
                    {opt.label}
                  </div>
                  {opt.subText && (
                    <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                      {opt.subText}
                    </div>
                  )}
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#E07A5F] group-hover:bg-[#E07A5F] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100"></div>
                </div>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="mt-4 text-left">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                ← 前の質問に戻る
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
