import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_BANDS,
  PITCHING_LEVEL_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import type { PitchingRound } from '../types/pitching.types';

interface PitchingLevelBandsProps {
  round: PitchingRound;
}

export function PitchingLevelBands({ round }: PitchingLevelBandsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.levelBandsTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{PITCHING_TEXT.levelBandRangeColumn}</TableHead>
                <TableHead className="w-40">{PITCHING_TEXT.levelBandLevelColumn}</TableHead>
                <TableHead>{PITCHING_TEXT.levelBandGuidanceColumn}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PITCHING_LEVEL_BANDS[round].map((band) => (
                <TableRow key={band.level}>
                  <TableCell className="whitespace-nowrap font-medium">{band.range}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[band.level]}>
                      {PITCHING_LEVEL_LABELS[band.level]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{band.guidance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {round === 'ACCELERATION' && (
          <p className="text-xs text-muted-foreground">{PITCHING_TEXT.levelBandTieBreak}</p>
        )}
      </CardContent>
    </Card>
  );
}
