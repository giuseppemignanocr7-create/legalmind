import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    nomeStudio: '',
    tipoStudio: 'individuale',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
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
        },
      })
      if (error) throw error
      toast.success('Registrazione completata! Controlla la tua email per confermare l\'account.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.message || 'Errore durante la registrazione')
    } finally {
      setIsSubmitting(false)
    }
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
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimo 8 caratteri" required />

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
