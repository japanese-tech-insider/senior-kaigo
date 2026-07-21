'use client';

import React from 'react';
import { ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

interface UnifiedCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  affiliateUrl?: string;
  className?: string;
}

export const UnifiedCTA: React.FC<UnifiedCTAProps> = ({
  title = 'あなたの親御さんにピッタリの施設、まずはプロに相談してみませんか？',
  description = '「どんな施設が合っているか分からない」「費用や受け入れ条件を一覧ではなく個別で知りたい」という方に。条件を入力するだけで、専門スタッフが最適な施設を無料でお探しします。',
  buttonText = siteConfig.unifiedCTA.buttonText,
  affiliateUrl = siteConfig.unifiedCTA.href,
  className = '',
}) => {
  const handleClick = () => {
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('【無料施設探し窓口へ移動します】\n大手介護施設比較ポータル（LIFULL介護・みんなの介護等）の相談フォームへ移動します。');
    }
  };

  return (
    <div
      className={`my-8 bg-[#FFFDF9] border-2 border-[#E07A5F]/30 rounded-2xl p-6 md:p-8 text-center shadow-md relative overflow-hidden ${className}`}
    >
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E07A5F] via-[#F4F1DE] to-[#81B29A]" />

      <div className="inline-flex items-center gap-1.5 bg-[#C85A32] text-white text-xs md:text-sm font-semibold px-3.5 py-1 rounded-full mb-3 shadow-xs">
        <ShieldCheck className="w-4 h-4" />
        <span>{siteConfig.unifiedCTA.badgeText}</span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-snug">
        {title}
      </h3>

      <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed max-w-xl mx-auto">
        {description}
      </p>

      <button
        onClick={handleClick}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#E07A5F] hover:bg-[#D96B27] active:bg-[#C85A32] text-white text-lg md:text-xl font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
      >
        <HeartHandshake className="w-6 h-6" />
        <span>{buttonText}</span>
        <ArrowRight className="w-6 h-6" />
      </button>

      <p className="text-xs md:text-sm text-gray-500 mt-3.5 leading-normal">
        {siteConfig.unifiedCTA.subText}<br />
        ※無理な勧誘やしつこい営業電話は一切ございません。安心してご利用いただけます。
      </p>
    </div>
  );
};
