import { create } from 'zustand'

export interface Notifica {
  id: string
  tipo: 'scadenza' | 'udienza' | 'normativa' | 'fascicolo' | 'sistema' | 'ai'
  titolo: string
  descrizione?: string
  urgenza: 'bassa' | 'media' | 'alta' | 'critica'
  letta: boolean
  link?: string
  created_at: string
}

interface NotificheState {
  notifiche: Notifica[]
  unreadCount: number
  panelOpen: boolean
  setNotifiche: (notifiche: Notifica[]) => void
  addNotifica: (notifica: Notifica) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
}

export const useNotificheStore = create<NotificheState>((set) => ({
  notifiche: [],
  unreadCount: 0,
  panelOpen: false,
  setNotifiche: (notifiche) => set({
    notifiche,
    unreadCount: notifiche.filter((n) => !n.letta).length,
  }),
  addNotifica: (notifica) => set((s) => ({
    notifiche: [notifica, ...s.notifiche],
    unreadCount: s.unreadCount + (notifica.letta ? 0 : 1),
  })),
  markAsRead: (id) => set((s) => ({
    notifiche: s.notifiche.map((n) => n.id === id ? { ...n, letta: true } : n),
    unreadCount: Math.max(0, s.unreadCount - (s.notifiche.find((n) => n.id === id && !n.letta) ? 1 : 0)),
  })),
  markAllAsRead: () => set((s) => ({
    notifiche: s.notifiche.map((n) => ({ ...n, letta: true })),
    unreadCount: 0,
  })),
  setPanelOpen: (open) => set({ panelOpen: open }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}))
