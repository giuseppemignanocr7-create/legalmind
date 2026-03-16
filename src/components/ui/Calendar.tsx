import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { Badge } from './Badge'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  type: 'udienza' | 'scadenza' | 'appuntamento' | 'personale'
  color?: string
  fascicolo?: string
}

interface CalendarProps {
  events?: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  className?: string
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

const typeColors: Record<string, string> = {
  udienza: 'bg-accent-blue',
  scadenza: 'bg-accent-red',
  appuntamento: 'bg-gold-400',
  personale: 'bg-accent-green',
}

const typeVariants: Record<string, 'blue' | 'red' | 'gold' | 'green'> = {
  udienza: 'blue',
  scadenza: 'red',
  appuntamento: 'gold',
  personale: 'green',
}

export function Calendar({ events = [], onDateSelect, onEventClick, className = '' }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = []

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false, isToday: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i)
      const today = new Date()
      days.push({ date: d, isCurrentMonth: true, isToday: d.toDateString() === today.toDateString() })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, isCurrentMonth: false, isToday: false })
    }
    return days
  }, [year, month])

  const getEventsForDate = (date: Date) => {
    const ds = date.toISOString().split('T')[0]
    return events.filter(e => e.date === ds)
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()) }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      <div className="lg:col-span-2">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {MONTHS[month]} {year}
              </h3>
              <button onClick={goToToday} className="text-xs text-gold-400 hover:text-gold-300 transition-colors px-2 py-0.5 rounded bg-gold-400/10">
                Oggi
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border-subtle">
            {DAYS.map(day => (
              <div key={day} className="text-center py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = getEventsForDate(day.date)
              const isSelected = selectedDate?.toDateString() === day.date.toDateString()
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day.date)}
                  className={`
                    relative h-24 p-1.5 border-b border-r border-border-subtle text-left transition-all
                    ${!day.isCurrentMonth ? 'opacity-30' : ''}
                    ${isSelected ? 'bg-gold-400/5 ring-1 ring-gold-400/30' : 'hover:bg-bg-tertiary'}
                  `}
                >
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                    ${day.isToday ? 'bg-gold-400 text-bg-primary font-bold' : 'text-text-secondary'}
                  `}>
                    {day.date.getDate()}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick?.(ev) }}
                        className={`${typeColors[ev.type]} rounded px-1 py-0.5 text-[9px] text-white truncate cursor-pointer hover:opacity-80`}>
                        {ev.time && <span className="font-mono">{ev.time} </span>}{ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-text-muted">+{dayEvents.length - 3} altri</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CalendarIcon size={14} className="text-gold-400" />
            {selectedDate ? selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Seleziona una data'}
          </h4>
          <AnimatePresence mode="wait">
            {selectedDateEvents.length === 0 ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-text-muted text-center py-6">
                Nessun evento per questa data
              </motion.p>
            ) : (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {selectedDateEvents.map(ev => (
                  <div key={ev.id} onClick={() => onEventClick?.(ev)}
                    className="p-3 bg-bg-tertiary rounded-lg border border-border-subtle cursor-pointer hover:border-border-medium transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={typeVariants[ev.type]} size="sm">{ev.type}</Badge>
                      {ev.time && <span className="text-[10px] text-text-muted font-mono flex items-center gap-1"><Clock size={10} />{ev.time}</span>}
                    </div>
                    <p className="text-sm text-text-primary">{ev.title}</p>
                    {ev.fascicolo && <p className="text-[10px] text-gold-400 font-mono mt-1">{ev.fascicolo}</p>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Legenda</h4>
          <div className="space-y-2">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className={`w-3 h-3 rounded ${color}`} />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
