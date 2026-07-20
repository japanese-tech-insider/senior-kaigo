'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { Menu, X, Home as HomeIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Notification Line */}
      <div className="bg-emerald-900 text-white text-xs md:text-sm py-1.5 px-4 text-center font-medium">
        親が亡くなった後の実家整理・空き家売却「何から始める？」の安心ガイド
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Site Title */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            実
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-emerald-800 transition">
              実家整理の安心手引き
            </span>
            <span className="block text-xs text-gray-500 font-normal">
              親の家をどうする？賢い手順と選択肢
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-emerald-800 font-medium text-base flex items-center gap-1"
          >
            <HomeIcon className="w-4 h-4" />
            トップ
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-gray-700 hover:text-emerald-800 font-medium text-sm transition"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/glossary"
            className="text-emerald-900 font-bold bg-emerald-50 px-3 py-1.5 rounded-md text-sm border border-emerald-200 hover:bg-emerald-100 transition"
          >
            用語集
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-emerald-800 focus:outline-none"
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <nav className="md:hidden bg-stone-50 border-t border-gray-200 px-4 py-4 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold text-base border-b border-gray-200"
          >
            🏠 トップページ
          </Link>
          <div className="pt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            カテゴリから探す (全5分野)
          </div>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 px-3 bg-white rounded-lg border border-gray-200 text-gray-800 font-medium text-base hover:bg-emerald-50 hover:text-emerald-800 transition"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/glossary"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2.5 px-3 bg-emerald-800 text-white font-bold text-center rounded-lg text-base shadow-sm"
          >
            📚 実家整理の専門用語集
          </Link>
        </nav>
      )}
    </header>
  );
};
