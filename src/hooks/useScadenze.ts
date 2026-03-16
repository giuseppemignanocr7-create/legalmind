import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Scadenza } from '@/types/scadenza.types'

const QUERY_KEY = 'scadenze'

export function useScadenze(filters?: {
  stato?: string
  urgenza?: string
  fascicoloId?: string
  assegnatoA?: string
  dataInizio?: string
  dataFine?: string
}) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('scadenze')
        .select(`
          *,
          fascicoli(id, numero_interno, oggetto, materia)
        `)
        .order('data_scadenza', { ascending: true })

      if (filters?.stato) query = query.eq('stato', filters.stato)
      if (filters?.urgenza) query = query.eq('urgenza', filters.urgenza)
      if (filters?.fascicoloId) query = query.eq('fascicolo_id', filters.fascicoloId)
      if (filters?.assegnatoA) query = query.eq('assegnato_a', filters.assegnatoA)
      if (filters?.dataInizio) query = query.gte('data_scadenza', filters.dataInizio)
      if (filters?.dataFine) query = query.lte('data_scadenza', filters.dataFine)

      const { data, error } = await query
      if (error) throw error
      return data as Scadenza[]
    },
  })
}

export function useScadenzeUpcoming(limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, 'upcoming', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('scadenze')
        .select(`*, fascicoli(id, numero_interno, materia)`)
        .eq('stato', 'attiva')
        .gte('data_scadenza', today)
        .order('data_scadenza', { ascending: true })
        .limit(limit)
      if (error) throw error
      return data as Scadenza[]
    },
  })
}

export function useCreateScadenza() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (scadenza: Partial<Scadenza>) => {
      const { data, error } = await supabase
        .from('scadenze')
        .insert(scadenza)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Scadenza creata')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useCompleteScadenza() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scadenze')
        .update({ stato: 'completata', data_completamento: new Date().toISOString().split('T')[0] })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Scadenza completata')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}
