import Link from 'next/link';
import { DiagnosisWidget } from '@/components/DiagnosisWidget';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { ArticleCard } from '@/components/ArticleCard';
import { CATEGORIES } from '@/lib/categories';
import { GLOSSARY_ITEMS } from '@/lib/glossary';
import { getArticles } from '@/lib/articles';
import {
  ClipboardList,
  Home as HomeIcon,
  Hammer,
  Package,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  ClipboardList: <ClipboardList className="w-6 h-6 text-emerald-800" />,
  Home: <HomeIcon className="w-6 h-6 text-emerald-800" />,
  Hammer: <Hammer className="w-6 h-6 text-emerald-800" />,
  Package: <Package className="w-6 h-6 text-emerald-800" />,
  FileText: <FileText className="w-6 h-6 text-emerald-800" />,
};

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="space-y-10">
      {/* ヒーローセクション */}
      <section className="bg-emerald-900 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/90 text-emerald-100 text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-4">
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            <span>45〜65歳のための親の実家相談ガイド</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-snug tracking-tight mb-4">
            親が亡くなった後の実家整理、
            <br />
            「何から始める？」に明確なヒントを。
          </h1>

          <p className="text-emerald-100 text-base md:text-lg leading-relaxed mb-6">
            長い文章を読む余裕がなくても大丈夫です。
            当サイトは専門用語をなるべく使わず、複雑な疑問の<strong className="text-white font-bold underline decoration-emerald-400">ポイントを整理してお伝え</strong>します。
          </p>

          <div className="flex flex-wrap gap-3 text-xs md:text-sm text-emerald-200">
            <span className="bg-emerald-950/60 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ご相談・お見積もり無料
            </span>
            <span className="bg-emerald-950/60 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              プライバシー厳守
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-emerald-800 pl-3">
            知りたいお悩みから探す (全5分野)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-emerald-700 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {ICON_MAP[cat.iconName] || <BookOpen className="w-6 h-6 text-emerald-800" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-950 mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
                  {cat.shortDescription}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-emerald-800 gap-1 group-hover:translate-x-1 transition-transform">
                <span>記事一覧を見る</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 中間 統一CTA */}
      <UnifiedCTA />

      {/* 結論ファースト お役立ち記事 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-emerald-800 pl-3">
            ポイント整理済みの実家整理お役立ち記事
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 用語集ハブへの案内 */}
      <section className="bg-stone-100 rounded-3xl p-6 md:p-8 border border-stone-200">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg md:text-xl mb-2">
          <BookOpen className="w-6 h-6" />
          <h3>実家整理の専門用語集 (知識ハブ)</h3>
        </div>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
          「特定空き家って何？」「遺品整理士ってどんな資格？」など、分かりにくい用語の概要を分かりやすく解説しています。
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {GLOSSARY_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={`/glossary#${item.slug}`}
              className="bg-white px-3 py-1.5 rounded-lg border border-stone-300 text-xs md:text-sm font-medium text-gray-800 hover:border-emerald-700 hover:text-emerald-900 transition"
            >
              🏷️ {item.term}
            </Link>
          ))}
        </div>

        <Link
          href="/glossary"
          className="inline-flex items-center gap-2 bg-emerald-900 text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-xl hover:bg-emerald-950 transition"
        >
          <span>専門用語集をすべて見る</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ページ末尾 統一CTA */}
      <UnifiedCTA
        title="実家整理・空き家処分に不安を感じたら"
        description="一度に複数社の無料見積もり・買取額のシミュレーションを取り寄せられます。ご家族での話し合いにも役立ちます。"
      />
    </div>
  );
}
