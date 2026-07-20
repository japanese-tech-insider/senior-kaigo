import { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_ITEMS } from '@/lib/glossary';
import { getCategoryBySlug } from '@/lib/categories';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { BookOpen, Tag, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '実家整理の専門用語集｜空き家・解体・遺品整理・相続用語解説',
  description:
    '「特定空き家」「遺品整理士」「3000万円特別控除」など、親が亡くなった後の手続きや片付けでよく出てくる専門用語を分かりやすく解説。',
  keywords: [
    '実家整理 用語集',
    '特定空き家',
    '遺品整理士',
    '3000万円特別控除',
    '建物滅失登記',
    '相続登記義務化',
  ],
  alternates: {
    canonical: '/glossary',
  },
};

export default function GlossaryPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: '専門用語集 (知識ハブ)' }]} />

      {/* Header */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold mb-2">
          <BookOpen className="w-5 h-5" />
          <span>初心者向け・やさしい言葉解説</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          実家整理の専門用語集 (知識ハブ)
        </h1>
        <p className="text-emerald-100 text-base md:text-lg leading-relaxed">
          実家の片付けや空き家売却・解体で、見積書や役所の書類に出てくる難しい用語を平易な言葉で解説しています。
        </p>
      </div>

      {/* Quick Index */}
      <div className="bg-stone-100 rounded-2xl p-5 border border-stone-200">
        <h2 className="text-sm font-bold text-gray-700 mb-3">目次から用語を探す</h2>
        <div className="flex flex-wrap gap-2">
          {GLOSSARY_ITEMS.map((item) => (
            <a
              key={item.slug}
              href={`#${item.slug}`}
              className="bg-white px-3 py-1.5 rounded-lg border border-stone-300 text-xs md:text-sm font-medium text-gray-800 hover:border-emerald-700 hover:text-emerald-900 transition"
            >
              #{item.term}
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
              className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-xs scroll-mt-24 hover:border-emerald-700/50 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-emerald-950">
                    {item.term}
                  </h2>
                  <span className="text-xs text-gray-400 font-normal">
                    ({item.reading})
                  </span>
                </div>

                {category && (
                  <Link
                    href={`/category/${category.slug}`}
                    className="bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-md hover:bg-stone-200 transition"
                  >
                    関連: {category.name}
                  </Link>
                )}
              </div>

              {/* サマリー */}
              <div className="bg-emerald-50 rounded-xl p-3.5 mb-3 border border-emerald-100 text-sm md:text-base font-bold text-emerald-900">
                💡 要約: {item.summary}
              </div>

              {/* 詳細説明 */}
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                {item.description}
              </p>

              {category && (
                <div className="pt-3 border-t border-stone-100 text-right">
                  <Link
                    href={`/category/${category.slug}`}
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-emerald-800 hover:underline"
                  >
                    <span>「{category.name}」の解説記事一覧を読む</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <UnifiedCTA />
    </div>
  );
}
