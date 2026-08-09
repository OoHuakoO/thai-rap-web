import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storeService } from '@/features/store/services/store.service';
import type { Store } from '@/features/store';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/types/auth.types';
import { pitchingService } from '../services/pitching.service';
import { PitchingFormPanel } from './pitching-form-panel';

vi.mock('@/features/store/services/store.service');
vi.mock('../services/pitching.service');

function store(id: string, name: string): Store {
  return {
    id,
    code: `RAP69-${id}`,
    name,
    province: 'จันทบุรี',
    storeType: 'อาหารไทย',
    ownerName: null,
    phone: null,
    email: null,
    address: null,
    socialLinks: {},
    avgRevenueMin: null,
    avgRevenueMax: null,
    mainProblems: [],
    goals: [],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
    documents: [],
    status: 'T1_COMPLETED',
    ownerId: null,
    latestScore: null,
    latestAssessorName: null,
    latestAssessedAt: null,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  };
}

const STORES = [store('store-1', 'บ้านริมน้ำ จันทบุรี'), store('store-2', 'ครัวบ้านคลอง')];

function renderPanel(initialStoreId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PitchingFormPanel round="PITCH_DECK" initialStoreId={initialStoreId} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: { id: 'u1', name: 'ทดสอบ', email: 'test@example.com', role: ROLES.JUDGE },
    isAuthenticated: true,
  });
  vi.mocked(storeService.getAll).mockResolvedValue({
    items: STORES,
    meta: { page: 1, limit: 100, total: STORES.length, totalPages: 1 },
  });
  vi.mocked(pitchingService.findMine).mockResolvedValue(null);
});

describe('PitchingFormPanel', () => {
  it('opens on the store the dashboard linked to', async () => {
    renderPanel('store-2');

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'เลือกร้าน' })).toHaveTextContent('ครัวบ้านคลอง')
    );
    expect(pitchingService.findMine).toHaveBeenCalledWith('store-2', 'PITCH_DECK', 'u1');
  });

  it('falls back to the first store when the linked one is out of scope', async () => {
    renderPanel('store-999');

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'เลือกร้าน' })).toHaveTextContent(
        'บ้านริมน้ำ จันทบุรี'
      )
    );
    expect(pitchingService.findMine).not.toHaveBeenCalledWith(
      'store-999',
      'PITCH_DECK',
      expect.anything()
    );
  });
});
