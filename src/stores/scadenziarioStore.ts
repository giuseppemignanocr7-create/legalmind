import { create } from 'zustand'
import type { Scadenza, UrgenzaScadenza, TipoScadenza } from '@/types'

interface ScadenziarioFilters {
  urgenza?: UrgenzaScadenza
  tipo?: TipoScadenza
  assegnato?: string
  dateFrom?: string
  dateTo?: string
}

interface ScadenziarioState {
  scadenze: Scadenza[]
  filters: ScadenziarioFilters
  viewMode: 'calendario' | 'lista'
  isLoading: boolean
  setScadenze: (scadenze: Scadenza[]) => void
  setFilters: (filters: Partial<ScadenziarioFilters>) => void
  resetFilters: () => void
  setViewMode: (mode: 'calendario' | 'lista') => void
  setLoading: (loading: boolean) => void
  addScadenza: (scadenza: Scadenza) => void
  updateScadenza: (id: string, updates: Partial<Scadenza>) => void
  removeScadenza: (id: string) => void
}

export const useScadenziarioStore = create<ScadenziarioState>((set) => ({
  scadenze: [],
  filters: {},
  viewMode: 'lista',
  isLoading: false,
  setScadenze: (scadenze) => set({ scadenze }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (isLoading) => set({ isLoading }),
  addScadenza: (scadenza) => set((s) => ({ scadenze: [scadenza, ...s.scadenze] })),
  updateScadenza: (id, updates) => set((s) => ({
    scadenze: s.scadenze.map((sc) => sc.id === id ? { ...sc, ...updates } : sc),
  })),
  removeScadenza: (id) => set((s) => ({
    scadenze: s.scadenze.filter((sc) => sc.id !== id),
  })),
}))
