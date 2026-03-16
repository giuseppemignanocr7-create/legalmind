import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setSent(true)
      toast.success('Email di recupero inviata')
    } catch (err: any) {
      toast.error(err.message || 'Errore nell\'invio')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Scale size={20} className="text-bg-primary" />
          </div>
          <span className="font-display text-2xl font-bold gold-text">LegalMind</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-accent-green" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">Email inviata</h2>
            <p className="text-sm text-text-secondary mb-8">
              Controlla la tua casella email per il link di recupero password.
            </p>
            <Link to="/login">
              <Button variant="secondary" icon={<ArrowLeft size={16} />}>Torna al login</Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-display text-3xl font-semibold text-text-primary mb-2">Recupera password</h2>
            <p className="text-sm text-text-secondary mb-8">Inserisci la tua email per ricevere il link di recupero</p>

            <form onSubmit={handleReset} className="space-y-5">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="avvocato@studio.it" required />
              <Button type="submit" variant="gold" fullWidth size="lg" loading={isSubmitting}>Invia link di recupero</Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition-colors">
                <ArrowLeft size={14} /> Torna al login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
