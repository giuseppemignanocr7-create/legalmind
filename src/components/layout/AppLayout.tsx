import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CoreMindPanel } from './CoreMindPanel'
import { NotificationCenter } from './NotificationCenter'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useUIStore } from '@/stores/uiStore'

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <CommandPalette />
      <CoreMindPanel />
      <NotificationCenter />

      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col transition-[margin] lg:ml-0"
      >
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}
