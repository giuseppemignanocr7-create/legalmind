import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Soggetto } from '@/types/cliente.types'

const QUERY_KEY = 'clienti'

export function useClienti(filters?: { stato?: string; search?: string; tipo?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('soggetti')
        .select('*')
        .order('display_name', { ascending: true })

      if (filters?.stato) query = query.eq('stato', filters.stato)
      if (filters?.tipo) query = query.eq('tipo', filters.tipo)
      if (filters?.search) {
        query = query.or(`display_name.ilike.%${filters.search}%,codice_fiscale.ilike.%${filters.search}%,partita_iva.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Soggetto[]
    },
  })
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('soggetti')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Soggetto
    },
    enabled: !!id,
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cliente: Partial<Soggetto>) => {
      const { data, error } = await supabase
        .from('soggetti')
        .insert(cliente)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Cliente creato con successo')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useConflictCheck() {
  return useMutation({
    mutationFn: async ({ nome, codiceFiscale }: { nome: string; codiceFiscale?: string }) => {
      const { data, error } = await supabase.rpc('check_conflicts', {
        p_studio_id: '', // Will be populated from auth context
        p_soggetto_nome: nome,
        p_codice_fiscale: codiceFiscale || null,
      })
      if (error) throw error
      return data
    },
  })
}
