import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email! })
        navigate('/dashboard')
        toast.success('Accesso effettuato')
      }
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'accesso')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoAccess = () => {
    navigate('/dashboard')
    toast.success('Accesso demo attivato')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-bg-secondary border-r border-border-subtle flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-400 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold-400 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-lg"
        >
          <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-8 shadow-gold-lg">
            <Scale size={36} className="text-bg-primary" />
          </div>
          <h1 className="font-display text-5xl font-bold gold-text mb-4">LegalMind</h1>
          <p className="font-display text-xl text-text-secondary italic mb-2">Ecosystem UltraDivine</p>
          <p className="text-sm text-text-muted mt-6 leading-relaxed">
            La piattaforma enterprise per studi legali più avanzata al mondo.
            Intelligenza artificiale giuridica, gestione fascicoli, contabilità forense,
            osservatorio normativo — tutto in un unico ecosistema.
          </p>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Scale size={20} className="text-bg-primary" />
            </div>
            <span className="font-display text-2xl font-bold gold-text">LegalMind</span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-text-primary mb-2">Accedi</h2>
          <p className="text-sm text-text-secondary mb-8">Inserisci le tue credenziali per accedere alla piattaforma</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="avvocato@studio.it"
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-text-primary transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border-medium bg-bg-tertiary" />
                Ricordami
              </label>
              <Link to="/forgot-password" className="text-gold-400 hover:text-gold-300 transition-colors">
                Password dimenticata?
              </Link>
            </div>

            <Button type="submit" variant="gold" fullWidth size="lg" loading={isSubmitting} icon={<LogIn size={18} />}>
              Accedi
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Non hai un account?{' '}
              <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                Registrati
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle">
            <Button variant="secondary" fullWidth onClick={handleDemoAccess}>
              Accedi in modalità Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
