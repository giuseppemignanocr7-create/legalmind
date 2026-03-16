import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Building2, Users, Shield, Plug, Mail, CreditCard, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const settingSections = [
  { id: 'studio', label: 'Profilo Studio', icon: Building2, description: 'Dati studio legale, logo, contatti' },
  { id: 'team', label: 'Team', icon: Users, description: 'Gestione membri del team e inviti' },
  { id: 'roles', label: 'Ruoli & Permessi', icon: Shield, description: 'Configurazione ruoli e permessi di accesso' },
  { id: 'integrations', label: 'Integrazioni', icon: Plug, description: 'PCT, SDI, provider firma digitale' },
  { id: 'pec', label: 'PEC', icon: Mail, description: 'Configurazione casella PEC' },
  { id: 'billing', label: 'Abbonamento', icon: CreditCard, description: 'Piano, fatturazione, limiti' },
  { id: 'audit', label: 'Audit Log', icon: FileText, description: 'Registro attività e accessi' },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('studio')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-section-title text-text-primary">Impostazioni</h1>
        <p className="text-sm text-text-secondary mt-1">Configurazione studio e piattaforma</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {settingSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left
                ${activeSection === s.id ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'}`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeSection === 'studio' && (
              <Card>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-6">Profilo Studio Legale</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Nome Studio" defaultValue="Studio Legale Associato Bianchi & Partners" />
                    <Input label="Partita IVA" defaultValue="12345678901" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" defaultValue="info@studiobianchi.it" />
                    <Input label="PEC" defaultValue="studio@pec.studiobianchi.it" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Indirizzo" defaultValue="Via Roma 42" />
                    <Input label="Città" defaultValue="Roma" />
                    <Input label="CAP" defaultValue="00185" />
                  </div>
                  <Input label="Foro Competente" defaultValue="Tribunale di Roma" />
                  <Input label="Ordine di Appartenenza" defaultValue="Ordine degli Avvocati di Roma" />
                  <div className="pt-4 border-t border-border-subtle">
                    <Button variant="gold">Salva Modifiche</Button>
                  </div>
                </div>
              </Card>
            )}
            {activeSection === 'billing' && (
              <Card>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Piano di Abbonamento</h3>
                <div className="bg-bg-tertiary rounded-xl p-6 border border-border-gold mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-label text-gold-400">PIANO ATTUALE</span>
                      <h4 className="text-2xl font-bold text-text-primary mt-1">Professional</h4>
                      <p className="text-sm text-text-secondary mt-1">10 utenti, 500 fascicoli, 50GB storage, AI illimitato</p>
                    </div>
                    <div className="text-right">
                      <div className="text-kpi gold-text">€199</div>
                      <div className="text-xs text-text-muted">/mese</div>
                    </div>
                  </div>
                </div>
                <Button variant="secondary">Gestisci Abbonamento</Button>
              </Card>
            )}
            {activeSection !== 'studio' && activeSection !== 'billing' && (
              <Card>
                <div className="py-12 text-center">
                  <Settings size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
                    {settingSections.find((s) => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {settingSections.find((s) => s.id === activeSection)?.description}
                  </p>
                  <p className="text-xs text-text-muted mt-4">Connetti Supabase per configurare questa sezione</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
