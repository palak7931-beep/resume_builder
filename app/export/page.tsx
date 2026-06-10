'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PDFExportButton } from '@/components/PDFExportButton';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

function parseFilename(header: string | null) {
  if (!header) {
    return 'resume-export.pdf';
  }

  const match = header.match(/filename\*?=UTF-8''([^;\n\r]+)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  const fallbackMatch = header.match(/filename="?([^";]+)"?/i);
  return fallbackMatch?.[1] ?? 'resume-export.pdf';
}

export default function ExportPage() {
  const router = useRouter();
  const { tailoringRun, setStep } = useAppStore();
  const [confirmed, setConfirmed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (!tailoringRun) {
      router.push(ROUTES.input);
    } else {
      setStep('export');
    }
  }, [tailoringRun, router, setStep]);

  if (!tailoringRun) {
    return null;
  }

  const unconfirmedRiskyBulletCount = tailoringRun.tailoredResume?.tailoredExperience.flatMap((entry) =>
    entry.bullets.filter((bullet) =>
      (bullet.riskFlag || bullet.confidence === 'low') && bullet.userConfirmed !== true
    )
  ).length ?? 0;

  const hasUnconfirmedRiskyBullets = unconfirmedRiskyBulletCount > 0;
  const exportDisabled = !confirmed || isExporting || hasUnconfirmedRiskyBullets;
  const disabledReason = hasUnconfirmedRiskyBullets
    ? `Confirm ${unconfirmedRiskyBulletCount} risky or low-confidence bullet(s) on the Review page before exporting.`
    : !confirmed
    ? 'Check the verification box to enable export.'
    : undefined;

  const handleExport = async (type: 'tailored' | 'comparison') => {
    setExportError(null);
    setIsExporting(true);

    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, tailoringRun }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'PDF export failed');
      }

      const blob = await response.blob();
      const filename = parseFilename(response.headers.get('Content-Disposition'));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);

      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      anchor.dispatchEvent(clickEvent);

      if (!clickEvent.defaultPrevented && !anchor.hasAttribute('download')) {
        window.open(url, '_blank', 'noopener');
      }

      setTimeout(() => {
        URL.revokeObjectURL(url);
        anchor.remove();
      }, 1000);
    } catch (error: unknown) {
      console.error('Export failed', error);
      const message = error instanceof Error ? error.message : String(error);
      setExportError(message || 'Failed to download PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <StepIndicator />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Export Tailored Resume</h1>
          <p className="text-muted-foreground">
            Download your tailored resume and comparison report.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please review all changes carefully before exporting. You are responsible for the accuracy of all content in your resume.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>
              Confirm that you have reviewed and verified all content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <Label htmlFor="confirm" className="text-sm font-normal leading-relaxed">
                I have reviewed and verified all content is truthful and accurate. I understand that I am responsible for all information in my resume.
              </Label>
            </div>

            {confirmed && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Ready to export</span>
              </div>
            )}
          </CardContent>
        </Card>

        {exportError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        {hasUnconfirmedRiskyBullets && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {unconfirmedRiskyBulletCount} risky or low-confidence bullet(s) still require review on the Review page.
            </AlertDescription>
          </Alert>
        )}

        <PDFExportButton
          disabled={exportDisabled}
          disabledReason={disabledReason}
          onExport={handleExport}
        />

        <Card>
          <CardContent className="pt-6">
            <Button variant="outline" onClick={() => router.push(ROUTES.input)}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
