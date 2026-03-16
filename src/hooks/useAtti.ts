import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Atto } from '@/types/atto.types'

const QUERY_KEY = 'atti'

export function useAtti(filters?: { fascicoloId?: string; tipo?: string; stato?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('atti')
        .select(`*, fascicoli(id, numero_interno, oggetto)`)
        .order('created_at', { ascending: false })

      if (filters?.fascicoloId) query = query.eq('fascicolo_id', filters.fascicoloId)
      if (filters?.tipo) query = query.eq('tipo', filters.tipo)
      if (filters?.stato) query = query.eq('stato', filters.stato)

      const { data, error } = await query
      if (error) throw error
      return data as Atto[]
    },
  })
}

export function useAtto(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('atti')
        .select(`*, fascicoli(id, numero_interno, oggetto, materia), documenti(*)`)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Atto
    },
    enabled: !!id,
  })
}

export function useCreateAtto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (atto: Partial<Atto>) => {
      const { data, error } = await supabase
        .from('atti')
        .insert(atto)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Atto creato')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useUpdateAtto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Atto> & { id: string }) => {
      const { data, error } = await supabase
        .from('atti')
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
      toast.success('Atto aggiornato')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useAttoTemplates(materia?: string) {
  return useQuery({
    queryKey: ['atto_templates', materia],
    queryFn: async () => {
      let query = supabase
        .from('atto_templates')
        .select('*')
        .order('usato_count', { ascending: false })

      if (materia) query = query.eq('materia', materia)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
