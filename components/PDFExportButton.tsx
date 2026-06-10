'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface PDFExportButtonProps {
  disabled?: boolean;
  disabledReason?: string;
  onExport?: (type: 'tailored' | 'comparison') => void;
}

export function PDFExportButton({ disabled = true, disabledReason, onExport }: PDFExportButtonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export PDFs</CardTitle>
        <CardDescription>
          Download your tailored resume and comparison report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            type="button"
            className="w-full"
            disabled={disabled}
            onClick={() => onExport?.('tailored')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Tailored Resume
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled}
            onClick={() => onExport?.('comparison')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Comparison Report
          </Button>
        </div>
        
        {disabled && (
          <p className="text-sm text-muted-foreground text-center">
            {disabledReason ?? 'Confirm your review and verification steps to enable downloads.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
