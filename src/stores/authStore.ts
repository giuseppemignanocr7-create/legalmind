import { create } from 'zustand'
import type { UserRole } from '@/types'

interface Profilo {
  id: string
  studio_id: string
  nome: string
  cognome: string
  ruolo: UserRole
  titolo?: string
  email_personale?: string
  avatar_url?: string
  specializzazioni?: string[]
  preferences?: Record<string, unknown>
}

interface Studio {
  id: string
  nome: string
  tipo: string
  partita_iva?: string
  subscription: string
  settings?: Record<string, unknown>
}

interface AuthState {
  user: { id: string; email: string } | null
  profilo: Profilo | null
  studio: Studio | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: { id: string; email: string } | null) => void
  setProfilo: (profilo: Profilo | null) => void
  setStudio: (studio: Studio | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profilo: null,
  studio: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfilo: (profilo) => set({ profilo }),
  setStudio: (studio) => set({ studio }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, profilo: null, studio: null, isAuthenticated: false }),
}))
