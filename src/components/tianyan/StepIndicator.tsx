'use client';

interface StepIndicatorProps {
  steps: { label: string }[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="progress-node flex flex-col items-center gap-1 px-2">
            <div
              className={`w-2.5 h-2.5 rounded-full border-[1.5px] transition-all duration-400 ${
                index < currentStep
                  ? 'bg-gold-400 border-gold-400'
                  : index === currentStep
                    ? 'border-gold-400 bg-gold-400/30 shadow-[0_0_0_4px_rgba(200,164,92,0.1)]'
                    : 'border-gold-400/20 bg-transparent'
              }`}
            />
            <span
              className={`text-[11px] whitespace-nowrap ${
                index <= currentStep ? 'text-gold-200' : 'text-ink-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-px flex-1 min-w-[16px] transition-colors duration-400 ${
                index < currentStep ? 'bg-gold-400' : 'bg-gold-400/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
