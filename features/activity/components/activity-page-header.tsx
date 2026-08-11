import { ACTIVITY_FORM_TEXT, ACTIVITY_TEXT } from '../constants/activity.constants';

type ActivityPageMode = 'list' | 'create' | 'edit';

const TITLE_BY_MODE: Record<ActivityPageMode, string> = {
  list: ACTIVITY_TEXT.pageTitle,
  create: ACTIVITY_FORM_TEXT.createTitle,
  edit: ACTIVITY_FORM_TEXT.editTitle,
};

interface ActivityPageHeaderProps {
  mode: ActivityPageMode;
}

export function ActivityPageHeader({ mode }: ActivityPageHeaderProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main">{TITLE_BY_MODE[mode]}</h1>
      {mode === 'list' && <p className="text-sm text-charcoal">{ACTIVITY_TEXT.pageDescription}</p>}
    </div>
  );
}
