interface WuxingTagProps {
  wuxing: string;
  children?: React.ReactNode;
  className?: string;
}

const elementClasses: Record<string, string> = {
  金: 'wx-jin',
  木: 'wx-mu',
  水: 'wx-shui',
  火: 'wx-huo',
  土: 'wx-tu',
};

const elementDots: Record<string, string> = {
  金: 'bg-wuxing-jin',
  木: 'bg-wuxing-mu',
  水: 'bg-wuxing-shui',
  火: 'bg-wuxing-huo',
  土: 'bg-wuxing-tu',
};

export function WuxingTag({ wuxing, children, className }: WuxingTagProps) {
  return (
    <span className={`wx-tag ${elementClasses[wuxing] || ''} ${className || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${elementDots[wuxing] || 'bg-ink-500'}`} />
      {children || wuxing}
    </span>
  );
}

export function WuxingDot({ element }: { element: '金' | '木' | '水' | '火' | '土' }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${elementDots[element]}`} />;
}
