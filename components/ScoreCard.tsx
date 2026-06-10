'use client';

import { MatchScore } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScoreCardProps {
  score: MatchScore;
  label: string;
}

export function ScoreCard({ score, label }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Match score breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
            {score.overallScore}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <Progress value={score.overallScore} className="h-2" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Skill Coverage</span>
            <span className="font-medium">{score.skillCoverageScore}</span>
          </div>
          <Progress value={score.skillCoverageScore} className="h-1" />
          
          {score.preferredSkillCoverageScore && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preferred Skills</span>
                <span className="font-medium">{score.preferredSkillCoverageScore}</span>
              </div>
              <Progress value={score.preferredSkillCoverageScore} className="h-1" />
            </>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Responsibility Alignment</span>
            <span className="font-medium">{score.responsibilityAlignmentScore}</span>
          </div>
          <Progress value={score.responsibilityAlignmentScore} className="h-1" />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Keywords</span>
            <span className="font-medium">{score.keywordScore}</span>
          </div>
          <Progress value={score.keywordScore} className="h-1" />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Seniority</span>
            <span className="font-medium">{score.seniorityScore}</span>
          </div>
          <Progress value={score.seniorityScore} className="h-1" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{score.explanation}</p>
          
          {score.criticalMissingRequirements.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Critical Missing:</p>
              <div className="flex flex-wrap gap-1">
                {score.criticalMissingRequirements.map((req) => (
                  <Badge key={req} variant="destructive">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
