import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t-4 border-emerald-800">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
              実
            </div>
            <span className="text-xl font-bold text-white">
              実家整理の安心手引き
            </span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            「親が亡くなった後の実家をどうするか」に悩む方のための情報解説メディアです。
            整理・解体・売却・相続の進め方や留意点を分かりやすくまとめています。
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-base mb-3 border-b border-stone-700 pb-2">
            主要カテゴリ一覧
          </h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>›</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/glossary"
                className="hover:text-emerald-400 transition flex items-center gap-1.5 font-bold text-emerald-300"
              >
                <span>›</span>
                <span>専門用語集 (知識ハブ)</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 leading-relaxed space-y-1">
        <p>© 2026 実家整理の安心手引き All rights reserved.</p>
        <p>
          【免責事項】当サイトに掲載している情報は一般概念の解説であり、個々の法的効力・税務判断・解体契約等を保証するものではありません。
          具体的な相続手続き、遺産分割、特例適用等につきましては、必ず弁護士・税理士・司法書士等の有資格者、または関係省庁・自治体・該当事業者へ直接ご確認ください。
        </p>
      </div>
    </footer>
  );
};
