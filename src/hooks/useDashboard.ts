import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = `${today.slice(0, 7)}-01`
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)

      const [fascicoli, scadenzeOggi, udienzeSett, fatturatoMese] = await Promise.all([
        supabase.from('fascicoli').select('id', { count: 'exact', head: true })
          .in('stato', ['aperto', 'in_corso', 'in_attesa']),
        supabase.from('scadenze').select('id', { count: 'exact', head: true })
          .eq('stato', 'attiva').eq('data_scadenza', today),
        supabase.from('udienze').select('id', { count: 'exact', head: true })
          .gte('data_udienza', weekStart.toISOString())
          .lte('data_udienza', new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('fatture').select('totale_documento')
          .gte('data_emissione', monthStart)
          .in('stato', ['emessa', 'pagata', 'inviata_sdi', 'consegnata', 'accettata']),
      ])

      const fatturato = fatturatoMese.data?.reduce((sum, f) => sum + (f.totale_documento || 0), 0) || 0

      return {
        fascicoliAttivi: fascicoli.count || 0,
        scadenzeOggi: scadenzeOggi.count || 0,
        udienzeSett: udienzeSett.count || 0,
        fatturatoMese: fatturato,
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useRecentFascicoli(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-fascicoli', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fascicoli')
        .select(`*, avvocato:profili!avvocato_responsabile(nome, cognome)`)
        .order('updated_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data
    },
  })
}
