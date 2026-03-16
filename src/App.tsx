import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { ForgotPassword } from '@/components/auth/ForgotPassword'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { FascicoliPage } from '@/components/fascicoli/FascicoliPage'
import { FascicoloDetail } from '@/components/fascicoli/FascicoloDetail'
import { ClientiPage } from '@/components/clienti/ClientiPage'
import { AttiPage } from '@/components/atti/AttiPage'
import { ScadenziarioPage } from '@/components/scadenziario/ScadenziarioPage'
import { ContabilitaPage } from '@/components/contabilita/ContabilitaPage'
import { OsservatorioPage } from '@/components/normativa/OsservatorioPage'
import { GiurisprudenzaPage } from '@/components/giurisprudenza/GiurisprudenzaPage'
import { PenalePage } from '@/components/penale/PenalePage'
import { TributarioPage } from '@/components/tributario/TributarioPage'
import { LavoroPage } from '@/components/lavoro/LavoroPage'
import { PrivacyPage } from '@/components/privacy/PrivacyPage'
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage'
import { AcademyPage } from '@/components/academy/AcademyPage'
import { SettingsPage } from '@/components/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fascicoli" element={<FascicoliPage />} />
            <Route path="/fascicoli/:id" element={<FascicoloDetail />} />
            <Route path="/clienti" element={<ClientiPage />} />
            <Route path="/atti" element={<AttiPage />} />
            <Route path="/scadenziario" element={<ScadenziarioPage />} />
            <Route path="/contabilita" element={<ContabilitaPage />} />
            <Route path="/normativa" element={<OsservatorioPage />} />
            <Route path="/giurisprudenza" element={<GiurisprudenzaPage />} />
            <Route path="/penale" element={<PenalePage />} />
            <Route path="/tributario" element={<TributarioPage />} />
            <Route path="/lavoro" element={<LavoroPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/impostazioni" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
