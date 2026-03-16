import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card } from '@/components/ui/Card'
import { KPI } from '@/components/ui/KPI'

const fatturatoMensile = [
  { mese: 'Gen', valore: 18500 }, { mese: 'Feb', valore: 22000 }, { mese: 'Mar', valore: 24500 },
  { mese: 'Apr', valore: 0 }, { mese: 'Mag', valore: 0 }, { mese: 'Giu', valore: 0 },
]

const fascicoliMateria = [
  { name: 'Civile', value: 22, color: '#D4AF37' },
  { name: 'Penale', value: 8, color: '#DC143C' },
  { name: 'Tributario', value: 6, color: '#4A90D9' },
  { name: 'Lavoro', value: 5, color: '#4ADE80' },
  { name: 'Altro', value: 6, color: '#9370DB' },
]

const oreAvvocati = [
  { nome: 'Bianchi', fatturate: 145, non_fatturate: 25 },
  { nome: 'Rossi', fatturate: 128, non_fatturate: 32 },
  { nome: 'Verdi', fatturate: 85, non_fatturate: 45 },
  { nome: 'Neri', fatturate: 110, non_fatturate: 18 },
]

const forecastRicavi = [
  { mese: 'Gen', attuale: 18500, previsione: 18500 }, { mese: 'Feb', attuale: 22000, previsione: 21000 },
  { mese: 'Mar', attuale: 24500, previsione: 23500 }, { mese: 'Apr', attuale: null, previsione: 26000 },
  { mese: 'Mag', attuale: null, previsione: 25000 }, { mese: 'Giu', attuale: null, previsione: 28000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-bg-elevated border border-border-medium rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? `€${p.value.toLocaleString('it-IT')}` : p.value}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-section-title text-text-primary">Legal Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">Performance dello studio, KPI, forecast</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Fatturato YTD" value="€65k" icon={<TrendingUp size={18} />} trend={{ value: 15 }} variant="gold" />
        <KPI label="Tasso Successo" value="78%" icon={<BarChart3 size={18} />} trend={{ value: 5 }} />
        <KPI label="Clienti Attivi" value="42" icon={<Users size={18} />} trend={{ value: 8 }} />
        <KPI label="Tariffa Media/h" value="€185" icon={<Clock size={18} />} trend={{ value: 3 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fatturato mensile */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Fatturato Mensile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fatturatoMensile}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mese" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `€${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valore" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Fascicoli per materia */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Fascicoli per Materia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={fascicoliMateria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                {fascicoliMateria.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {fascicoliMateria.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name} ({m.value})
              </div>
            ))}
          </div>
        </Card>

        {/* Ore avvocati */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Ore per Avvocato</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={oreAvvocati} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis type="category" dataKey="nome" stroke="#666" fontSize={12} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="fatturate" name="Fatturate" fill="#D4AF37" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="non_fatturate" name="Non fatturate" fill="rgba(212,175,55,0.2)" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Forecast */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Forecast Ricavi AI</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecastRicavi}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mese" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `€${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="attuale" name="Attuale" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
              <Line type="monotone" dataKey="previsione" name="Previsione" stroke="#4A90D9" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#4A90D9' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
