import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, Brain, LogOut, Settings, User } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNotificheStore } from '@/stores/notificheStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/config/supabase'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { toast } from 'sonner'

export function Header() {
  const navigate = useNavigate()
  const { setCommandPaletteOpen, setSidebarMobileOpen, toggleCoreMindPanel } = useUIStore()
  const { unreadCount, togglePanel } = useNotificheStore()
  const { user, profilo, studio, logout: storeLogout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    storeLogout()
    toast.success('Disconnesso')
    navigate('/login', { replace: true })
  }

  const initials = profilo ? `${profilo.nome?.[0] || ''}${profilo.cognome?.[0] || ''}` : (user?.email?.[0]?.toUpperCase() || 'U')
  const displayName = profilo ? `${profilo.nome} ${profilo.cognome}` : (user?.email || 'Utente')
  const roleName = profilo?.ruolo || 'utente'

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

        {/* Profile dropdown */}
        <div ref={menuRef} className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-bg-primary text-sm font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-text-primary">{displayName}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{roleName}</div>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border-subtle">
                <div className="text-sm font-medium text-text-primary">{displayName}</div>
                <div className="text-xs text-text-muted">{user?.email}</div>
                {studio && <div className="text-[10px] text-gold-400 mt-1">{studio.nome}</div>}
              </div>
              <div className="py-1">
                <button onClick={() => { setShowMenu(false); navigate('/impostazioni') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors">
                  <Settings size={16} /> Impostazioni
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/5 transition-colors">
                  <LogOut size={16} /> Esci
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
