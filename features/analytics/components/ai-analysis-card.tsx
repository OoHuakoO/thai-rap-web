'use client';

import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AI_ANALYSIS_TEXT } from '../constants/analytics-text.constants';
import { toBulletLines } from '../utils/to-bullet-lines';

interface AiAnalysisCardProps {
  aiAnalysis: string | null;
  aiInsight?: string | null;
}

export function AiAnalysisCard({ aiAnalysis, aiInsight }: AiAnalysisCardProps) {
  const [isOpen, setOpen] = useState(false);
  const bullets = toBulletLines(aiAnalysis);

  return (
    <>
      <Card className="flex h-full flex-col bg-purple-banner/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-purple-banner">
            {AI_ANALYSIS_TEXT.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-banner text-white">
              <Cpu className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              {bullets.length === 0 ? (
                <p className="text-xs text-muted-foreground">{AI_ANALYSIS_TEXT.empty}</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-charcoal">
                  {bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
              {aiInsight && (
                <p className="text-xs leading-relaxed text-charcoal">
                  <span className="font-bold text-purple-banner">
                    {AI_ANALYSIS_TEXT.insightPrefix}
                  </span>{' '}
                  {aiInsight}
                </p>
              )}
            </div>
          </div>

          {bullets.length > 0 && (
            <div className="mt-auto flex justify-center pt-1">
              <Button
                size="sm"
                className="bg-purple-banner text-white hover:bg-purple-banner/90"
                onClick={() => setOpen(true)}
              >
                {AI_ANALYSIS_TEXT.footerAction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{AI_ANALYSIS_TEXT.dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-charcoal">
            <ul className="list-disc space-y-1.5 pl-5">
              {bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {aiInsight && (
              <p className="rounded-lg bg-purple-banner/10 p-3">
                <span className="font-bold text-purple-banner">
                  {AI_ANALYSIS_TEXT.insightPrefix}
                </span>{' '}
                {aiInsight}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {AI_ANALYSIS_TEXT.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
