import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getArticles } from '@/lib/articles';
import { getCategoryBySlug } from '@/lib/categories';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { Accordion } from '@/components/Accordion';
import { CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: '記事が見つかりません',
    };
  }

  const category = getCategoryBySlug(article.category);
  const isPublished = article.status === 'published';

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription,
    keywords: [
      article.title,
      category ? category.name : '実家整理',
      '費用相場',
      '手続き手順',
      '空き家対策',
      '遺品整理',
    ],
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    robots: {
      index: isPublished,
      follow: isPublished,
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const category = getCategoryBySlug(article.category);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.publishedAt || article.createdAt,
    publisher: {
      '@type': 'Organization',
      name: '実家整理の安心手引き',
    },
  };

  const faqJsonLd = article.faqList && article.faqList.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqList.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <article className="space-y-8 max-w-4xl mx-auto">
      {/* 構造化データ埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* パンくず */}
      <Breadcrumbs
        items={[
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: article.title },
        ]}
      />

      {/* 記事ヘッダー */}
      <header className="space-y-4 border-b border-stone-200 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          {category && (
            <span className="bg-emerald-900 text-white font-bold text-xs md:text-sm px-3 py-1 rounded-md">
              {category.name}
            </span>
          )}
          {article.readingTimeMinutes && (
            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>目安 {article.readingTimeMinutes} 分で読めます</span>
            </span>
          )}
          {article.publishedAt && (
            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>公開日: {new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-snug">
          {article.title}
        </h1>
      </header>

      {/* 【最優先要件】冒頭3行 結論サマリーボックス */}
      {article.summaryList && article.summaryList.length > 0 && (
        <section className="bg-emerald-50 border-2 border-emerald-800/40 rounded-2xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-base md:text-lg mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-800 shrink-0" />
            <span>【この記事の要点・結論サマリー】</span>
          </div>

          <ol className="space-y-3">
            {article.summaryList.map((summaryItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-base md:text-lg text-gray-900 leading-relaxed font-medium">
                <span className="bg-emerald-800 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1">
                  {idx + 1}
                </span>
                <span>{summaryItem}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 本文前半 */}
      <div className="markdown-body text-gray-800 text-base md:text-lg leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
      </div>

      {/* 法的・税務アドバイス関する注意・専門家確認コラム枠 */}
      <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-2xl p-4 md:p-5 text-amber-950 text-sm md:text-base leading-relaxed my-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">💡 ご確認・注意事項</div>
          本記事の解説は一般的な手順の目安です。税金の控除条件、相続名義変更、実際の解体・処分見積もり金額は個々の物件状態や自治体・税制によって異なります。具体的なご判断にあたっては、弁護士・税理士・司法書士等の有資格者、または専門事業者へ直接ご相談されることを推奨いたします。
        </div>
      </div>

      {/* 中間 統一CTAボタン */}
      <UnifiedCTA
        title="あなたの状況ならどうすべき？無料で比較・査定してみる"
        description="記事をすべて読み込まなくても大丈夫です。ご自身の空き家の状態や部屋の間取りを伝えるだけで、概算費用と手順の目安が確認できます。"
      />

      {/* FAQセクション (構造化データ連動) */}
      {article.faqList && article.faqList.length > 0 && (
        <Accordion items={article.faqList} title="この記事に関連するよくある質問" />
      )}

      {/* 末尾 統一CTAボタン */}
      <UnifiedCTA
        title="無料査定・見積もり相談で安心の次の一歩を"
        description="ご家族での話し合いの前に、客観的な見積もり金額・査定額を用意しておくことがスムーズな決断のコツです。"
      />
    </article>
  );
}
