import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, FileText, Clock, Users, Wallet,
  Scale, Search, Shield, Building2, Briefcase, Lock,
  BarChart3, GraduationCap, Settings, ChevronLeft, ChevronRight, Brain, X
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fascicoli', label: 'Fascicoli', icon: FolderOpen },
  { path: '/atti', label: 'Atti & Contratti', icon: FileText },
  { path: '/scadenziario', label: 'Scadenziario', icon: Clock },
  { path: '/clienti', label: 'Clienti & CRM', icon: Users },
  { path: '/contabilita', label: 'Contabilità', icon: Wallet },
  { path: '/normativa', label: 'Osservatorio Normativo', icon: Scale },
  { path: '/giurisprudenza', label: 'Giurisprudenza', icon: Search },
  { path: '/penale', label: 'Penale', icon: Shield },
  { path: '/tributario', label: 'Tributario', icon: Building2 },
  { path: '/lavoro', label: 'Lavoro', icon: Briefcase },
  { path: '/privacy', label: 'Privacy & GDPR', icon: Lock },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/academy', label: 'Academy', icon: GraduationCap },
  { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed left-0 top-0 h-screen z-40 flex flex-col
          bg-bg-secondary border-r border-border-subtle
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-subtle">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                  <Scale size={16} className="text-bg-primary" />
                </div>
                <div>
                  <span className="font-display text-lg font-bold gold-text">LegalMind</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center mx-auto"
              >
                <Scale size={16} className="text-bg-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              toggleSidebar()
              setSidebarMobileOpen(false)
            }}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors hidden lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                  }
                `}
              >
                <item.icon size={18} className={isActive ? 'text-gold-400' : 'text-text-muted group-hover:text-text-secondary'} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </nav>

        {/* CoreMind AI button */}
        <div className="p-3 border-t border-border-subtle">
          <button
            onClick={() => useUIStore.getState().toggleCoreMindPanel()}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              bg-gradient-to-r from-gold-400/10 to-gold-300/5
              border border-border-gold text-gold-400
              hover:from-gold-400/20 hover:to-gold-300/10
              transition-all duration-300 animate-pulse-gold
            `}
          >
            <Brain size={18} />
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold">CoreMind AI</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
