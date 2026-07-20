'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '@/lib/types';

interface AccordionProps {
  items: FAQItem[];
  title?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  title = 'よくある質問 (FAQ)',
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // 最初の質問を開いておく

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section className="my-8 bg-stone-50 rounded-2xl p-5 md:p-6 border border-stone-200">
      <div className="flex items-center gap-2 mb-4 text-emerald-900">
        <HelpCircle className="w-6 h-6 shrink-0 text-emerald-800" />
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 font-bold text-base md:text-lg text-gray-900 hover:bg-stone-50 transition cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-800 font-extrabold text-lg md:text-xl shrink-0">
                    Q.
                  </span>
                  <span className="leading-snug pt-0.5">{item.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-emerald-800' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-stone-700 text-base md:text-lg leading-relaxed border-t border-stone-100 bg-stone-50/50 flex items-start gap-2.5">
                  <span className="text-amber-700 font-extrabold text-lg md:text-xl shrink-0">
                    A.
                  </span>
                  <div className="pt-0.5">{item.answer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
