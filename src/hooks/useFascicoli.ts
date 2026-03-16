import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Fascicolo } from '@/types/fascicolo.types'

const QUERY_KEY = 'fascicoli'

export function useFascicoli(filters?: {
  stato?: string
  materia?: string
  avvocato?: string
  search?: string
}) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('fascicoli')
        .select(`
          *,
          fascicolo_parti(*, soggetti(id, display_name, tipo)),
          avvocato:profili!avvocato_responsabile(id, nome, cognome)
        `)
        .order('updated_at', { ascending: false })

      if (filters?.stato) query = query.eq('stato', filters.stato)
      if (filters?.materia) query = query.eq('materia', filters.materia)
      if (filters?.avvocato) query = query.eq('avvocato_responsabile', filters.avvocato)
      if (filters?.search) {
        query = query.or(`oggetto.ilike.%${filters.search}%,numero_interno.ilike.%${filters.search}%,numero_rg.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Fascicolo[]
    },
  })
}

export function useFascicolo(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('fascicoli')
        .select(`
          *,
          fascicolo_parti(*, soggetti(*)),
          atti(id, tipo, titolo, stato, data_deposito, ai_generated),
          udienze(id, tipo, data_udienza, autorita, aula, esito),
          scadenze(id, tipo, titolo, data_scadenza, stato, urgenza),
          fascicolo_eventi(id, tipo, titolo, data_evento, descrizione),
          fascicolo_attivita(id, tipo, descrizione, ore_lavorate, importo, fatturabile, fatturato),
          avvocato:profili!avvocato_responsabile(id, nome, cognome, avatar_url)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Fascicolo
    },
    enabled: !!id,
  })
}

export function useCreateFascicolo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (fascicolo: Partial<Fascicolo>) => {
      const { data, error } = await supabase
        .from('fascicoli')
        .insert(fascicolo)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Fascicolo creato con successo')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useUpdateFascicolo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fascicolo> & { id: string }) => {
      const { data, error } = await supabase
        .from('fascicoli')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] })
      toast.success('Fascicolo aggiornato')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}
