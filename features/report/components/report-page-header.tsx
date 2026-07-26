import { REPORT_TEXT } from '../constants/report.constants';

export function ReportPageHeader() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main">{REPORT_TEXT.pageTitle}</h1>
      <p className="text-sm text-charcoal">{REPORT_TEXT.pageDescription}</p>
    </div>
  );
}
