import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, FileText, Clock, Calendar, Users, Activity, MessageSquare, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/stores/uiStore'

const tabs = [
  { id: 'panoramica', label: 'Panoramica', icon: BarChart3 },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'documenti', label: 'Documenti', icon: FileText },
  { id: 'scadenze', label: 'Scadenze', icon: Clock },
  { id: 'udienze', label: 'Udienze', icon: Calendar },
  { id: 'parti', label: 'Parti', icon: Users },
  { id: 'note', label: 'Note', icon: MessageSquare },
  { id: 'ai', label: 'AI Analysis', icon: Brain },
]

export function FascicoloDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('panoramica')
  const { toggleCoreMindPanel } = useUIStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/fascicoli')} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gold-400">2025/0042-CIV</span>
              <Badge variant="blue" dot>In Corso</Badge>
              <Badge variant="default">Civile</Badge>
            </div>
            <h1 className="font-display text-xl font-semibold text-text-primary mt-1">
              Risarcimento danni da responsabilità medica — Rossi c/ ASL Roma 1
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Brain size={16} />} onClick={toggleCoreMindPanel}>
            Analisi AI
          </Button>
        </div>
      </motion.div>

      {/* Quick info bar */}
      <Card padding="sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div><span className="text-text-muted">Tribunale:</span> <span className="text-text-primary">Tribunale di Roma — III Sez. Civile</span></div>
            <div><span className="text-text-muted">RG:</span> <span className="text-gold-400 font-mono">1234/2025</span></div>
            <div><span className="text-text-muted">Valore:</span> <span className="text-text-primary">€250.000,00</span></div>
            <div><span className="text-text-muted">Giudice:</span> <span className="text-text-primary">Dott. Bianchi</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">AI Score:</span>
            <span className="text-accent-green font-bold">72%</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'text-gold-400 bg-bg-secondary border border-border-subtle border-b-bg-secondary -mb-px'
                : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'panoramica' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Descrizione</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Procedimento civile per risarcimento danni da responsabilità medica. Il Sig. Rossi Mario, assistito dal nostro studio, 
                ha subito danni permanenti a seguito di intervento chirurgico presso ASL Roma 1 in data 15/06/2024. 
                Si contesta negligenza medica nell'esecuzione dell'intervento e carenza nel consenso informato.
                Perizia medico-legale di parte depositata. CTU in corso.
              </p>
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Fase processuale</h4>
                <div className="flex items-center gap-2">
                  {['Precontenzioso', 'Mediazione', 'I Grado', 'Appello', 'Cassazione'].map((fase, i) => (
                    <div key={fase} className={`flex-1 h-2 rounded-full ${i <= 2 ? 'bg-gold-400' : 'bg-bg-tertiary'}`} />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Precontenzioso</span><span>Mediazione</span><span className="text-gold-400 font-semibold">I Grado</span><span>Appello</span><span>Cassazione</span>
                </div>
              </div>
            </Card>
            <div className="space-y-4">
              <Card variant="gold">
                <h3 className="text-label text-gold-400 mb-3">ANALISI PREDITTIVA AI</h3>
                <div className="text-kpi gold-text mb-2">72%</div>
                <p className="text-xs text-text-secondary">Probabilità di esito favorevole basata su giurisprudenza e dati del fascicolo</p>
              </Card>
              <Card>
                <h3 className="text-label text-text-muted mb-3">RESPONSABILE</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-bg-primary text-sm font-bold">MB</div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Avv. Marco Bianchi</div>
                    <div className="text-xs text-text-muted">Titolare</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        {activeTab !== 'panoramica' && (
          <Card>
            <div className="py-12 text-center">
              <p className="text-text-muted text-sm">Sezione {tabs.find((t) => t.id === activeTab)?.label} — Connetti Supabase per visualizzare i dati</p>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
