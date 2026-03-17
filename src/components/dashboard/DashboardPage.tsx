import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, Clock, Calendar, Wallet, Timer, Brain, Plus,
  FileText, Users, Search, Scale, Sparkles, AlertTriangle,
  TrendingUp, TrendingDown, ChevronRight, MapPin, Video,
  ExternalLink, Zap, BarChart3, ArrowUpRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from 'recharts'

// ── Mock Data ──────────────────────────────────────────────────────
const fatturatoMensile = [
  { mese: 'Ott', fatturato: 18200, incassato: 15800 },
  { mese: 'Nov', fatturato: 22100, incassato: 19400 },
  { mese: 'Dic', fatturato: 28500, incassato: 21200 },
  { mese: 'Gen', fatturato: 19800, incassato: 17600 },
  { mese: 'Feb', fatturato: 21400, incassato: 20100 },
  { mese: 'Mar', fatturato: 24500, incassato: 16800 },
]

const distribuzioneFascicoli = [
  { name: 'Civile', value: 22, color: '#D4AF37' },
  { name: 'Penale', value: 8, color: '#6366f1' },
  { name: 'Lavoro', value: 6, color: '#22c55e' },
  { name: 'Tributario', value: 5, color: '#f59e0b' },
  { name: 'Famiglia', value: 4, color: '#ec4899' },
  { name: 'Altro', value: 2, color: '#64748b' },
]

const oreSettimanali = [
  { giorno: 'Lun', ore: 7.5, fatturabili: 6.0 },
  { giorno: 'Mar', ore: 8.2, fatturabili: 7.0 },
  { giorno: 'Mer', ore: 6.8, fatturabili: 5.5 },
  { giorno: 'Gio', ore: 9.0, fatturabili: 7.5 },
  { giorno: 'Ven', ore: 7.0, fatturabili: 5.8 },
]

const scadenze = [
  { id: '1', titolo: 'Deposito memoria ex art. 183 c.p.c.', fascicolo: '2025/0042-CIV', data: '2026-03-18', urgenza: 'critica' },
  { id: '2', titolo: 'Termine opposizione decreto ingiuntivo', fascicolo: '2025/0038-CIV', data: '2026-03-19', urgenza: 'alta' },
  { id: '3', titolo: 'Scadenza termini indagini preliminari', fascicolo: '2025/0015-PEN', data: '2026-03-20', urgenza: 'alta' },
  { id: '4', titolo: 'Presentazione ricorso CTP', fascicolo: '2025/0029-TRIB', data: '2026-03-21', urgenza: 'media' },
  { id: '5', titolo: 'Rinnovo mandato professionale', fascicolo: '2025/0011-CIV', data: '2026-03-24', urgenza: 'bassa' },
]

const udienze = [
  { id: '1', tipo: 'Udienza Istruttoria', fascicolo: '2025/0042-CIV', autorita: 'Tribunale di Roma - III Sez.', data: '2026-03-18T10:00', modalita: 'presenza', aula: 'Aula 12' },
  { id: '2', tipo: 'Udienza GIP', fascicolo: '2025/0015-PEN', autorita: 'Tribunale di Milano', data: '2026-03-19T09:30', modalita: 'presenza', aula: 'Aula 5' },
  { id: '3', tipo: 'Mediazione', fascicolo: '2025/0033-CIV', autorita: 'Organismo di Mediazione', data: '2026-03-20T15:00', modalita: 'telematica' },
  { id: '4', tipo: 'Precisazione Conclusioni', fascicolo: '2025/0028-CIV', autorita: 'Tribunale di Napoli', data: '2026-03-21T11:00', modalita: 'mista' },
]

