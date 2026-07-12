import { userHandlers } from './user.handlers';
import { authHandlers } from './auth.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { storeHandlers } from './store.handlers';
import { assessmentHandlers } from './assessment.handlers';
import { provinceHandlers } from './province.handlers';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...userHandlers,
  ...storeHandlers,
  ...assessmentHandlers,
  ...provinceHandlers,
];
