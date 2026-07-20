import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs md:text-sm text-gray-600 my-4 overflow-x-auto whitespace-nowrap py-1">
      <Link href="/" className="flex items-center gap-1 hover:text-emerald-800 shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span>トップ</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1.5 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-emerald-800 shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-xs shrink-0">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
