'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SubHeaderProps {
  title: string;
  stepLabel?: string; // e.g. "[1/4]"
  backHref: string;
  rightAction?: React.ReactNode;
}

export function SubHeader({ title, stepLabel, backHref, rightAction }: SubHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-ink-900/80 backdrop-blur-md border-b border-gold-400/10">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="text-ink-300 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-base text-ink-100">
            {title}
            {stepLabel && <span className="text-ink-400 ml-1 text-sm">{stepLabel}</span>}
          </h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
