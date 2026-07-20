import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories';
import { getArticlesByCategory } from '@/lib/articles';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleCard } from '@/components/ArticleCard';
import { UnifiedCTA } from '@/components/UnifiedCTA';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return { title: 'カテゴリが見つかりません' };
  }

  return {
    title: `${category.name}の進め方・費用と手順`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category.slug);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: category.name }]} />

      {/* Header */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{category.name}</h1>
        <p className="text-emerald-100 text-base md:text-lg leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Articles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-800 pl-3">
          {category.name}の結論ファースト記事一覧 ({articles.length}件)
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-stone-100 p-8 rounded-2xl text-center text-gray-600">
            現在、このカテゴリの記事は準備・更新中です。
          </div>
        )}
      </section>

      <UnifiedCTA
        title={`${category.name}について無料で専門家に相談してみる`}
        description="一社ごとの面倒な交渉は不要。実績のあるパートナー業者からまとめて比較・見積もりが取得できます。"
      />
    </div>
  );
}
