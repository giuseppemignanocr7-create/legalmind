import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { useNotificheStore } from '@/stores/notificheStore'
import { toast } from 'sonner'

export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient()
  const { addNotifica } = useNotificheStore()

  useEffect(() => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'
    if (isPlaceholder) return

    const channel = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fascicoli' }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['fascicoli'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        addNotifica({
          id: crypto.randomUUID(),
          tipo: 'fascicolo',
          titolo: 'Nuovo fascicolo creato',
          descrizione: `Fascicolo ${payload.new.numero_interno} aperto`,
          urgenza: 'media',
          letta: false,
          created_at: new Date().toISOString(),
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scadenze' }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['scadenze'] })
        if (payload.eventType === 'INSERT') {
          const urgenza = payload.new.urgenza || 'media'
          addNotifica({
            id: crypto.randomUUID(),
            tipo: 'scadenza',
            titolo: 'Nuova scadenza',
            descrizione: payload.new.titolo,
            urgenza: urgenza as any,
            letta: false,
            created_at: new Date().toISOString(),
          })
          if (urgenza === 'critica') {
            toast.warning(`Scadenza critica: ${payload.new.titolo}`)
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'udienze' }, () => {
        queryClient.invalidateQueries({ queryKey: ['udienze'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atti' }, () => {
        queryClient.invalidateQueries({ queryKey: ['atti'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fatture' }, () => {
        queryClient.invalidateQueries({ queryKey: ['fatture'] })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clienti' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clienti'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, addNotifica])
}

export function useRealtimeFascicolo(fascicoloId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!fascicoloId) return
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'
    if (isPlaceholder) return

    const channel = supabase
      .channel(`fascicolo-${fascicoloId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fascicoli', filter: `id=eq.${fascicoloId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['fascicolo', fascicoloId] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atti', filter: `fascicolo_id=eq.${fascicoloId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['fascicolo', fascicoloId] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scadenze', filter: `fascicolo_id=eq.${fascicoloId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['fascicolo', fascicoloId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fascicoloId, queryClient])
}
