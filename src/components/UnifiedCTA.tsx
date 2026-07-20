'use client';

import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface UnifiedCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  affiliateUrl?: string;
  className?: string;
}

export const UnifiedCTA: React.FC<UnifiedCTAProps> = ({
  title = 'あなたの状況に合わせた「安心できる次の一歩」を',
  description = '実家の片付け・空き家売却・買取・遺品整理など、今のお悩みや概算費用を無料でご相談・査定いただけます。まずはお気軽にご確認ください。',
  buttonText = '無料で相談・査定してみる',
  affiliateUrl,
  className = '',
}) => {
  const handleClick = () => {
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('【無料相談窓口へ移動します】\n※専門の無料査定・一括見積もりWebサービスページへ移動します。');
    }
  };

  return (
    <div
      className={`my-8 bg-emerald-50 border-2 border-emerald-800/20 rounded-2xl p-6 md:p-8 text-center shadow-sm ${className}`}
    >
      <div className="inline-flex items-center gap-1.5 bg-emerald-800 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3">
        <ShieldCheck className="w-4 h-4" />
        <span>ご相談・お見積もり無料・プライバシー厳守</span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-snug">
        {title}
      </h3>

      <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed max-w-xl mx-auto">
        {description}
      </p>

      <button
        onClick={handleClick}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-lg md:text-xl font-bold px-8 py-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-6 h-6" />
      </button>

      <p className="text-xs md:text-sm text-gray-500 mt-3 leading-normal">
        ※提携先の無料査定・見積もり相談窓口へ移動します。ご相談・お見積もりは無料です。<br />
        ※個別の税制・法的効力・契約内容については、弁護士・税理士・行政書士等の専門家や各事業者にご確認ください。
      </p>
    </div>
  );
};
