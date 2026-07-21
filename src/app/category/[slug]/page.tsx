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
    title: `${category.name}の解説と選定基準`,
    description: category.description,
    keywords: [
      category.name,
      '介護施設選び',
      '親の介護',
      '老人ホーム費用',
      '選び方のコツ',
    ],
    alternates: {
      canonical: `/category/${category.slug}`,
    },
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
      <div className="bg-gradient-to-r from-[#E07A5F] via-[#D96B27] to-[#C85A32] text-white rounded-3xl p-6 md:p-8 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{category.name}</h1>
        <p className="text-orange-50 text-base md:text-lg leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Articles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#E07A5F] pl-3">
          {category.name}の結論ファースト記事一覧 ({articles.length}件)
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF9] border border-orange-100 p-8 rounded-2xl text-center text-gray-600">
            現在、このカテゴリの解説記事は順次更新・追加中です。
          </div>
        )}
      </section>

      <UnifiedCTA
        title={`${category.name}について条件に合う施設を無料で探してもらう`}
        description="一覧で迷う前に、専門スタッフに直接条件を伝えるのが近道です。無料でピッタリの施設をご案内いたします。"
      />
    </div>
  );
}
