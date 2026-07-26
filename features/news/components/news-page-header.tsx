import { NEWS_FORM_TEXT, NEWS_TEXT } from '../constants/news.constants';

type NewsPageMode = 'list' | 'create' | 'edit';

const TITLE_BY_MODE: Record<NewsPageMode, string> = {
  list: NEWS_TEXT.pageTitle,
  create: NEWS_FORM_TEXT.createTitle,
  edit: NEWS_FORM_TEXT.editTitle,
};

interface NewsPageHeaderProps {
  mode: NewsPageMode;
}

export function NewsPageHeader({ mode }: NewsPageHeaderProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main">{TITLE_BY_MODE[mode]}</h1>
      {mode === 'list' && <p className="text-sm text-charcoal">{NEWS_TEXT.pageDescription}</p>}
    </div>
  );
}
