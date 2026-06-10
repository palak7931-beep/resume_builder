'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SideBySideDiff } from '@/components/SideBySideDiff';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function ReviewPage() {
  const router = useRouter();
  const { tailoringRun, setTailoringRun, setStep } = useAppStore();

  useEffect(() => {
    if (!tailoringRun) {
      router.push(ROUTES.input);
    } else {
      setStep('review');
    }
  }, [tailoringRun, router, setStep]);

  if (!tailoringRun || !tailoringRun.tailoredResume) {
    return null;
  }

  const tailoredResume = tailoringRun.tailoredResume;

  const unconfirmedRiskyBullets = tailoredResume.tailoredExperience.flatMap((entry, entryIndex) =>
    entry.bullets
      .map((bullet, bulletIndex) => ({ entryIndex, bulletIndex, bullet }))
      .filter(({ bullet }) =>
        (bullet.riskFlag || bullet.confidence === 'low') && bullet.userConfirmed !== true
      )
  );

  const handleConfirmBullet = (entryIndex: number, bulletIndex: number) => {
    const updated = {
      ...tailoringRun,
      tailoredResume: {
        ...tailoredResume,
        tailoredExperience: tailoredResume.tailoredExperience.map((entry, eIdx) =>
          eIdx !== entryIndex
            ? entry
            : {
                ...entry,
                bullets: entry.bullets.map((bullet, bIdx) =>
                  bIdx !== bulletIndex
                    ? bullet
                    : {
                        ...bullet,
                        userConfirmed: true,
                      }
                ),
              }
        ),
      },
    };

    setTailoringRun(updated);
  };

  return (
    <>
      <StepIndicator />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Review Tailored Changes</h1>
          <p className="text-muted-foreground">
            Compare your original resume bullets with the tailored versions.
          </p>
        </div>

      {unconfirmedRiskyBullets.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {unconfirmedRiskyBullets.length} low-confidence or risky bullet(s) that require review before exporting.
          </AlertDescription>
        </Alert>
      )}

      <SideBySideDiff
        tailoredExperience={tailoringRun.tailoredResume.tailoredExperience}
        onConfirmBullet={handleConfirmBullet}
      />

      <Card>
        <CardContent className="pt-6">
          <Button onClick={() => router.push(ROUTES.export)} size="lg">
            Export Tailored Resume
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
