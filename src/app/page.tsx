import Link from 'next/link';
import { DiagnosisWidget } from '@/components/DiagnosisWidget';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { ArticleCard } from '@/components/ArticleCard';
import { CATEGORIES } from '@/lib/categories';
import { GLOSSARY_ITEMS } from '@/lib/glossary';
import { getArticles } from '@/lib/articles';
import { siteConfig } from '@/lib/site-config';
import {
  CheckSquare,
  Building2,
  Coins,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  CheckSquare: <CheckSquare className="w-6 h-6 text-[#C85A32]" />,
  Building2: <Building2 className="w-6 h-6 text-[#C85A32]" />,
  Coins: <Coins className="w-6 h-6 text-[#C85A32]" />,
  Clock: <Clock className="w-6 h-6 text-[#C85A32]" />,
  Users: <Users className="w-6 h-6 text-[#C85A32]" />,
};

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="space-y-10">
      {/* ヒーローセクション (暖色系・安心感デザイン) */}
      <section className="bg-gradient-to-br from-[#E07A5F] via-[#D96B27] to-[#C85A32] text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-white text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <HeartHandshake className="w-4 h-4 text-orange-200" />
            <span>45〜65歳・家族のための施設選び判断ガイド</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-snug tracking-tight mb-4">
            親の介護施設選び、
            <br />
            「今すぐ何をすればいい？」に答えを。
          </h1>

          <p className="text-orange-50 text-base md:text-lg leading-relaxed mb-6">
            認知症や体調の変化に直面し、焦りや罪悪感を抱えていませんか？
            たくさんの施設を一覧比較する前に、<strong className="text-white font-bold underline decoration-orange-200">「我が家の状況に合う結論」</strong>を分かりやすくお届けします。
          </p>

          <div className="flex flex-wrap gap-3 text-xs md:text-sm text-orange-100">
            <span className="bg-black/15 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-orange-300" />
              選択肢に迷わない結論ファースト
            </span>
            <span className="bg-black/15 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-orange-300" />
              専門用語の平易解説つき
            </span>
          </div>
        </div>
      </section>

      {/* 診断UI (最優先要件) */}
      <section id="diagnosis">
        <DiagnosisWidget />
      </section>

      {/* 5つの主要カテゴリ (カテゴリ5個以内に限定) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-[#E07A5F] pl-3">
            知りたいお悩みから探す (5つの視点)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl border border-orange-100 p-5 hover:border-[#E07A5F] hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {ICON_MAP[cat.iconName] || <BookOpen className="w-6 h-6 text-[#C85A32]" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#7c2d12] mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
                  {cat.shortDescription}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-[#C85A32] gap-1 group-hover:translate-x-1 transition-transform">
                <span>解説記事を見る</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 新着・おすすめ解説記事 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-[#E07A5F] pl-3">
            後悔しないための解説記事
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.slice(0, 6).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF9] rounded-2xl border border-orange-100 p-8 text-center text-gray-500 space-y-2">
            <p className="font-bold text-base text-gray-800">準備中の解説記事</p>
            <p className="text-sm">毎日自動更新パイプラインにより、最新の解説記事を追加していきます。</p>
          </div>
        )}
      </section>

      {/* 平易な介護用語集導線 */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 md:p-8 border border-orange-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#E07A5F] text-white text-xs font-bold px-3 py-1 rounded-full">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>専門用語も怖くない</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#7c2d12]">
              特養・サ高住・要介護度ってなに？平易な介護用語集
            </h3>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed max-w-xl">
              「特養と有料の違いは？」「要介護3って具体的にどんな状態？」といった難しい用語を、専門用語を使わずに分かりやすく言い換えて解説します。
            </p>
          </div>

          <Link
            href="/glossary"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#E07A5F] hover:bg-[#D96B27] text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition shrink-0"
          >
            <span>用語集を見る</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-orange-200/80 flex flex-wrap gap-2">
          {GLOSSARY_ITEMS.slice(0, 5).map((item) => (
            <Link
              key={item.slug}
              href={`/glossary#${item.slug}`}
              className="bg-white hover:bg-orange-100/60 text-[#7c2d12] text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200 transition"
            >
              {item.term} ({item.easyMeaning.slice(0, 15)}...)
            </Link>
          ))}
        </div>
      </section>

      {/* 統一CTAセクション */}
      <UnifiedCTA />
    </div>
  );
}
