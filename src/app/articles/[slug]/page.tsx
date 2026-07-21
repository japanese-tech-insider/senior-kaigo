import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getArticles } from '@/lib/articles';
import { getCategoryBySlug } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { UnifiedCTA } from '@/components/UnifiedCTA';
import { Accordion } from '@/components/Accordion';
import { CheckCircle2, Clock, Calendar, AlertCircle, HeartHandshake, UserCheck } from 'lucide-react';

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
      category ? category.name : '介護施設選び',
      '特養',
      '有料老人ホーム',
      '老人ホーム費用',
      '認知症施設',
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
      name: siteConfig.siteName,
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
      <header className="space-y-4 border-b border-orange-100 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          {category && (
            <span className="bg-[#E07A5F] text-white font-bold text-xs md:text-sm px-3 py-1 rounded-lg">
              {category.name}
            </span>
          )}
          {article.readingTimeMinutes && (
            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-400" />
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

      {/* 【最優先要件】結論ファースト 3行サマリーボックス */}
      {article.summaryList && article.summaryList.length > 0 && (
        <section className="bg-[#FDF8F5] border-2 border-[#E07A5F]/60 rounded-2xl p-5 md:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#7c2d12] font-bold text-base md:text-lg border-b border-orange-200 pb-2.5">
            <CheckCircle2 className="w-6 h-6 text-[#E07A5F] shrink-0" />
            <span>【この記事はこんな人向け & 結論サマリー】</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[#C85A32] bg-orange-100/60 px-3 py-1 rounded-lg">
            <UserCheck className="w-4 h-4" />
            <span>親の介護施設選びに迷い、今すぐ何をすべきか知りたい方向け</span>
          </div>

          <ol className="space-y-3 pt-1">
            {article.summaryList.map((summaryItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-base md:text-lg text-gray-900 leading-relaxed font-medium">
                <span className="bg-[#E07A5F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1">
                  {idx + 1}
                </span>
                <span>{summaryItem}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 本文 */}
      <div className="markdown-body text-gray-800 text-base md:text-lg leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
      </div>

      {/* 介護相談・専門家確認コラム枠 */}
      <div className="bg-amber-50/80 border-l-4 border-amber-600 rounded-r-2xl p-4 md:p-5 text-amber-950 text-sm md:text-base leading-relaxed my-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">💡 ご注意・専門家相談について</div>
          本記事の解説は一般的な施設選びの判断基準です。実際の入居要件や受入可否、月額費用の詳細、医療的ケアの実施状況は、各施設および主治医・ケアマネジャー・地域包括支援センターの判断によって異なります。詳しい相談や個別条件の確認は、各施設や専門窓口に直接お問い合わせください。
        </div>
      </div>

      {/* 中間 統一CTAボタン */}
      <UnifiedCTA
        title="条件に合う施設を専門スタッフに無料で探してもらう"
        description="自力で何十社も比較する必要はありません。お身体の状況・希望の地域・ご予算をお伝えいただくだけで、プロが最適な施設をご紹介します。"
      />

      {/* FAQセクション (構造化データ連動) */}
      {article.faqList && article.faqList.length > 0 && (
        <Accordion items={article.faqList} title="介護施設選びに関するよくある質問" />
      )}

      {/* 末尾 統一CTAボタン */}
      <UnifiedCTA
        title="無料で最適な介護施設を探してもらう"
        description="ご家族の負担を減らし、親御さんにとっても最も安心できる住まいをみつけるために。まずは気軽にご希望をお聞かせください。"
      />
    </article>
  );
}
