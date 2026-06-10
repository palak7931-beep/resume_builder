'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

const steps = [
  { id: 'input', label: 'Input', href: ROUTES.input },
  { id: 'analyze', label: 'Analyze', href: ROUTES.analyze },
  { id: 'review', label: 'Review', href: ROUTES.review },
  { id: 'export', label: 'Export', href: ROUTES.export },
];

export function StepIndicator() {
  const { ui, tailoringRun } = useAppStore();
  
  const getCurrentStepIndex = () => {
    switch (ui.step) {
      case 'input':
        return 0;
      case 'analyze':
        return 1;
      case 'review':
        return 2;
      case 'export':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isAccessible = isCompleted || (isCurrent && tailoringRun);

              return (
                <li key={step.id} className="flex items-center flex-1">
                  {index > 0 && (
                    <div
                      className={cn(
                        'h-0.5 w-full',
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-center justify-center">
                    <a
                      href={isAccessible ? step.href : undefined}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                        isCompleted
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'border-primary text-primary'
                          : 'border-muted text-muted-foreground',
                        isAccessible && 'hover:bg-primary/10'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </a>
                    <span
                      className={cn(
                        'absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium',
                        isCurrent || isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
