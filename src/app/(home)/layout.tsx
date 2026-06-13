import { SiteHeader } from '@/components/tianyan/SiteHeader';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="text-center py-6 text-ink-400 text-xs">
        以上内容仅供传统文化参考，不构成人生决策依据
      </footer>
    </div>
  );
}
