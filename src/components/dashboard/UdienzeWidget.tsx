import { motion } from 'framer-motion'
import { Calendar, MapPin, ChevronRight, Video } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

const mockUdienze = [
  { id: '1', tipo: 'Udienza Istruttoria', fascicolo: '2025/0042-CIV', autorita: 'Tribunale di Roma - III Sez.', data: '2025-03-17T10:00', modalita: 'presenza', aula: 'Aula 12' },
  { id: '2', tipo: 'Udienza GIP', fascicolo: '2025/0015-PEN', autorita: 'Tribunale di Milano', data: '2025-03-18T09:30', modalita: 'presenza', aula: 'Aula 5' },
  { id: '3', tipo: 'Mediazione', fascicolo: '2025/0033-CIV', autorita: 'Organismo di Mediazione', data: '2025-03-19T15:00', modalita: 'telematica' },
  { id: '4', tipo: 'Precisazione Conclusioni', fascicolo: '2025/0028-CIV', autorita: 'Tribunale di Napoli', data: '2025-03-20T11:00', modalita: 'mista' },
]

export function UdienzeWidget() {
  const navigate = useNavigate()

  return (
    <Card variant="default" padding="none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gold-400" />
          <h3 className="font-display text-lg font-semibold text-text-primary">Udienze Settimana</h3>
        </div>
        <button
          onClick={() => navigate('/scadenziario')}
          className="text-xs text-text-muted hover:text-gold-400 transition-colors flex items-center gap-1"
        >
          Calendario <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-border-subtle">
        {mockUdienze.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-text-primary">{u.tipo}</span>
              <div className="flex items-center gap-2">
                {u.modalita === 'telematica' && <Video size={12} className="text-accent-blue" />}
                <Badge variant="gold" size="sm">
                  {new Date(u.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}{' '}
                  {new Date(u.data).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{u.fascicolo}</span>
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {u.autorita}{u.aula ? ` — ${u.aula}` : ''}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
