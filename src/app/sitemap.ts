import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/articles';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://senior-jikka.web.app';

  // 1. 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 2. カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. published の記事のみ取得
  const articles = await getArticles();
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
