import React from 'react';
import Link from 'next/link';
import { ArticleData } from '@/lib/types';
import { getCategoryBySlug } from '@/lib/categories';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface ArticleCardProps {
  article: ArticleData;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const category = getCategoryBySlug(article.category);

  return (
    <article className="bg-white rounded-2xl border border-orange-100 p-5 shadow-xs hover:shadow-md transition-all hover:border-[#E07A5F] flex flex-col justify-between group">
      <div>
        {/* Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {category && (
            <span className="bg-orange-100/80 text-[#7c2d12] font-bold text-xs px-2.5 py-1 rounded-lg">
              {category.name}
            </span>
          )}
          {article.readingTimeMinutes && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{article.readingTimeMinutes}分で読める</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-[#C85A32] transition">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        {/* Summary Snippet (Conclusion) */}
        {article.summaryList && article.summaryList.length > 0 && (
          <div className="bg-[#FDF8F5] rounded-xl p-3.5 mb-4 border border-orange-200/60">
            <div className="text-xs font-bold text-[#C85A32] mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>結論サマリー</span>
            </div>
            <p className="text-xs md:text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {article.summaryList[0]}
            </p>
          </div>
        )}
      </div>

      {/* Link Footer */}
      <div className="pt-2 border-t border-orange-100/60 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ja-JP') : ''}
        </span>
        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#C85A32] hover:text-[#7c2d12] group-hover:translate-x-0.5 transition-transform"
        >
          <span>結論を読む</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};
