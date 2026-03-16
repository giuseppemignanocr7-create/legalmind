import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Clock, Calendar, FileText, Scale, Brain, CheckCheck } from 'lucide-react'
import { useNotificheStore, type Notifica } from '@/stores/notificheStore'

const iconMap: Record<string, React.ReactNode> = {
  scadenza: <Clock size={16} className="text-accent-orange" />,
  udienza: <Calendar size={16} className="text-accent-blue" />,
  normativa: <Scale size={16} className="text-accent-purple" />,
  fascicolo: <FileText size={16} className="text-accent-green" />,
  sistema: <Bell size={16} className="text-text-muted" />,
  ai: <Brain size={16} className="text-gold-400" />,
}

const urgenzaColors: Record<string, string> = {
  bassa: 'border-l-accent-green',
  media: 'border-l-accent-blue',
  alta: 'border-l-accent-orange',
  critica: 'border-l-accent-red',
}

export function NotificationCenter() {
  const { notifiche, panelOpen, setPanelOpen, markAsRead, markAllAsRead } = useNotificheStore()

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-6 top-16 z-50 w-96 bg-bg-secondary border border-border-medium rounded-xl shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">Notifiche</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-text-muted hover:text-gold-400 transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Segna tutto letto
                </button>
                <button onClick={() => setPanelOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifiche.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-muted">
                  Nessuna notifica
                </div>
              ) : (
                notifiche.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`
                      w-full text-left px-4 py-3 border-b border-border-subtle border-l-2
                      hover:bg-bg-tertiary transition-colors
                      ${urgenzaColors[n.urgenza] || 'border-l-transparent'}
                      ${!n.letta ? 'bg-bg-tertiary/50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{iconMap[n.tipo] || iconMap.sistema}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary font-medium truncate">{n.titolo}</div>
                        {n.descrizione && (
                          <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.descrizione}</div>
                        )}
                        <div className="text-[10px] text-text-muted mt-1">
                          {new Date(n.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.letta && <span className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 shrink-0" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
