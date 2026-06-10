'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JDInput({ value, onChange }: JDInputProps) {
  const charCount = value.length;
  const minChars = 100;
  const isValid = charCount >= minChars;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          Paste the job description here. Minimum {minChars} characters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="jd-text">Job Description</Label>
        <Textarea
          id="jd-text"
          placeholder="Paste the job description here..."
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
