import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Fattura } from '@/types/fattura.types'

const QUERY_KEY = 'fatture'

export function useFatture(filters?: { stato?: string; clienteId?: string; fascicoloId?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('fatture')
        .select(`*, soggetti(id, display_name), fascicoli(id, numero_interno)`)
        .order('data_emissione', { ascending: false })

      if (filters?.stato) query = query.eq('stato', filters.stato)
      if (filters?.clienteId) query = query.eq('cliente_id', filters.clienteId)
      if (filters?.fascicoloId) query = query.eq('fascicolo_id', filters.fascicoloId)

      const { data, error } = await query
      if (error) throw error
      return data as Fattura[]
    },
  })
}

export function useFattura(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('fatture')
        .select(`
          *,
          soggetti(id, display_name, codice_fiscale, partita_iva, pec, indirizzo, citta, cap),
          fascicoli(id, numero_interno, oggetto),
          fattura_voci(*),
          pagamenti(*)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Fattura
    },
    enabled: !!id,
  })
}

export function useCreateFattura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (fattura: Partial<Fattura>) => {
      const { data, error } = await supabase
        .from('fatture')
        .insert(fattura)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Fattura creata')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}

export function useRegistraPagamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pagamento: {
      fattura_id: string
      data_pagamento: string
      importo: number
      metodo: string
      riferimento?: string
    }) => {
      const { error } = await supabase
        .from('pagamenti')
        .insert(pagamento)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Pagamento registrato')
    },
    onError: (err: Error) => toast.error(`Errore: ${err.message}`),
  })
}
