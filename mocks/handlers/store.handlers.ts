import { http, HttpResponse } from 'msw';
import {
  storeDb,
  STORE_TARGET_TOTAL,
  hasReachedStatus,
  nextMockFileId,
} from '../fixtures/store.fixtures';
import { createStoreFromDto } from '../factories/store.factory';
import {
  getScenario,
  unauthorized,
  forbidden,
  serverError,
  validationError,
} from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreStatus,
  StoreStats,
  StoreDocument,
  ProvinceDistribution,
} from '@/features/store/types/store.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/stores`;

function notFound(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'STORE_001', message: 'Store not found' } },
    { status: HTTP_STATUS.NOT_FOUND }
  );
}

function fileRequired(): Response {
  return validationError([{ field: 'file', message: 'File is required' }]);
}

const REQUIRED_STORE_FIELDS: { field: keyof CreateStoreDto; message: string }[] = [
  { field: 'name', message: 'Name is required' },
  { field: 'province', message: 'Province is required' },
  { field: 'storeType', message: 'Store type is required' },
  { field: 'ownerName', message: 'Owner name is required' },
  { field: 'phone', message: 'Phone is required' },
  { field: 'address', message: 'Address is required' },
];

export const storeHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const province = url.searchParams.get('province');
    const storeType = url.searchParams.get('storeType');
    const status = url.searchParams.get('status');

    let stores = storeDb.getAll();
    if (search) {
      stores = stores.filter(
        (s) => s.name.toLowerCase().includes(search) || s.ownerName.toLowerCase().includes(search)
      );
    }
    if (province) stores = stores.filter((s) => s.province === province);
    if (storeType) stores = stores.filter((s) => s.storeType === storeType);
    if (status) stores = stores.filter((s) => s.status === status);

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const total = stores.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;

    return HttpResponse.json<PaginatedResponse<Store>>({
      items: stores.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    });
  }),

  http.get(`${BASE_URL}/stats`, ({ request }) => {
    const scenario = getScenario(request);
    // API forbids ENTREPRENEUR from this endpoint (403 PERM_001) — simulate via
    // X-Mock-Scenario: forbidden, same as every other write/read gate below.
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const stores = storeDb.getAll();
    const total = stores.length;
    // Both counts use the same "has this store reached stage X" rule, so a
    // store that has since moved past T1_COMPLETED (e.g. SELECTED) still
    // counts toward t1CompletedCount instead of only exact status matches.
    const t0CompletedCount = stores.filter((s) =>
      hasReachedStatus(s.status, 'T0_COMPLETED')
    ).length;
    const t1CompletedCount = stores.filter((s) =>
      hasReachedStatus(s.status, 'T1_COMPLETED')
    ).length;
    const passedCount = stores.filter((s) =>
      ['SELECTED', 'CONDITIONAL_SELECTED'].includes(s.status)
    ).length;

    const provinceCounts = new Map<string, number>();
    for (const s of stores) {
      provinceCounts.set(s.province, (provinceCounts.get(s.province) ?? 0) + 1);
    }
    const byProvince: ProvinceDistribution[] = Array.from(provinceCounts.entries())
      .map(([province, count]) => ({
        province,
        count,
        pct: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const storeTypes = Array.from(new Set(stores.map((s) => s.storeType))).sort((a, b) =>
      a.localeCompare(b, 'th')
    );

    return HttpResponse.json<StoreStats>({
      total,
      targetTotal: STORE_TARGET_TOTAL,
      t0CompletedCount,
      t1CompletedCount,
      passedCount,
      byProvince,
      storeTypes,
    });
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'server-error') return serverError();

    const store = storeDb.findById(params.id as string);
    if (!store) return notFound();
    return HttpResponse.json<Store>(store);
  }),

  http.post(BASE_URL, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as CreateStoreDto;

    const missing = REQUIRED_STORE_FIELDS.filter(({ field }) => !body[field]);
    if (scenario === 'validation-error' || missing.length > 0) {
      return validationError(missing.map(({ field, message }) => ({ field, message })));
    }

    const store = createStoreFromDto(body);
    storeDb.create(store);
    return HttpResponse.json<Store>(store, { status: HTTP_STATUS.CREATED });
  }),

  http.patch(`${BASE_URL}/:id/status`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as { status: StoreStatus };
    if (scenario === 'validation-error' || !body.status) {
      return validationError([{ field: 'status', message: 'Status is required' }]);
    }

    const updated = storeDb.setStatus(params.id as string, body.status);
    if (!updated) return notFound();
    return HttpResponse.json<Store>(updated);
  }),

  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as UpdateStoreDto;
    const updated = storeDb.update(params.id as string, body);
    if (!updated) return notFound();
    return HttpResponse.json<Store>(updated);
  }),

  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const removed = storeDb.remove(params.id as string);
    if (!removed) return notFound();
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),

  http.post(`${BASE_URL}/:id/documents`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return fileRequired();

    const doc: StoreDocument = {
      id: `doc-${nextMockFileId()}`,
      filename: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      url: `/uploads/stores/${params.id}/documents/${file.name}`,
      uploadedAt: new Date().toISOString(),
    };
    const updated = storeDb.addDocument(params.id as string, doc);
    if (!updated) return notFound();
    return HttpResponse.json<StoreDocument>(doc, { status: HTTP_STATUS.CREATED });
  }),

  http.delete(`${BASE_URL}/:id/documents/:documentId`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const updated = storeDb.removeDocument(params.id as string, params.documentId as string);
    if (!updated) return notFound();
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),

  http.post(`${BASE_URL}/:id/menu-photos`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return fileRequired();

    const url = `/uploads/stores/${params.id}/menu-photos/${nextMockFileId()}-${file.name}`;
    const updated = storeDb.addMenuPhoto(params.id as string, url);
    if (!updated) return notFound();
    return HttpResponse.json<string[]>(updated.menuPhotos, { status: HTTP_STATUS.CREATED });
  }),

  http.delete(`${BASE_URL}/:id/menu-photos`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as { url: string };
    const updated = storeDb.removeMenuPhoto(params.id as string, body.url);
    if (!updated) return notFound();
    return HttpResponse.json<string[]>(updated.menuPhotos);
  }),

  http.post(`${BASE_URL}/:id/cover`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return fileRequired();

    const coverUrl = `/uploads/stores/${params.id}/cover/${nextMockFileId()}-${file.name}`;
    const updated = storeDb.setCover(params.id as string, coverUrl);
    if (!updated) return notFound();
    return HttpResponse.json<string>(coverUrl, { status: HTTP_STATUS.CREATED });
  }),

  http.delete(`${BASE_URL}/:id/cover`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const updated = storeDb.setCover(params.id as string, null);
    if (!updated) return notFound();
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),

  http.post(`${BASE_URL}/:id/store-photos`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return fileRequired();

    const url = `/uploads/stores/${params.id}/store-photos/${nextMockFileId()}-${file.name}`;
    const updated = storeDb.addStorePhoto(params.id as string, url);
    if (!updated) return notFound();
    return HttpResponse.json<string[]>(updated.storePhotos, { status: HTTP_STATUS.CREATED });
  }),

  http.delete(`${BASE_URL}/:id/store-photos`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as { url: string };
    const updated = storeDb.removeStorePhoto(params.id as string, body.url);
    if (!updated) return notFound();
    return HttpResponse.json<string[]>(updated.storePhotos);
  }),
];
