'use client';

import { GapAnalysis as GapAnalysisType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface GapAnalysisProps {
  gapAnalysis: GapAnalysisType;
}

export function GapAnalysis({ gapAnalysis }: GapAnalysisProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const highImportanceGaps = gapAnalysis.gaps.filter((g) => g.importance === 'high');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap Analysis</CardTitle>
        <CardDescription>
          Missing or weak requirements compared to the job description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {highImportanceGaps.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {highImportanceGaps.length} high-priority gap{highImportanceGaps.length > 1 ? 's' : ''} detected
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {gapAnalysis.gaps.map((gap, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium">{gap.name}</h4>
                <Badge variant={getImportanceColor(gap.importance) as any}>
                  {gap.importance}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-medium">JD Evidence:</span> {gap.jdEvidence}
                </p>
                {gap.resumeEvidence ? (
                  <p className="text-green-600">
                    <span className="font-medium">Resume Evidence:</span> {gap.resumeEvidence}
                  </p>
                ) : (
                  <p className="text-red-600">
                    <span className="font-medium">Resume Evidence:</span> Not found
                  </p>
                )}
                <p className="text-muted-foreground">
                  <span className="font-medium">Suggested Action:</span> {gap.suggestedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
