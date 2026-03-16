import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  coreMindPanelOpen: boolean
  commandPaletteOpen: boolean
  activeModal: string | null
  modalData: Record<string, unknown> | null
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleCoreMindPanel: () => void
  setCoreMindPanelOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  openModal: (modal: string, data?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  coreMindPanelOpen: false,
  commandPaletteOpen: false,
  activeModal: null,
  modalData: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  toggleCoreMindPanel: () => set((s) => ({ coreMindPanelOpen: !s.coreMindPanelOpen })),
  setCoreMindPanelOpen: (open) => set({ coreMindPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  openModal: (modal, data) => set({ activeModal: modal, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))
