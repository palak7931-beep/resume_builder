'use client';

import { JobDescriptionProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JDSummaryPanelProps {
  jd: JobDescriptionProfile;
}

export function JDSummaryPanel({ jd }: JDSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description Summary</CardTitle>
        <CardDescription>Key requirements extracted from the job listing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{jd.jobTitle}</h3>
          {jd.company && <p className="text-muted-foreground">{jd.company}</p>}
          <Badge variant="secondary" className="mt-2">
            {jd.seniorityLevel.charAt(0).toUpperCase() + jd.seniorityLevel.slice(1)} Level
          </Badge>
        </div>

        <div>
          <h4 className="font-medium mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-1">
            {jd.requiredSkills.map((skill) => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {jd.preferredSkills.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Preferred Skills</h4>
            <div className="flex flex-wrap gap-1">
              {jd.preferredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Key Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {jd.responsibilities.slice(0, 3).map((resp) => (
              <li key={resp}>{resp}</li>
            ))}
            {jd.responsibilities.length > 3 && (
              <li className="text-muted-foreground">+{jd.responsibilities.length - 3} more</li>
            )}
          </ul>
        </div>

        {jd.tools.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {jd.tools.map((tool) => (
                <Badge key={tool} variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
