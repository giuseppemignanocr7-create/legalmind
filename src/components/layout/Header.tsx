import { Bell, Search, Menu, Brain } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNotificheStore } from '@/stores/notificheStore'
import { useAuthStore } from '@/stores/authStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  const { setCommandPaletteOpen, setSidebarMobileOpen, toggleCoreMindPanel } = useUIStore()
  const { unreadCount, togglePanel } = useNotificheStore()
  const { profilo } = useAuthStore()

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-4 py-2 bg-bg-tertiary border border-border-subtle rounded-lg text-sm text-text-muted hover:text-text-secondary hover:border-border-medium transition-all duration-200 w-64"
        >
          <Search size={16} />
          <span>Cerca...</span>
          <kbd className="ml-auto text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: AI + notifications + profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button
          onClick={toggleCoreMindPanel}
          className="p-2 rounded-lg text-gold-400 hover:bg-gold-400/10 transition-colors"
          title="CoreMind AI"
        >
          <Brain size={20} />
        </button>

        <button
          onClick={togglePanel}
          className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-accent-red text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-border-subtle mx-1" />

        <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-bg-primary text-sm font-bold">
            {profilo ? `${profilo.nome[0]}${profilo.cognome[0]}` : 'LM'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-text-primary">
              {profilo ? `${profilo.nome} ${profilo.cognome}` : 'LegalMind'}
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">
              {profilo?.ruolo || 'Demo'}
            </div>
          </div>
        </button>
      </div>
    </header>
  )
}
