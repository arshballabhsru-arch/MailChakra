import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 py-2">
      <button
        type="button"
        onClick={() => onNavigate?.('landing')}
        className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={`font-medium ${isLast ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => item.href && onNavigate?.(item.href)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
