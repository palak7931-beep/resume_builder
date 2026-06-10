'use client';

import { useState } from 'react';
import { BulletRewrite } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface BulletChangeCardProps {
  bullet: BulletRewrite;
  onConfirm?: () => void;
}

export function BulletChangeCard({ bullet, onConfirm }: BulletChangeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChanged = bullet.original !== bullet.tailored;
  const needsConfirmation = bullet.riskFlag || bullet.confidence === 'low';
  const isConfirmed = bullet.userConfirmed === true;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${hasChanged ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <div className="space-y-3">
        {/* Original bullet */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Original:</span> {bullet.original}
        </div>
        
        {/* Tailored bullet */}
        <div className={`text-sm ${hasChanged ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
          <span className="font-medium">Tailored:</span> {bullet.tailored}
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={getConfidenceColor(bullet.confidence)}>
            Confidence: {bullet.confidence}
          </Badge>
          
          {bullet.riskFlag && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {bullet.riskFlag}
            </Badge>
          )}

          {needsConfirmation && (
            <div className="flex flex-wrap gap-2 items-center">
              {isConfirmed ? (
                <Badge variant="outline" className="text-xs">
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Review required
                </Badge>
              )}
              {!isConfirmed && onConfirm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onConfirm}
                  className="h-6 text-xs"
                >
                  Mark as reviewed
                </Button>
              )}
            </div>
          )}

          {(hasChanged || bullet.keywordsAddressed.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 text-xs"
            >
              {isExpanded ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Hide details</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" /> Show details</>
              )}
            </Button>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm">
              <span className="font-medium">Change Reason:</span> {bullet.changeReason}
            </div>
            
            {bullet.keywordsAddressed.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Keywords Addressed:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bullet.keywordsAddressed.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
