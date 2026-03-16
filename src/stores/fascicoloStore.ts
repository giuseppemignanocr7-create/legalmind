import { create } from 'zustand'
import type { Fascicolo, StatoFascicolo, MateriaLegale } from '@/types'

interface FascicoloFilters {
  stato?: StatoFascicolo
  materia?: MateriaLegale
  avvocato?: string
  search?: string
}

interface FascicoloState {
  fascicoli: Fascicolo[]
  currentFascicolo: Fascicolo | null
  filters: FascicoloFilters
  isLoading: boolean
  setFascicoli: (fascicoli: Fascicolo[]) => void
  setCurrentFascicolo: (fascicolo: Fascicolo | null) => void
  setFilters: (filters: Partial<FascicoloFilters>) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  addFascicolo: (fascicolo: Fascicolo) => void
  updateFascicolo: (id: string, updates: Partial<Fascicolo>) => void
  removeFascicolo: (id: string) => void
}

export const useFascicoloStore = create<FascicoloState>((set) => ({
  fascicoli: [],
  currentFascicolo: null,
  filters: {},
  isLoading: false,
  setFascicoli: (fascicoli) => set({ fascicoli }),
  setCurrentFascicolo: (fascicolo) => set({ currentFascicolo: fascicolo }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setLoading: (isLoading) => set({ isLoading }),
  addFascicolo: (fascicolo) => set((s) => ({ fascicoli: [fascicolo, ...s.fascicoli] })),
  updateFascicolo: (id, updates) => set((s) => ({
    fascicoli: s.fascicoli.map((f) => f.id === id ? { ...f, ...updates } : f),
    currentFascicolo: s.currentFascicolo?.id === id ? { ...s.currentFascicolo, ...updates } : s.currentFascicolo,
  })),
  removeFascicolo: (id) => set((s) => ({
    fascicoli: s.fascicoli.filter((f) => f.id !== id),
    currentFascicolo: s.currentFascicolo?.id === id ? null : s.currentFascicolo,
  })),
}))
