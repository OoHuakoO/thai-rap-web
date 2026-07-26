import { userHandlers } from './user.handlers';
import { authHandlers } from './auth.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { newsHandlers } from './news.handlers';
import { reportHandlers } from './report.handlers';
import { storeHandlers } from './store.handlers';
import { assessmentHandlers } from './assessment.handlers';
import { analyticsHandlers } from './analytics.handlers';
import { provinceHandlers } from './province.handlers';
import { uploadHandlers } from './upload.handlers';
import { accessControlHandlers } from './access-control.handlers';

export const handlers = [
  ...authHandlers,
  ...accessControlHandlers,
  ...dashboardHandlers,
  ...newsHandlers,
  ...reportHandlers,
  ...userHandlers,
  ...storeHandlers,
  ...assessmentHandlers,
  ...analyticsHandlers,
  ...provinceHandlers,
  ...uploadHandlers,
];
