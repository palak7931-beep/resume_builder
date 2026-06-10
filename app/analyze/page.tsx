'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { JDSummaryPanel } from '@/components/JDSummaryPanel';
import { ScoreCard } from '@/components/ScoreCard';
import { GapAnalysis } from '@/components/GapAnalysis';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

export default function AnalyzePage() {
  const router = useRouter();
  const { tailoringRun, ui, setStep } = useAppStore();

  useEffect(() => {
    if (!tailoringRun) {
      router.push(ROUTES.input);
    } else {
      setStep('analyze');
    }
  }, [tailoringRun, router, setStep]);

  if (!tailoringRun) {
    return null;
  }

  return (
    <>
      <StepIndicator />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Analysis Results</h1>
          <p className="text-muted-foreground">
            Review your match score, job requirements, and gaps.
          </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <JDSummaryPanel jd={tailoringRun.jobDescription} />
          <GapAnalysis gapAnalysis={tailoringRun.gapAnalysis!} />
        </div>
        <div className="space-y-6">
          <ScoreCard score={tailoringRun.originalMatchScore} label="Original Score" />
          {tailoringRun.tailoredMatchScore && (
            <ScoreCard score={tailoringRun.tailoredMatchScore} label="Tailored Score" />
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={() => router.push(ROUTES.review)} size="lg">
            Review Tailored Changes
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
