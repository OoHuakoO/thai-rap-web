import { http, HttpResponse } from 'msw';
import {
  dashboardKpi,
  provinceDistribution,
  top20Stores,
  incubationSteps,
  provinceComparison,
  activityItems,
  reportsStatus,
} from '../fixtures/dashboard.fixtures';
import { getScenario, unauthorized, forbidden, serverError } from '../utils/scenario';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/dashboard`;

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

export const dashboardHandlers = [
  http.get(`${BASE_URL}/kpi`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(dashboardKpi);
  }),

  http.get(`${BASE_URL}/province-distribution`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(provinceDistribution);
  }),

  http.get(`${BASE_URL}/top20`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(top20Stores);
  }),

  http.get(`${BASE_URL}/incubation-steps`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(incubationSteps);
  }),

  http.get(`${BASE_URL}/province-comparison`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(provinceComparison);
  }),

  http.get(`${BASE_URL}/activity`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(activityItems);
  }),

  http.get(`${BASE_URL}/reports-status`, ({ request }) => {
    return checkScenario(request) ?? HttpResponse.json(reportsStatus);
  }),
];
