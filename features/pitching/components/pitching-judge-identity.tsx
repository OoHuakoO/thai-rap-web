import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/get-initials';

interface PitchingJudgeIdentityProps {
  judgeName: string;
}

/**
 * Avatar plus name. Stays visible even when the judge wrote nothing — a blank
 * form still has to say whose it is.
 */
export function PitchingJudgeIdentity({ judgeName }: PitchingJudgeIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-purple-banner/10 text-purple-banner">
          {getInitials(judgeName)}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 truncate text-sm font-semibold text-text-main">{judgeName}</p>
    </div>
  );
}
