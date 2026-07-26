import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type {
  CreateNewsDto,
  NewsItem,
  NewsType,
  UpdateNewsDto,
} from '@/features/news/types/news.types';
import { createNewsFromDto } from '../factories/news.factory';
import { newsDb } from '../fixtures/news.fixtures';
import { forbidden, getScenario, notFound, serverError, unauthorized } from '../utils/scenario';

const BASE_URL = `${API_URL}/news`;

const NEWS_TYPES: NewsType[] = ['GENERAL', 'EVENT', 'ALERT'];

const NEWS_NOT_FOUND_CODE = 'NEWS_001';
const NEWS_NOT_FOUND_MESSAGE = 'ไม่พบข่าวประชาสัมพันธ์';

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

export const newsHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const params = new URL(request.url).searchParams;
    const type = NEWS_TYPES.find((value) => value === params.get('type'));
    const limit = Number(params.get('limit') ?? 0);

    let items = newsDb.getAll();
    if (type) items = items.filter((item) => item.type === type);
    if (limit > 0) items = items.slice(0, limit);

    return HttpResponse.json<NewsItem[]>(items);
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const item = newsDb.findById(String(params.id));
    if (!item) return notFound(NEWS_NOT_FOUND_CODE, NEWS_NOT_FOUND_MESSAGE);

    return HttpResponse.json<NewsItem>(item);
  }),

  http.post(BASE_URL, async ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const body = (await request.json()) as CreateNewsDto;
    return HttpResponse.json<NewsItem>(newsDb.create(createNewsFromDto(body)));
  }),

  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const body = (await request.json()) as UpdateNewsDto;
    const updated = newsDb.update(String(params.id), body);
    if (!updated) return notFound(NEWS_NOT_FOUND_CODE, NEWS_NOT_FOUND_MESSAGE);

    return HttpResponse.json<NewsItem>(updated);
  }),

  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    if (!newsDb.remove(String(params.id))) {
      return notFound(NEWS_NOT_FOUND_CODE, NEWS_NOT_FOUND_MESSAGE);
    }
    return HttpResponse.json(null);
  }),
];
