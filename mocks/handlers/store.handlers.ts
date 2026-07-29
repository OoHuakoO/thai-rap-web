import { http, HttpResponse } from 'msw';
import {
  storeDb,
  STORE_TARGET_TOTAL,
  hasReachedStatus,
  nextMockFileId,
} from '../fixtures/store.fixtures';
import { assessmentDb } from '../fixtures/assessment.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import { createStoreFromDto } from '../factories/store.factory';
import {
  getScenario,
  getMockUserId,
  unauthorized,
  forbidden,
  serverError,
  validationError,
} from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import { ROLES } from '@/types/auth.types';
import type { Role } from '@/types/auth.types';
import type { User } from '@/features/user/types/user.types';
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreStatus,
  StoreStats,
  StoreDocument,
} from '@/features/store/types/store.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/stores`;

function notFound(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'STORE_001', message: 'ไม่พบร้านค้า' } },
    { status: HTTP_STATUS.NOT_FOUND }
  );
}

function fileRequired(): Response {
  return validationError([{ field: 'file', message: 'File is required' }]);
}

function inUse(message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'STORE_010', message } },
    { status: HTTP_STATUS.CONFLICT }
  );
}

const STATS_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ENTREPRENEUR];

// Who is asking, resolved from the mock bearer token. Ownership and assignment
// links live on the user record — userDb is what the /users dialogs write — so
// everything below reads them from there. A request with no mock token stays
// unscoped: the handler tests call these endpoints without signing in.
function getCaller(request: Request): User | null {
  const id = getMockUserId(request);
  return id ? userDb.findById(id) : null;
}

// The seed stores carry no ownerId of their own — the link lives on the user
// record, which is what the /users assignment dialog writes. Resolving it here
// on every read keeps the two from drifting apart. A store created through
// POST /stores sets its own ownerId and wins, because STORE_LINKS in
// user.fixtures.ts only knows the five seed stores.
function withOwner(store: Store): Store {
  if (store.ownerId) return store;
  const owner = userDb.getAll().find((u) => u.ownedStoreIds.includes(store.id));
  return { ...store, ownerId: owner?.id ?? null };
}

// Mirrors StoreService.listScope / assertVisible: an ENTREPRENEUR sees only the
// stores it owns and an ASSESSOR only the ones assigned to it, in the list and
// on a direct id alike. Takes an owner-resolved store, never a raw fixture row.
function isVisibleTo(store: Store, caller: User | null): boolean {
  if (caller?.role === ROLES.ENTREPRENEUR) return store.ownerId === caller.id;
  if (caller?.role === ROLES.ASSESSOR) return caller.assignedStoreIds.includes(store.id);
  return true;
}

// What a VIEWER gets — the API's PublicStoreResult, where the private keys are
// absent rather than null (StoreService.applyFieldScope). Written out field by
// field, like the API, so a key added to Store later is private until it is
// named here. Same list as PUBLIC_STORE_FIELDS in constants/permissions.ts plus
// the three the API keeps that are not display fields: id, ownerId, coverUrl.
function toPublicStore(store: Store): Partial<Store> {
  return {
    id: store.id,
    ownerId: store.ownerId,
    code: store.code,
    name: store.name,
    province: store.province,
    storeType: store.storeType,
    socialLinks: store.socialLinks,
    goals: store.goals,
    menuPhotos: store.menuPhotos,
    coverUrl: store.coverUrl,
    storePhotos: store.storePhotos,
    status: store.status,
  };
}

