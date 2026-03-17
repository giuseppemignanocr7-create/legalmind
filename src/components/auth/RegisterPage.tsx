import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'

const errorMessages: Record<string, string> = {
  'User already registered': 'Questa email è già registrata. Prova ad accedere.',
  'Password should be at least 6 characters': 'La password deve avere almeno 6 caratteri',
  'Unable to validate email address: invalid format': 'Formato email non valido',
  'Signup requires a valid password': 'Inserisci una password valida',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomeStudio: '',
    tipoStudio: 'individuale',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  const passwordValid = form.password.length >= 8
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValid) {
      toast.error('La password deve avere almeno 8 caratteri')
      return
    }
    if (!passwordsMatch) {
      toast.error('Le password non coincidono')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nome: form.nome,
            cognome: form.cognome,
            nome_studio: form.nomeStudio,
            tipo_studio: form.tipoStudio,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error

      if (data.user?.identities?.length === 0) {
        toast.error('Questa email è già registrata. Prova ad accedere.')
        return
      }

      setRegistered(true)
    } catch (err: any) {
      const msg = errorMessages[err.message] || err.message || 'Errore durante la registrazione'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-accent-green" />
          </div>
          <h2 className="font-display text-3xl font-semibold text-text-primary mb-3">Registrazione completata!</h2>
          <p className="text-sm text-text-secondary mb-2">
            Abbiamo inviato un'email di conferma a:
          </p>
          <p className="text-gold-400 font-medium mb-6">{form.email}</p>
          <p className="text-sm text-text-muted mb-8">
            Clicca sul link nell'email per attivare il tuo account e accedere a LegalMind.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg">Vai al Login</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Scale size={20} className="text-bg-primary" />
          </div>
          <span className="font-display text-2xl font-bold gold-text">LegalMind</span>
        </div>

        <h2 className="font-display text-3xl font-semibold text-text-primary mb-2">Registra il tuo Studio</h2>
        <p className="text-sm text-text-secondary mb-8">Crea un account per iniziare a utilizzare LegalMind</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Mario" required />
            <Input label="Cognome" value={form.cognome} onChange={(e) => setForm({ ...form, cognome: e.target.value })} placeholder="Rossi" required />
          </div>

          <Input label="Nome Studio" value={form.nomeStudio} onChange={(e) => setForm({ ...form, nomeStudio: e.target.value })} placeholder="Studio Legale Rossi" required />

          <Select
            label="Tipo Studio"
            value={form.tipoStudio}
            onChange={(e) => setForm({ ...form, tipoStudio: e.target.value })}
            options={[
              { value: 'individuale', label: 'Individuale' },
              { value: 'associato', label: 'Associato' },
              { value: 'slp', label: 'SLP' },
              { value: 'sta', label: 'STA' },
              { value: 'societa_tra_avvocati', label: 'Società tra Avvocati' },
            ]}
          />

          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="avvocato@studio.it" required />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimo 8 caratteri"
              required
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-text-primary transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {form.password.length > 0 && (
              <p className={`text-xs mt-1 ${passwordValid ? 'text-accent-green' : 'text-accent-red'}`}>
                {passwordValid ? '✓ Password valida' : 'Minimo 8 caratteri'}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Conferma Password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Ripeti la password"
              required
            />
            {form.confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${passwordsMatch ? 'text-accent-green' : 'text-accent-red'}`}>
                {passwordsMatch ? '✓ Le password coincidono' : 'Le password non coincidono'}
              </p>
            )}
          </div>

          <Button type="submit" variant="gold" fullWidth size="lg" loading={isSubmitting} icon={<UserPlus size={18} />}>
            Registrati
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Hai già un account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Accedi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
