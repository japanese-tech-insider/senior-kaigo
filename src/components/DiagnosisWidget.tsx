'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, RotateCcw, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { UnifiedCTA } from './UnifiedCTA';

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
    title: 'Q1. 現在の実家のお悩み・時期は？',
    options: [
      { id: 'just_passed', label: '親が亡くなった直後・四十九日前', subText: '何をどの順番でやるべきか分からない' },
      { id: 'empty_home', label: 'すでに空き家で放置中', subText: '固定資産税や崩壊のリスクが気になる' },
      { id: 'too_much_stuff', label: '家具や荷物が多すぎる', subText: '自分たちだけでは片付けが終わらない' },
      { id: 'inherited', label: '売却か解体か迷っている', subText: '費用相場や名義変更について知りたい' },
    ],
  },
  {
    id: 2,
    title: 'Q2. あなたの実家までの距離は？',
    options: [
      { id: 'near', label: '車や電車で30分以内', subText: '比較的通いやすい' },
      { id: 'far', label: '新幹線・飛行機・1時間以上', subText: '仕事や生活があり頻繁には行けない' },
    ],
  },
  {
    id: 3,
    title: 'Q3. 今一番求めている解決策は？',
    options: [
      { id: 'speed', label: '短期間・手間なしでスッキリ解決したい', subText: '鍵の受け渡しのみ・立ち会い最小限' },
      { id: 'cost', label: 'なるべく費用を安く抑えたい・買取してほしい', subText: '相見積もりや売却費用と相殺したい' },
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
      // 3ステップ完了後のロジック分岐
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans: Record<number, string>) => {
    const q1 = ans[1];
    const q2 = ans[2];

    if (q1 === 'just_passed') {
      setResult({
        title: '【緊急診断】まず通帳・重要書類を確保し、四十九日後にプロへ一括相談がベスト！',
        conclusion: '焦って家具を捨てず、まずは書類整理と公共料金の手続きだけ行いましょう。遠方または時間が取れない場合は一社ずつの交渉を避け、まとめて無料比較するのが最善です。',
        steps: [
          '1. 通帳・権利証・遺言書の有無を優先して確認する',
          '2. 電気・水道は契約を残し、固定電話や新聞を解約する',
          '3. 不用品処分と見積もりは無料の一括相談を活用する',
        ],
        recommendedArticleSlug: 'jikka-seiri-first-step',
        recommendedArticleTitle: '親が亡くなった直後の実家整理「何から始める？」後回しにしない順番と全手順',
        ctaText: '無料で優良業者の一括見積もりを試す',
      });
    } else if (q1 === 'empty_home') {
      setResult({
        title: '【空き家放置対策】特定空き家による税金増額を防ぐ「現状無料査定」が最適！',
        conclusion: '放置は固定資産税が最大6倍になる大リスク。解体するか現状のまま売却するかを判断するため、まずは一度現状査定・相談を行いましょう。',
        steps: [
          '1. 実家の維持費用（毎年の税金・草刈代）を把握する',
          '2. 現状での買取金額と解体費用の見積もりを取得する',
          '3. 特例控除（3,000万円控除）が使える3年以内に売却・譲渡する',
        ],
        recommendedArticleSlug: 'akiya-houchi-tax-risk',
        recommendedArticleTitle: '誰も住まない実家を放置すると固定資産税が6倍に？「特定空き家」のリスクと回避策',
        ctaText: '無料で空き家の買取・解体一括見積もりを試す',
      });
    } else if (q1 === 'too_much_stuff' || q2 === 'far') {
      setResult({
        title: '【遺品整理・家財処分】遠方・荷物多数ならプロの買取・一括一元清掃が最適！',
        conclusion: '自力で数ヶ月通うよりも、プロの遺品整理士に丸投げする方が交通費と負担を削減できます。買取り対応業者なら作業代金を相殺できます。',
        steps: [
          '1. 家族で「絶対に残したい形見」だけを先にピックアップ',
          '2. 不用品処分と同時に買取できる業者に見積もりを依頼',
          '3. 1日の立ち会いのみで実家丸ごとスッキリ清掃を完了させる',
        ],
        recommendedArticleSlug: 'ihin-seiri-cost-saving',
        recommendedArticleTitle: '遺品整理業者に頼むといくらかかる？部屋の間取り別相場と悪質業者を避けるポイント',
        ctaText: '無料で遺品整理の概算一括見積もりを試す',
      });
    } else {
      setResult({
        title: '【売却・解体総合】相続登記を済ませつつ、解体・売却の相見積もりを比較！',
        conclusion: '親の名義のままでは契約できません。司法書士や仲介業者への相談と並行して、解体費用と更地売却代金のシミュレーションを行いましょう。',
        steps: [
          '1. 相続登記（名義変更）の手続きを進める',
          '2. 木造・鉄骨の解体費用相場を比較見積もりで調べる',
          '3. 不動産会社に土地・建物の現状価値を算出してもらう',
        ],
        recommendedArticleSlug: 'kaitai-hiyou-souba-guide',
        recommendedArticleTitle: '【2026年最新】実家の解体費用相場はいくら？木造・鉄骨の坪単価と安く抑えるコツ',
        ctaText: '無料で解体・売却の一括無料見積もりを試す',
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="bg-stone-50 border-2 border-emerald-800/30 rounded-3xl p-5 md:p-8 shadow-md my-6">
      <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm md:text-base mb-2">
        <Sparkles className="w-5 h-5 text-emerald-700" />
        <span>わずか30秒・匿名でOK</span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        あなたの状況に合わせた「最適な実家整理の手順」簡単診断
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        「何から手を付けるべきか分からない」という方も、当てはまる選択肢をタップするだけで
        <strong className="text-emerald-900 font-bold">安心できる次の一歩</strong>がすぐ分かります。
      </p>

      {/* 診断結果表示 */}
      {result ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-700 shadow-sm animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>診断結果ができました</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-emerald-950 mb-3 leading-snug">
            {result.title}
          </h3>

          <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-200">
            <h4 className="font-bold text-emerald-900 text-sm md:text-base mb-1">
              📌 あなたが今すぐすべきこと
            </h4>
            <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-3">
              {result.conclusion}
            </p>
            <ul className="space-y-1.5 text-sm md:text-base text-gray-800 font-medium">
              {result.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✔</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
            <span className="text-xs text-stone-500 font-bold block mb-1">
              📖 あなたの状況にピッタリの解説記事
            </span>
            <Link
              href={`/articles/${result.recommendedArticleSlug}`}
              className="text-base md:text-lg font-bold text-emerald-900 hover:underline flex items-center justify-between gap-2"
            >
              <span>{result.recommendedArticleTitle}</span>
              <ArrowRight className="w-5 h-5 shrink-0 text-emerald-800" />
            </Link>
          </div>

          <UnifiedCTA title="診断結果に合わせて無料で相談してみる" buttonText={result.ctaText} />

          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>もう一度診断し直す</span>
            </button>
          </div>
        </div>
      ) : (
        /* 質問フォーム */
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-emerald-800 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          <div className="mb-4 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            STEP {currentStep + 1} / {QUESTIONS.length}
          </div>

          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            {QUESTIONS[currentStep].title}
          </h3>

          <div className="space-y-3">
            {QUESTIONS[currentStep].options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(QUESTIONS[currentStep].id, opt.id)}
                className="w-full text-left p-4 rounded-xl border-2 border-stone-200 bg-white hover:border-emerald-700 hover:bg-emerald-50/50 active:bg-emerald-100 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <div>
                  <div className="text-base md:text-lg font-bold text-gray-900 group-hover:text-emerald-950">
                    {opt.label}
                  </div>
                  {opt.subText && (
                    <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                      {opt.subText}
                    </div>
                  )}
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-emerald-700 group-hover:bg-emerald-700 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100"></div>
                </div>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="mt-4 text-left">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-gray-500 hover:text-gray-800 underline"
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
