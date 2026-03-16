import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export function useAuth() {
  const navigate = useNavigate()
  const { user, profilo, setUser, setProfilo, setStudio, setLoading, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! })
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
          loadProfile(session.user.id)
        } else {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data: profilo } = await supabase
      .from('profili')
      .select(`*, studi_legali(*)`)
      .eq('id', userId)
      .single()

    if (profilo) {
      setProfilo({
        id: profilo.id,
        studio_id: profilo.studio_id,
        nome: profilo.nome,
        cognome: profilo.cognome,
        ruolo: profilo.ruolo,
        avatar_url: profilo.avatar_url,
        email_personale: profilo.email_personale,
      })
      if (profilo.studi_legali) {
        setStudio({
          id: profilo.studi_legali.id,
          nome: profilo.studi_legali.nome,
          tipo: profilo.studi_legali.tipo,
          subscription: profilo.studi_legali.subscription,
        })
      }
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      throw error
    }
    navigate('/dashboard')
    toast.success('Accesso effettuato')
  }

  async function signUp(email: string, password: string, metadata?: Record<string, string>) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    if (error) {
      toast.error(error.message)
      throw error
    }
    toast.success('Registrazione completata! Controlla la tua email.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
    toast.success('Disconnesso')
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      toast.error(error.message)
      throw error
    }
    toast.success('Email di recupero inviata')
  }

  return { user, profilo, signIn, signUp, signOut, resetPassword }
}
