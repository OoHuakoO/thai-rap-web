'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MENTOR_RECOMMENDATIONS_TEXT } from '../constants/analytics-text.constants';

interface MentorRecommendationsCardProps {
  recommendations: string[];
}

export function MentorRecommendationsCard({ recommendations }: MentorRecommendationsCardProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Card className="flex h-full flex-col bg-purple-banner/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-purple-banner">
            {MENTOR_RECOMMENDATIONS_TEXT.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-banner text-white">
              <UserRound className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              {recommendations.length === 0 ? (
                <p className="text-xs text-muted-foreground">{MENTOR_RECOMMENDATIONS_TEXT.empty}</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-charcoal">
                  {recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="mt-auto flex justify-center pt-1">
              <Button
                size="sm"
                className="bg-purple-banner text-white hover:bg-purple-banner/90"
                onClick={() => setOpen(true)}
              >
                {MENTOR_RECOMMENDATIONS_TEXT.footerAction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{MENTOR_RECOMMENDATIONS_TEXT.dialogTitle}</DialogTitle>
          </DialogHeader>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-charcoal">
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {MENTOR_RECOMMENDATIONS_TEXT.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
