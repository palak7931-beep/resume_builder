'use client';

import { TailoredExperienceEntry } from '@/lib/types';
import { BulletChangeCard } from './BulletChangeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SideBySideDiffProps {
  tailoredExperience: TailoredExperienceEntry[];
  onConfirmBullet?: (entryIndex: number, bulletIndex: number) => void;
}

export function SideBySideDiff({ tailoredExperience, onConfirmBullet }: SideBySideDiffProps) {
  return (
    <div className="space-y-6">
      {tailoredExperience.map((entry, entryIndex) => (
        <Card key={entryIndex}>
          <CardHeader>
            <CardTitle>
              {entry.title} at {entry.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.bullets.map((bullet, bulletIndex) => (
              <BulletChangeCard
                key={bulletIndex}
                bullet={bullet}
                onConfirm={() => onConfirmBullet?.(entryIndex, bulletIndex)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
