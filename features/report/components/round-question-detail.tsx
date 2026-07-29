'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { REPORT_TEXT } from '../constants/report.constants';
import type { ReportDimensionDetail } from '../types/report.types';

interface RoundQuestionDetailProps {
  dimensions: ReportDimensionDetail[];
}

/** The 50-question breakdown, one collapsible block per dimension. */
export function RoundQuestionDetail({ dimensions }: RoundQuestionDetailProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{REPORT_TEXT.questionSection}</CardTitle>
        <p className="text-xs text-charcoal">{REPORT_TEXT.questionSectionHint}</p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {dimensions.map((dimension) => (
            <AccordionItem key={dimension.dimensionId} value={String(dimension.dimensionId)}>
              <AccordionTrigger className="text-sm">
                <span className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-2 text-left">
                  <span className="font-medium text-text-main">{dimension.dimensionName}</span>
                  <span className="text-xs tabular-nums text-charcoal">
                    {dimension.rawScore}/{dimension.maxScore} ·{' '}
                    {REPORT_TEXT.weightedFormula(
                      dimension.scorePct,
                      dimension.weight,
                      dimension.weightedScore
                    )}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">{REPORT_TEXT.questionNoColumn}</TableHead>
                        <TableHead>{REPORT_TEXT.questionTextColumn}</TableHead>
                        <TableHead className="text-right">
                          {REPORT_TEXT.questionScoreColumn}
                        </TableHead>
                        <TableHead className="text-right">{REPORT_TEXT.maxScoreColumn}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dimension.questions.map((question) => (
                        <TableRow key={question.questionNo}>
                          <TableCell className="tabular-nums">{question.questionNo}</TableCell>
                          <TableCell className="text-charcoal">{question.questionText}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {question.rawScore ?? REPORT_TEXT.noData}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {question.maxScore}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell />
                        <TableCell>
                          {REPORT_TEXT.dimensionSubtotal} —{' '}
                          {REPORT_TEXT.weightedFormula(
                            dimension.scorePct,
                            dimension.weight,
                            dimension.weightedScore
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {dimension.rawScore}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {dimension.maxScore}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
