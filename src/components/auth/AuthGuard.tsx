import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/config/supabase'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, setLoading, setUser } = useAuthStore()

  useEffect(() => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

    if (isPlaceholder) {
      // Demo mode: set demo user and skip auth
      setUser({ id: 'demo-user', email: 'avvocato@legalmind.it' })
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! })
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setLoading, setUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center animate-pulse-gold">
            <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">Caricamento...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
