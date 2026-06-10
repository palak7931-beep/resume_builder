'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResumeInput({ value, onChange }: ResumeInputProps) {
  const charCount = value.length;
  const minChars = 100;
  const isValid = charCount >= minChars;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>
          Paste your resume text here. Minimum {minChars} characters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="resume-text">Resume Text</Label>
        <Textarea
          id="resume-text"
          placeholder="Paste your resume content here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <div className="flex justify-between text-sm">
          <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>
            {isValid ? '✓ Ready to analyze' : `Need at least ${minChars - charCount} more characters`}
          </span>
          <span className="text-muted-foreground">{charCount} characters</span>
        </div>
      </CardContent>
    </Card>
  );
}
