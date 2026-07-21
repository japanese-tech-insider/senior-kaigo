'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { Menu, X, Home as HomeIcon, HeartHandshake } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-[#C85A32] text-white text-xs md:text-sm py-1.5 px-4 text-center font-medium">
        {siteConfig.siteTagline}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Site Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-lg md:text-xl font-bold text-gray-900 leading-tight group-hover:text-[#D96B27] transition">
              {siteConfig.siteName}
            </span>
            <span className="block text-xs text-gray-500 font-normal">
              焦らず選べる家族のための判断ナビ
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className="text-gray-700 hover:text-[#D96B27] font-medium text-sm flex items-center gap-1 transition"
          >
            <HomeIcon className="w-4 h-4" />
            トップ
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-gray-700 hover:text-[#D96B27] font-medium text-sm transition"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/glossary"
            className="text-[#C85A32] font-bold bg-orange-50 px-3 py-1.5 rounded-lg text-sm border border-orange-200 hover:bg-orange-100 transition"
          >
            介護用語集
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-[#D96B27] focus:outline-none"
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#FFFDF9] border-t border-orange-100 px-4 py-4 space-y-3 shadow-lg animate-fadeIn">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold text-base border-b border-orange-100"
          >
            🏠 トップページ
          </Link>
          <div className="pt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            カテゴリから探す (5個の視点)
          </div>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 px-3 bg-white rounded-xl border border-orange-100 text-gray-800 font-medium text-base hover:bg-orange-50 hover:text-[#D96B27] transition shadow-xs"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/glossary"
            onClick={() => setIsMenuOpen(false)}
            className="block py-3 px-3 bg-[#E07A5F] text-white font-bold text-center rounded-xl text-base shadow-sm hover:bg-[#D96B27] transition"
          >
            📖 平易な介護用語集（特養・サ高住など）
          </Link>
        </nav>
      )}
    </header>
  );
};
