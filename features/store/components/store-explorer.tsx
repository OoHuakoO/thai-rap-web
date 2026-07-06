'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { StoreList } from './store-list'
import { StoreDetail } from './store-detail'
import { CreateStoreForm } from './create-store-form'
import { STORE_STATUS_LABELS } from '../types/store.types'
import type { StoreStatus, StoreQueryParams } from '../types/store.types'

const STATUS_OPTIONS = Object.entries(STORE_STATUS_LABELS) as [StoreStatus, string][]

export function StoreExplorer() {
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const [status, setStatus] = useState<StoreStatus | 'ALL'>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const debouncedProvince = useDebounce(province, 300)

  const query: StoreQueryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(debouncedProvince && { province: debouncedProvince }),
    ...(status !== 'ALL' && { status }),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-[10px] text-muted-foreground">ค้นหา</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อร้าน, เจ้าของ..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="w-40">
          <label className="mb-1 block text-[10px] text-muted-foreground">จังหวัด</label>
          <Input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="ทั้งหมด"
          />
        </div>

        <div className="w-48">
          <label className="mb-1 block text-[10px] text-muted-foreground">สถานะ</label>
          <Select value={status} onValueChange={(v) => setStatus(v as StoreStatus | 'ALL')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              {STATUS_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="ml-auto gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          เพิ่มร้านอาหาร
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <StoreList query={query} selectedId={selectedId} onSelect={setSelectedId} />

        <div className="rounded-xl border bg-card shadow-sm">
          {selectedId ? (
            <div className="p-4">
              <StoreDetail storeId={selectedId} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground">
              <span className="text-4xl">🏪</span>
              <p className="text-sm">เลือกร้านอาหารเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มร้านอาหาร</DialogTitle>
          </DialogHeader>
          <CreateStoreForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
