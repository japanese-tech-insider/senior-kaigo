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
          <p className="text-sm text-stone-400 leading-relaxed mb-4">
            「親が亡くなった後の実家をどうするか」に悩む方のための特化型中立情報メディアです。
            中立的な視点から結論ファーストで、分かりやすい解決手順と無料相談窓口をご案内しています。
          </p>
          <div className="text-xs text-stone-500">
            ※当サイトは広告運用・SNS集客を行わず、純粋な検索閲覧のみを目的として設計されています。
          </div>
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

      <div className="max-w-5xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
        <p>© 2026 実家整理の安心手引き All rights reserved.</p>
        <p className="mt-1">
          本サイトの情報は一般的な解説です。個別の法律・税務相談は弁護士・税理士等の専門家にご確認ください。
        </p>
      </div>
    </footer>
  );
};