const fascicoliRecenti = [
  { id: '1', numero: '2025/0042-CIV', oggetto: 'Risarcimento danni da responsabilità medica', materia: 'Civile', stato: 'in_corso', avvocato: 'Avv. Bianchi' },
  { id: '2', numero: '2025/0038-CIV', oggetto: 'Opposizione decreto ingiuntivo — Banca XYZ', materia: 'Civile', stato: 'aperto', avvocato: 'Avv. Rossi' },
  { id: '3', numero: '2025/0015-PEN', oggetto: 'Procedimento penale — art. 640 c.p.', materia: 'Penale', stato: 'in_corso', avvocato: 'Avv. Verdi' },
  { id: '4', numero: '2025/0029-TRIB', oggetto: 'Ricorso avverso avviso di accertamento IRPEF', materia: 'Tributario', stato: 'aperto', avvocato: 'Avv. Bianchi' },
  { id: '5', numero: '2025/0033-CIV', oggetto: 'Mediazione — Condominio Via Roma 15', materia: 'Civile', stato: 'in_attesa', avvocato: 'Avv. Neri' },
]

const normativa = [
  { id: '1', titolo: 'D.L. 34/2026 — Riforma processo civile telematico', area: 'Processuale Civile', severita: 'critica', data: '2026-03-16', fonte: 'Gazzetta Ufficiale' },
  { id: '2', titolo: 'Cassazione SS.UU. n. 4521/2026 — Responsabilità medica', area: 'Civile', severita: 'alta', data: '2026-03-15', fonte: 'Cassazione' },
  { id: '3', titolo: 'Provvedimento Garante Privacy — Nuove linee guida cookie', area: 'Privacy', severita: 'media', data: '2026-03-14', fonte: 'Garante Privacy' },
  { id: '4', titolo: 'Circolare AdE n. 12/E — Superbonus residuo', area: 'Tributario', severita: 'alta', data: '2026-03-14', fonte: 'Agenzia Entrate' },
]

const insights = [
  { icon: <AlertTriangle size={16} className="text-accent-red" />, titolo: '3 scadenze perentorie nei prossimi 5 giorni', desc: 'Fascicoli 2025/0042, 0038, 0015 richiedono attenzione immediata.', urgenza: 'critica' },
  { icon: <TrendingUp size={16} className="text-accent-green" />, titolo: 'Tasso di successo in aumento', desc: 'Tasso di successo cause civili al 78% nel Q1 2026, +5% vs Q4 2025.', urgenza: 'info' },
  { icon: <Clock size={16} className="text-accent-orange" />, titolo: 'Ore fatturabili sotto obiettivo', desc: 'Avv. Rossi ha registrato 85 ore su 160 obiettivo questo mese.', urgenza: 'warning' },
  { icon: <Sparkles size={16} className="text-gold-400" />, titolo: 'Nuova giurisprudenza rilevante', desc: 'Cass. SS.UU. 4521/2026 impatta 3 fascicoli di responsabilità medica.', urgenza: 'info' },
]

const produttivitaTeam = [
  { nome: 'Avv. Rossi', ore: 142, target: 160, fascicoli: 12, pct: 89 },
  { nome: 'Avv. Bianchi', ore: 158, target: 160, fascicoli: 15, pct: 99 },
  { nome: 'Avv. Verdi', ore: 128, target: 140, fascicoli: 8, pct: 91 },
  { nome: 'Avv. Neri', ore: 95, target: 120, fascicoli: 6, pct: 79 },
]

// ── Helpers ────────────────────────────────────────────────────────
const urgenzaColor: Record<string, string> = { critica: 'bg-accent-red/10 text-accent-red border-accent-red/20', alta: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20', media: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20', bassa: 'bg-accent-green/10 text-accent-green border-accent-green/20' }
const statoColor: Record<string, string> = { aperto: 'bg-accent-green/10 text-accent-green', in_corso: 'bg-accent-blue/10 text-accent-blue', in_attesa: 'bg-gold-400/10 text-gold-400', sospeso: 'bg-accent-orange/10 text-accent-orange' }
const sevColor: Record<string, string> = { critica: 'text-accent-red', alta: 'text-accent-orange', media: 'text-accent-blue', informativa: 'text-text-muted' }

