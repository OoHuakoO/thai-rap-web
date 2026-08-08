import { userHandlers } from './user.handlers';
import { authHandlers } from './auth.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { newsHandlers } from './news.handlers';
import { pitchingHandlers } from './pitching.handlers';
import { reportHandlers } from './report.handlers';
import { storeHandlers } from './store.handlers';
import { assessmentHandlers } from './assessment.handlers';
import { analyticsHandlers } from './analytics.handlers';
import { provinceHandlers } from './province.handlers';
import { storeTypeHandlers } from './store-type.handlers';
import { uploadHandlers } from './upload.handlers';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...newsHandlers,
  ...pitchingHandlers,
  ...reportHandlers,
  ...userHandlers,
  ...storeHandlers,
  ...assessmentHandlers,
  ...analyticsHandlers,
  ...provinceHandlers,
  ...storeTypeHandlers,
  ...uploadHandlers,
];
