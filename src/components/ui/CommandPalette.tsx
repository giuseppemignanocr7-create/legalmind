import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Users, Calendar, Scale, Brain, Settings, BarChart3, BookOpen } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNavigate } from 'react-router-dom'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  keywords?: string
  group: string
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} />, action: () => navigate('/dashboard'), keywords: 'home principale', group: 'Navigazione' },
    { id: 'fascicoli', label: 'Fascicoli', icon: <FileText size={16} />, action: () => navigate('/fascicoli'), keywords: 'pratiche cause', group: 'Navigazione' },
    { id: 'clienti', label: 'Clienti', icon: <Users size={16} />, action: () => navigate('/clienti'), keywords: 'anagrafica soggetti', group: 'Navigazione' },
    { id: 'scadenziario', label: 'Scadenziario', icon: <Calendar size={16} />, action: () => navigate('/scadenziario'), keywords: 'termini scadenze', group: 'Navigazione' },
    { id: 'contabilita', label: 'Contabilità', icon: <Scale size={16} />, action: () => navigate('/contabilita'), keywords: 'fatture parcelle', group: 'Navigazione' },
    { id: 'normativa', label: 'Osservatorio Normativo', icon: <BookOpen size={16} />, action: () => navigate('/normativa'), keywords: 'leggi norme', group: 'Navigazione' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} />, action: () => navigate('/analytics'), keywords: 'statistiche kpi', group: 'Navigazione' },
    { id: 'settings', label: 'Impostazioni', icon: <Settings size={16} />, action: () => navigate('/impostazioni'), keywords: 'configurazione', group: 'Navigazione' },
    { id: 'ai', label: 'CoreMind AI', icon: <Brain size={16} />, action: () => useUIStore.getState().toggleCoreMindPanel(), keywords: 'assistente intelligenza artificiale', group: 'Azioni' },
    { id: 'new-fascicolo', label: 'Nuovo Fascicolo', icon: <FileText size={16} />, action: () => navigate('/fascicoli/nuovo'), keywords: 'crea pratica', group: 'Azioni' },
    { id: 'new-cliente', label: 'Nuovo Cliente', icon: <Users size={16} />, action: () => navigate('/clienti/nuovo'), keywords: 'aggiungi soggetto', group: 'Azioni' },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleSelect = useCallback((id: string) => {
    const item = items.find((i) => i.id === id)
    item?.action()
    setCommandPaletteOpen(false)
    setSearch('')
  }, [items, setCommandPaletteOpen])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-[20%] z-50 -translate-x-1/2 w-full max-w-xl"
          >
            <Command
              className="bg-bg-secondary border border-border-medium rounded-xl shadow-card overflow-hidden"
              label="Ricerca globale"
            >
              <div className="flex items-center gap-3 px-4 border-b border-border-subtle">
                <Search size={16} className="text-text-muted" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Cerca comandi, fascicoli, clienti..."
                  className="flex-1 bg-transparent py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <kbd className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded border border-border-subtle">ESC</kbd>
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-text-muted">
                  Nessun risultato trovato.
                </Command.Empty>
                {['Navigazione', 'Azioni'].map((group) => (
                  <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                    {items.filter((i) => i.group === group).map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.keywords || ''}`}
                        onSelect={() => handleSelect(item.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary cursor-pointer transition-colors data-[selected=true]:bg-bg-tertiary data-[selected=true]:text-gold-400"
                      >
                        <span className="text-text-muted">{item.icon}</span>
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
