'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '测名', href: '/test-name' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-ink-900/80 backdrop-blur-md border-b border-gold-400/10">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-semibold text-gold-400 glow-gold">天衍</span>
        </Link>
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`nav-link text-sm transition-colors ${
        isActive ? 'text-gold-400' : 'text-ink-300'
      }`}
    >
      {item.label}
    </Link>
  );
}
