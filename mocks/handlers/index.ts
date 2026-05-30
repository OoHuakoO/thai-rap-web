import { userHandlers } from './user.handlers'
import { authHandlers } from './auth.handlers'
import { dashboardHandlers } from './dashboard.handlers'

export const handlers = [...authHandlers, ...dashboardHandlers, ...userHandlers]
