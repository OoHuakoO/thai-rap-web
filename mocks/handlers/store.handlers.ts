import { http, HttpResponse } from 'msw'
import { storeDb, STORE_TARGET_TOTAL } from '../fixtures/store.fixtures'
import { createStoreFromDto } from '../factories/store.factory'
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreStatus,
  StoreStats,
  StoreDocument,
  ProvinceDistribution,
} from '@/features/store/types/store.types'
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types'
import { API_URL } from '@/constants'

const BASE_URL = `${API_URL}/stores`

function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success'
}

function unauthorized(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'AUTH_003', message: 'Unauthorized' } },
    { status: 401 }
  )
}

function forbidden(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'PERM_001', message: 'Forbidden resource' } },
    { status: 403 }
  )
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
    { status: 500 }
  )
}

function notFound(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'STORE_001', message: 'Store not found' } },
    { status: 404 }
  )
}

export const storeHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'server-error') return serverError()

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const province = url.searchParams.get('province')
    const storeType = url.searchParams.get('storeType')
    const status = url.searchParams.get('status')

    let stores = storeDb.getAll()
    if (search) {
      stores = stores.filter(
        (s) => s.name.toLowerCase().includes(search) || s.ownerName.toLowerCase().includes(search)
      )
    }
    if (province) stores = stores.filter((s) => s.province === province)
    if (storeType) stores = stores.filter((s) => s.storeType === storeType)
    if (status) stores = stores.filter((s) => s.status === status)

    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 10)
    const total = stores.length
    const totalPages = Math.ceil(total / limit) || 1
    const start = (page - 1) * limit

    return HttpResponse.json<PaginatedResponse<Store>>({
      items: stores.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  http.get(`${BASE_URL}/stats`, ({ request }) => {
    const scenario = getScenario(request)
    if (scenario === 'server-error') return serverError()

    const stores = storeDb.getAll()
    const total = stores.length
    const t0CompletedCount = stores.filter((s) => s.latestScore !== null).length
    const t1CompletedCount = stores.filter((s) => s.status === 'T1_COMPLETED').length
    const passedCount = stores.filter((s) =>
      ['SELECTED', 'CONDITIONAL_SELECTED'].includes(s.status)
    ).length

    const provinceCounts = new Map<string, number>()
    for (const s of stores) {
      provinceCounts.set(s.province, (provinceCounts.get(s.province) ?? 0) + 1)
    }
    const byProvince: ProvinceDistribution[] = Array.from(provinceCounts.entries())
      .map(([province, count]) => ({
        province,
        count,
        pct: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)

    return HttpResponse.json<StoreStats>({
      total,
      targetTotal: STORE_TARGET_TOTAL,
      t0CompletedCount,
      t1CompletedCount,
      passedCount,
      byProvince,
    })
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'server-error') return serverError()

    const store = storeDb.findById(params.id as string)
    if (!store) return notFound()
    return HttpResponse.json<Store>(store)
  }),

  http.post(BASE_URL, async ({ request }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const body = (await request.json()) as CreateStoreDto
    const store = createStoreFromDto(body)
    storeDb.create(store)
    return HttpResponse.json<Store>(store, { status: 201 })
  }),

  http.patch(`${BASE_URL}/:id/status`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const body = (await request.json()) as { status: StoreStatus }
    const updated = storeDb.setStatus(params.id as string, body.status)
    if (!updated) return notFound()
    return HttpResponse.json<Store>(updated)
  }),

  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const body = (await request.json()) as UpdateStoreDto
    const updated = storeDb.update(params.id as string, body)
    if (!updated) return notFound()
    return HttpResponse.json<Store>(updated)
  }),

  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const removed = storeDb.remove(params.id as string)
    if (!removed) return notFound()
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(`${BASE_URL}/:id/documents`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return serverError()

    const doc: StoreDocument = {
      id: `doc-${Date.now()}`,
      filename: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      url: `/uploads/stores/${params.id}/documents/${file.name}`,
      uploadedAt: new Date().toISOString(),
    }
    const updated = storeDb.addDocument(params.id as string, doc)
    if (!updated) return notFound()
    return HttpResponse.json<StoreDocument>(doc, { status: 201 })
  }),

  http.delete(`${BASE_URL}/:id/documents/:documentId`, ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const updated = storeDb.removeDocument(params.id as string, params.documentId as string)
    if (!updated) return notFound()
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(`${BASE_URL}/:id/photos`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return serverError()

    const url = `/uploads/stores/${params.id}/photos/${file.name}`
    const updated = storeDb.addPhoto(params.id as string, url)
    if (!updated) return notFound()
    return HttpResponse.json<string[]>(updated.photos, { status: 201 })
  }),

  http.delete(`${BASE_URL}/:id/photos`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const body = (await request.json()) as { url: string }
    const updated = storeDb.removePhoto(params.id as string, body.url)
    if (!updated) return notFound()
    return HttpResponse.json<string[]>(updated.photos)
  }),

  http.post(`${BASE_URL}/:id/logo`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return serverError()

    const logoUrl = `/uploads/stores/${params.id}/logo/${file.name}`
    const updated = storeDb.setLogo(params.id as string, logoUrl)
    if (!updated) return notFound()
    return HttpResponse.json<string>(logoUrl, { status: 201 })
  }),

  http.delete(`${BASE_URL}/:id/logo`, ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const updated = storeDb.setLogo(params.id as string, null)
    if (!updated) return notFound()
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(`${BASE_URL}/:id/storefront-photos`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return serverError()

    const url = `/uploads/stores/${params.id}/storefront-photos/${file.name}`
    const updated = storeDb.addStorefrontPhoto(params.id as string, url)
    if (!updated) return notFound()
    return HttpResponse.json<string[]>(updated.storefrontPhotos, { status: 201 })
  }),

  http.delete(`${BASE_URL}/:id/storefront-photos`, async ({ request, params }) => {
    const scenario = getScenario(request)
    if (scenario === 'unauthorized') return unauthorized()
    if (scenario === 'forbidden') return forbidden()
    if (scenario === 'server-error') return serverError()

    const body = (await request.json()) as { url: string }
    const updated = storeDb.removeStorefrontPhoto(params.id as string, body.url)
    if (!updated) return notFound()
    return HttpResponse.json<string[]>(updated.storefrontPhotos)
  }),
]
