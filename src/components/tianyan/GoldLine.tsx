export function GoldLine({ vertical = false, className = '' }: { vertical?: boolean; className?: string }) {
  return <div className={`${vertical ? 'gold-line-v' : 'gold-line'} ${className}`} />;
}

export function JinmingCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`jinming-card rounded-xl p-5 ${hover ? '' : 'hover:transform-none hover:shadow-none'} ${className}`}>
      {children}
    </div>
  );
}