function toPayload(store: Store, caller: User | null): Store | Partial<Store> {
  return caller?.role === ROLES.VIEWER ? toPublicStore(store) : store;
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

    const caller = getCaller(request);

    let stores = storeDb.getAll().map(withOwner);
    stores = stores.filter((s) => isVisibleTo(s, caller));
    if (search) {
      stores = stores.filter(
        (s) =>
          s.code.toLowerCase().includes(search) ||
          s.name.toLowerCase().includes(search) ||
          (s.ownerName?.toLowerCase().includes(search) ?? false)
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

    return HttpResponse.json<PaginatedResponse<Store | Partial<Store>>>({
      items: stores.slice(start, start + limit).map((s) => toPayload(s, caller)),
      meta: { page, limit, total, totalPages },
    });
  }),

  http.get(`${BASE_URL}/stats`, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    // Only the roles that can open the web /stores page may read this
    // (StoreService.getStats): admin roles and ENTREPRENEUR, everyone else 403.
    const caller = getCaller(request);
    if (caller && !STATS_ROLES.includes(caller.role)) return forbidden();

    // Deliberately not narrowed to the caller's stores, matching the API: this
    // is a programme-wide aggregate, not a listing of anyone's records.
    const stores = storeDb.getAll();
    const total = stores.length;
    // The real API counts a store as "assessed Tn" when it has a submitted Tn
    // assessment. The mock's assessmentDb starts empty, so we proxy each round
    // off the store's incubation status milestone instead: T0/T1 by their own
    // *_COMPLETED status, T2 by FIELD_AUDITED (Field Audit), T3 by IDP_CREATED
    // (post-audit follow-up). hasReachedStatus is inclusive, so later stages
    // still count toward earlier rounds.
    const t0CompletedCount = stores.filter((s) =>
      hasReachedStatus(s.status, 'T0_COMPLETED')
    ).length;
    const t1CompletedCount = stores.filter((s) =>
      hasReachedStatus(s.status, 'T1_COMPLETED')
    ).length;
    const t2CompletedCount = stores.filter((s) =>
      hasReachedStatus(s.status, 'FIELD_AUDITED')
    ).length;
    const t3CompletedCount = stores.filter((s) => hasReachedStatus(s.status, 'IDP_CREATED')).length;

    const storeTypes = Array.from(
      new Set(stores.map((s) => s.storeType).filter((t): t is string => t !== null))
    ).sort((a, b) => a.localeCompare(b, 'th'));

    return HttpResponse.json<StoreStats>({
      total,
      targetTotal: STORE_TARGET_TOTAL,
      t0CompletedCount,
      t1CompletedCount,
      t2CompletedCount,
      t3CompletedCount,
      storeTypes,
    });
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'server-error') return serverError();

    const found = storeDb.findById(params.id as string);
    if (!found) return notFound();

    const caller = getCaller(request);
    const store = withOwner(found);
    // 403, not 404: the store exists, this caller is simply outside its scope —
    // the same answer StoreService.assertVisible gives.
    if (!isVisibleTo(store, caller)) return forbidden();

    return HttpResponse.json<Store | Partial<Store>>(toPayload(store, caller));
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

    // StoreService.create forces ownership to the caller for an ENTREPRENEUR —
    // without it a store would vanish from its own creator's list on the next
    // GET /stores, which is now ownership-scoped.
    const caller = getCaller(request);
    const created = createStoreFromDto(body);
    const store =
      caller?.role === ROLES.ENTREPRENEUR ? { ...created, ownerId: caller.id } : created;
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

    const store = storeDb.findById(params.id as string);
    if (!store) return notFound();

    // Mirrors StoreService.assertDeletable — neither relation cascades on the API
    // side, so a store carrying either is a 409, not a successful delete.
    const assessments = assessmentDb.findAllByStore(store.id);
    if (assessments.length > 0) {
      return inUse(`ไม่สามารถลบร้านนี้ได้ เพราะมีข้อมูลการประเมินอยู่ ${assessments.length} รายการ`);
    }
    if (store.documents.length > 0) {
      return inUse(
        `ไม่สามารถลบร้านนี้ได้ เพราะมีเอกสารแนบอยู่ ${store.documents.length} รายการ กรุณาลบเอกสารก่อน`
      );
    }

    storeDb.remove(store.id);
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
