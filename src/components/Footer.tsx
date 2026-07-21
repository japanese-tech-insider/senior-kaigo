import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t-4 border-[#E07A5F]">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E07A5F] flex items-center justify-center text-white font-bold text-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">
              {siteConfig.siteName}
            </span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            親の認知症や急な体調変化に直面し、「どの施設を選べばいいか分からない」「家族で意見が合わない」と悩む方のための解説メディアです。焦りと不安を和らげ、最適な判断基準をご提案します。
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-base mb-3 border-b border-stone-800 pb-2">
            主要カテゴリ＆コンテンツ
          </h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-[#E07A5F] transition flex items-center gap-1.5"
                >
                  <span className="text-[#E07A5F]">›</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/glossary"
                className="hover:text-[#E07A5F] transition flex items-center gap-1.5 font-bold text-orange-300"
              >
                <span className="text-[#E07A5F]">›</span>
                <span>平易な介護用語集 (特養・有料・サ高住等)</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 leading-relaxed space-y-1">
        <p>© 2026 {siteConfig.siteName} All rights reserved.</p>
        <p>
          【免責事項】当サイトは一般家庭における介護施設選びの判断基準および情報提供を目的としており、特定の医療行為の診断・紹介や特定施設への個別評価を保証するものではありません。具体的な入居契約、医療的ケアの実施、介護保険制度の詳細については、必ず主治医、ケアマネジャー、自治体の地域包括支援センター、または各施設に直接ご確認ください。
        </p>
      </div>
    </footer>
  );
};