const customTooltipStyle = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e0e0e0',
}

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-section-title text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Panoramica dello studio — {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* ── KPI ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Fascicoli Attivi', value: '47', icon: <FolderOpen size={18} />, trend: '+12%', up: true, gold: true },
          { label: 'Scadenze Oggi', value: '5', icon: <Clock size={18} />, trend: '-8%', up: false },
          { label: 'Udienze Settimana', value: '8', icon: <Calendar size={18} />, trend: '+25%', up: true },
          { label: 'Fatturato Mese', value: '€24.5k', icon: <Wallet size={18} />, trend: '+18%', up: true, gold: true },
          { label: 'Ore Fatturate', value: '142', icon: <Timer size={18} />, trend: '89%', up: true },
          { label: 'AI Queries', value: '89', icon: <Brain size={18} />, trend: '+34%', up: true },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-5 border transition-all duration-300 hover:-translate-y-0.5 ${
              kpi.gold ? 'bg-bg-secondary border-gold-400/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]' : 'bg-bg-secondary border-border-subtle hover:border-border-medium'
            }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">{kpi.label}</span>
              <div className="text-gold-400">{kpi.icon}</div>
            </div>
            <div className={`text-2xl font-semibold ${kpi.gold ? 'text-gold-400' : 'text-text-primary'}`}>{kpi.value}</div>
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${kpi.up ? 'text-accent-green' : 'text-accent-red'}`}>
              {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{kpi.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── AZIONI RAPIDE ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-gold-400" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Azioni Rapide</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {[
            { label: 'Nuovo Fascicolo', icon: <FolderOpen size={18} />, path: '/fascicoli/nuovo', accent: true },
            { label: 'Nuovo Cliente', icon: <Users size={18} />, path: '/clienti/nuovo' },
            { label: 'Nuovo Atto', icon: <FileText size={18} />, path: '/atti' },
            { label: 'Nuova Fattura', icon: <Wallet size={18} />, path: '/contabilita/fatturazione' },
            { label: 'Cerca Fascicolo', icon: <Search size={18} />, path: '/fascicoli' },
            { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics' },
          ].map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 group ${
                action.accent
                  ? 'bg-gold-400/5 border-gold-400/20 hover:bg-gold-400/10 hover:border-gold-400/40'
                  : 'bg-bg-secondary border-border-subtle hover:bg-bg-tertiary hover:border-border-medium'
              }`}>
              <div className={`${action.accent ? 'text-gold-400' : 'text-text-muted group-hover:text-gold-400'} transition-colors`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-text-primary">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── CHARTS ROW ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fatturato Mensile (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-bg-secondary border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Fatturato vs Incassato</h3>
              <p className="text-xs text-text-muted mt-0.5">Ultimi 6 mesi</p>
            </div>
            <button onClick={() => navigate('/analytics')} className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors">
              Dettaglio <ArrowUpRight size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fatturatoMensile} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mese" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(value: any) => [`€${Number(value).toLocaleString('it-IT')}`, '']} />
              <Bar dataKey="fatturato" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Fatturato" />
              <Bar dataKey="incassato" fill="rgba(212,175,55,0.35)" radius={[4, 4, 0, 0]} name="Incassato" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribuzione Fascicoli (Pie Chart) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Distribuzione Fascicoli</h3>
          <p className="text-xs text-text-muted mb-4">Per materia — 47 attivi</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={distribuzioneFascicoli} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {distribuzioneFascicoli.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} formatter={(value: any, name: any) => [`${value} fascicoli`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {distribuzioneFascicoli.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-text-muted">{d.name}</span>
                <span className="ml-auto text-text-primary font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── ORE SETTIMANALI + PRODUTTIVITA' TEAM ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ore settimanali (Area Chart) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Ore Lavorate Settimana</h3>
          <p className="text-xs text-text-muted mb-4">Totali vs fatturabili — questa settimana</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={oreSettimanali}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="giorno" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="ore" stroke="#D4AF37" fill="rgba(212,175,55,0.15)" name="Totali" />
              <Area type="monotone" dataKey="fatturabili" stroke="#22c55e" fill="rgba(34,197,94,0.1)" name="Fatturabili" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Produttività Team */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Produttività Team</h3>
          <div className="space-y-4">
            {produttivitaTeam.map((m) => (
              <div key={m.nome}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-primary font-medium">{m.nome}</span>
                  <span className="text-xs text-text-muted">{m.ore}/{m.target}h — {m.fascicoli} fascicoli</span>
                </div>
                <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${m.pct >= 95 ? 'bg-accent-green' : m.pct >= 80 ? 'bg-gold-400' : 'bg-accent-orange'}`}
                    style={{ width: `${Math.min(m.pct, 100)}%` }} />
                </div>
                <div className="text-right mt-0.5">
                  <span className={`text-[10px] font-medium ${m.pct >= 95 ? 'text-accent-green' : m.pct >= 80 ? 'text-gold-400' : 'text-accent-orange'}`}>
                    {m.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── SCADENZE + UDIENZE ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scadenze */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gold-400" />
              <h3 className="text-sm font-semibold text-text-primary">Scadenze Prossime</h3>
            </div>
            <button onClick={() => navigate('/scadenziario')} className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors">
              Vedi tutte <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {scadenze.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer">
                {s.urgenza === 'critica' && <AlertTriangle size={14} className="text-accent-red shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{s.titolo}</div>
                  <div className="text-xs text-text-muted mt-0.5">{s.fascicolo}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${urgenzaColor[s.urgenza]}`}>
                  {new Date(s.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Udienze */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gold-400" />
              <h3 className="text-sm font-semibold text-text-primary">Udienze Settimana</h3>
            </div>
            <button onClick={() => navigate('/scadenziario')} className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors">
              Calendario <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {udienze.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.04 }}
                className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{u.tipo}</span>
                  <div className="flex items-center gap-2">
                    {u.modalita === 'telematica' && <Video size={12} className="text-accent-blue" />}
                    <span className="text-[10px] font-medium text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-full">
                      {new Date(u.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}{' '}
                      {new Date(u.data).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{u.fascicolo}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {u.autorita}{u.aula ? ` — ${u.aula}` : ''}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── FASCICOLI RECENTI + NORMATIVA ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fascicoli Recenti */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-gold-400" />
              <h3 className="text-sm font-semibold text-text-primary">Fascicoli Recenti</h3>
            </div>
            <button onClick={() => navigate('/fascicoli')} className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors">
              Vedi tutti <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {fascicoliRecenti.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                onClick={() => navigate(`/fascicoli/${f.id}`)}
                className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gold-400">{f.numero}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statoColor[f.stato] || 'bg-bg-tertiary text-text-muted'}`}>
                      {f.stato.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">{f.avvocato}</span>
                </div>
                <div className="text-sm text-text-primary truncate">{f.oggetto}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feed Normativo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-gold-400" />
              <h3 className="text-sm font-semibold text-text-primary">Feed Normativo</h3>
            </div>
            <button onClick={() => navigate('/normativa')} className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors">
              Osservatorio <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {normativa.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.04 }}
                className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-medium ${sevColor[n.severita]}`}>{n.area}</span>
                  <span className="text-[10px] text-text-muted">{new Date(n.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</span>
                </div>
                <div className="text-sm text-text-primary">{n.titolo}</div>
                <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">{n.fonte} <ExternalLink size={8} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── AI INSIGHTS ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-bg-secondary border border-gold-400/20 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.05)] overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Brain size={16} className="text-bg-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">CoreMind AI Insights</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">Analisi automatica del tuo studio</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 pt-2">
          {insights.map((ins, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.08 }}
              className="bg-bg-tertiary rounded-lg p-4 border border-border-subtle hover:border-gold-400/20 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                {ins.icon}
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  ins.urgenza === 'critica' ? 'text-accent-red' : ins.urgenza === 'warning' ? 'text-accent-orange' : 'text-gold-400'
                }`}>
                  {ins.urgenza === 'critica' ? 'Urgente' : ins.urgenza === 'warning' ? 'Attenzione' : 'Insight'}
                </span>
              </div>
              <h4 className="text-sm font-medium text-text-primary mb-1">{ins.titolo}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{ins.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
