import { FolderOpen, Clock, Calendar, Wallet, Timer, Brain } from 'lucide-react'
import { KPI } from '@/components/ui/KPI'

export function StatsOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPI
        label="Fascicoli Attivi"
        value="47"
        icon={<FolderOpen size={20} />}
        trend={{ value: 12, label: 'vs mese prec.' }}
        variant="gold"
      />
      <KPI
        label="Scadenze Oggi"
        value="5"
        icon={<Clock size={20} />}
        trend={{ value: -8, label: 'vs media' }}
      />
      <KPI
        label="Udienze Settimana"
        value="8"
        icon={<Calendar size={20} />}
        trend={{ value: 25, label: 'vs sett. prec.' }}
      />
      <KPI
        label="Fatturato Mese"
        value="€24.5k"
        icon={<Wallet size={20} />}
        trend={{ value: 18, label: 'vs mese prec.' }}
        variant="gold"
      />
      <KPI
        label="Ore Fatturate"
        value="142"
        icon={<Timer size={20} />}
        trend={{ value: 5, label: 'obiettivo 160h' }}
      />
      <KPI
        label="AI Queries"
        value="89"
        icon={<Brain size={20} />}
        trend={{ value: 34, label: 'questo mese' }}
      />
    </div>
  )
}
