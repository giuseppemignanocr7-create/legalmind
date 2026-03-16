import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Udienza } from '@/types/udienza.types'

const QUERY_KEY = 'udienze'

export function useUdienze(filters?: { fascicoloId?: string; avvocatoId?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('udienze')
        .select(`*, fascicoli(id, numero_interno, oggetto, materia)`)
        .order('data_udienza', { ascending: true })

      if (filters?.fascicoloId) query = query.eq('fascicolo_id', filters.fascicoloId)
      if (filters?.avvocatoId) query = query.eq('avvocato_presente', filters.avvocatoId)

      const { data, error } = await query
      if (error) throw error
      return data as Udienza[]
    },
  })
}

export function useUdienzeUpcoming(limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, 'upcoming', limit],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('udienze')
        .select(`*, fascicoli(id, numero_interno, materia)`)
        .gte('data_udienza', now)
        .order('data_udienza', { ascending: true })
        .limit(limit)
      if (error) throw error
      return data as Udienza[]
    },
  })
}

export function useCreateUdienza() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (udienza: Partial<Udienza>) => {
      const { data, error } = await supabase
        .from('udienze')
        .insert(udienza)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Udienza registrata')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}
