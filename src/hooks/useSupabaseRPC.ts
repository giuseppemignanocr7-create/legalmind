import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dashboard KPI (real-time from DB function)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useDashboardKPI(studioId: string) {
  return useQuery({
    queryKey: ['dashboard-kpi', studioId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_kpi', { p_studio_id: studioId })
      if (error) throw error
      return data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    enabled: !!studioId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fascicolo Timeline
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useFascicoloTimeline(fascicoloId: string) {
  return useQuery({
    queryKey: ['fascicolo-timeline', fascicoloId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_fascicolo_timeline', { p_fascicolo_id: fascicoloId })
      if (error) throw error
      return data
    },
    enabled: !!fascicoloId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scadenze Alert (prossime scadenze con contesto)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useScadenzeAlert(studioId: string, giorni = 7) {
  return useQuery({
    queryKey: ['scadenze-alert', studioId, giorni],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_scadenze_alert', { p_studio_id: studioId, p_giorni: giorni })
      if (error) throw error
      return data
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!studioId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Report Fatturato
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useReportFatturato(studioId: string, anno?: number, mese?: number) {
  return useQuery({
    queryKey: ['report-fatturato', studioId, anno, mese],
    queryFn: async () => {
      const params: Record<string, unknown> = { p_studio_id: studioId }
      if (anno) params.p_anno = anno
      if (mese) params.p_mese = mese
      const { data, error } = await supabase.rpc('report_fatturato', params)
      if (error) throw error
      return data
    },
    enabled: !!studioId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Client Health Score
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useClientHealthScore(clienteId: string) {
  return useQuery({
    queryKey: ['client-health', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calcola_client_health_score', { p_cliente_id: clienteId })
      if (error) throw error
      return data
    },
    enabled: !!clienteId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Global Search (search everything)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useGlobalSearch(studioId: string, query: string) {
  return useQuery({
    queryKey: ['global-search', studioId, query],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_everything', {
        p_studio_id: studioId,
        p_query: query,
        p_limit: 20,
      })
      if (error) throw error
      return data
    },
    enabled: !!studioId && query.length >= 2,
    staleTime: 10_000,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Conflict Check
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useConflictCheck() {
  return useMutation({
    mutationFn: async (params: { studioId: string; nome: string; cf?: string }) => {
      const { data, error } = await supabase.rpc('check_conflicts', {
        p_studio_id: params.studioId,
        p_soggetto_nome: params.nome,
        p_codice_fiscale: params.cf || null,
      })
      if (error) throw error
      return data
    },
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Calcolo Termine Processuale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useCalcoloTermine() {
  return useMutation({
    mutationFn: async (params: { dataInizio: string; giorni: number; sospensioneFeriale?: boolean }) => {
      const { data, error } = await supabase.rpc('calcola_termine', {
        p_data_inizio: params.dataInizio,
        p_giorni: params.giorni,
        p_sospensione_feriale: params.sospensioneFeriale ?? true,
      })
      if (error) throw error
      return data
    },
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Genera Numero Fattura/Fascicolo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useGeneraNumero() {
  return useMutation({
    mutationFn: async (params: { tipo: 'fattura' | 'fascicolo'; studioId: string; materia?: string }) => {
      if (params.tipo === 'fattura') {
        const { data, error } = await supabase.rpc('genera_numero_fattura', { p_studio_id: params.studioId })
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase.rpc('genera_numero_fascicolo', {
          p_studio_id: params.studioId,
          p_materia: params.materia || 'civile',
        })
        if (error) throw error
        return data
      }
    },
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Storage Quota
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useStorageQuota(studioId: string) {
  return useQuery({
    queryKey: ['storage-quota', studioId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_storage_quota', { p_studio_id: studioId })
      if (error) throw error
      return data
    },
    staleTime: 300_000,
    enabled: !!studioId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Notifiche In-App
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useNotificheInApp() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifiche-inapp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifiche_inapp')
        .select('*')
        .eq('letta', false)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
    refetchInterval: 30_000,
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifiche_inapp')
        .update({ letta: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifiche-inapp'] }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifiche_inapp')
        .update({ letta: true })
        .eq('letta', false)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifiche-inapp'] }),
  })

  return { ...query, markAsRead, markAllRead }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Queue (async operations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useJobQueue(studioId: string) {
  const queryClient = useQueryClient()

  const jobs = useQuery({
    queryKey: ['job-queue', studioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data
    },
    refetchInterval: 5_000,
    enabled: !!studioId,
  })

  const enqueueJob = useMutation({
    mutationFn: async (params: { tipo: string; payload: Record<string, unknown>; priorita?: number }) => {
      const { data, error } = await supabase
        .from('job_queue')
        .insert({
          studio_id: studioId,
          tipo: params.tipo,
          payload: params.payload,
          priorita: params.priorita || 5,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-queue', studioId] }),
  })

  return { ...jobs, enqueueJob }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Materialized Views (pre-computed analytics)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useFatturatoMensile(studioId: string) {
  return useQuery({
    queryKey: ['fatturato-mensile', studioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mv_fatturato_mensile')
        .select('*')
        .eq('studio_id', studioId)
        .order('mese', { ascending: false })
        .limit(24)
      if (error) throw error
      return data
    },
    staleTime: 300_000,
    enabled: !!studioId,
  })
}

export function useProduttivitaTeam(studioId: string) {
  return useQuery({
    queryKey: ['produttivita-team', studioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_produttivita_team')
        .select('*')
        .eq('studio_id', studioId)
      if (error) throw error
      return data
    },
    staleTime: 120_000,
    enabled: !!studioId,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template Atti
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function useTemplateAtti(categoria?: string) {
  return useQuery({
    queryKey: ['template-atti', categoria],
    queryFn: async () => {
      let q = supabase.from('template_atti').select('*').order('nome')
      if (categoria) q = q.eq('categoria', categoria)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}
