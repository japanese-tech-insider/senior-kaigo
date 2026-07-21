import { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_ITEMS } from '@/lib/glossary';
import { getCategoryBySlug } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '平易な介護用語集｜特養・サ高住・有料老人ホーム・要介護度の違い',
  description:
    '「特養と有料の違いは？」「要介護3って具体的にどんな状態？」など、親の介護施設選びでよく出る専門用語を平易な言葉に言い換えて分かりやすく解説。',
  keywords: [
    '介護施設 用語集',
    '特別養護老人ホーム 特養',
    '有料老人ホーム 違い',
    'グループホーム 認知症',
    'サービス付き高齢者向け住宅 サ高住',
    '要介護度 基準',
  ],
  alternates: {
    canonical: '/glossary',
  },
};

export default function GlossaryPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: '平易な介護用語集 (知識ハブ)' }]} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#E07A5F] via-[#D96B27] to-[#C85A32] text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-2 text-orange-200 text-sm font-semibold mb-2">
          <BookOpen className="w-5 h-5" />
          <span>専門用語をわかりやすく平易に言い換え</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          平易な介護用語集 (施設選びの基礎知識)
        </h1>
        <p className="text-orange-50 text-base md:text-lg leading-relaxed">
          老人ホームの資料や紹介サイトに出てくるアルファベットや略称・専門用語を、親の介護に直面したご家族向けに徹底的にわかりやすく解説しています。
        </p>
      </div>

      {/* Quick Index */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-orange-200">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#E07A5F]" />
          <span>気になる用語をタップして確認</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {GLOSSARY_ITEMS.map((item) => (
            <a
              key={item.slug}
              href={`#${item.slug}`}
              className="bg-white px-3.5 py-1.5 rounded-xl border border-orange-200 text-xs md:text-sm font-semibold text-[#7c2d12] hover:border-[#E07A5F] hover:bg-orange-50 transition"
            >
              #{item.term.split('（')[0]}
            </a>
          ))}
        </div>
      </div>

      {/* Glossary List */}
      <div className="space-y-6">
        {GLOSSARY_ITEMS.map((item) => {
          const category = getCategoryBySlug(item.relatedCategorySlug);
          return (
            <section
              key={item.slug}
              id={item.slug}
              className="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-xs scroll-mt-24 hover:border-[#E07A5F] transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-[#7c2d12]">
                    {item.term}
                  </h2>
                  <span className="text-xs text-gray-400 font-normal">
                    ({item.reading})
                  </span>
                </div>

                {category && (
                  <Link
                    href={`/category/${category.slug}`}
                    className="bg-orange-50 text-[#C85A32] text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-orange-100 transition"
                  >
                    関連: {category.name}
                  </Link>
                )}
              </div>

              {/* 平易な言い換えハイライト */}
              <div className="bg-[#FDF8F5] rounded-xl p-3.5 border border-orange-200 text-sm md:text-base font-bold text-[#C85A32] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E07A5F] shrink-0" />
                <span>平易な言い換え: {item.easyMeaning}</span>
              </div>

              {/* 要約 */}
              <div className="text-sm md:text-base text-gray-800 font-medium">
                📌 {item.summary}
              </div>

              {/* 詳細説明 */}
              <p className="text-gray-700 text-base md:text-lg leading-relaxed pt-2">
                {item.description}
              </p>
            </section>
          );
        })}
      </div>

      {/* 統一CTA */}
      <UnifiedCTA
        title="条件や用語が分からなくても大丈夫。専門スタッフに無料で相談！"
        description="「自力で探すと用語が多くて疲れてしまった」という方へ。ご希望エリアとご家族の不安を伝えるだけで最適な施設をお探しします。"
      />
    </div>
  );
}
