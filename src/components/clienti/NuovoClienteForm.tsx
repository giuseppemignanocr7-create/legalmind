import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, UserPlus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useCreateCliente, useConflictCheck } from '@/hooks/useClienti'
import { validateCodiceFiscale, validatePartitaIva } from '@/lib/utils/validators'
import { toast } from 'sonner'

const clienteSchema = z.object({
  tipo: z.enum(['persona_fisica', 'persona_giuridica', 'ente_pubblico', 'associazione']),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  ragione_sociale: z.string().optional(),
  codice_fiscale: z.string().optional().refine(v => !v || validateCodiceFiscale(v), 'Codice fiscale non valido'),
  partita_iva: z.string().optional().refine(v => !v || validatePartitaIva(v), 'Partita IVA non valida'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  pec: z.string().email('PEC non valida').optional().or(z.literal('')),
  telefono: z.string().optional(),
  cellulare: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  cap: z.string().regex(/^\d{5}$/, 'CAP non valido').optional().or(z.literal('')),
  nazione: z.string().default('IT'),
  note: z.string().optional(),
}).refine(data => {
  if (data.tipo === 'persona_fisica') return data.nome && data.cognome
  return data.ragione_sociale
}, { message: 'Compila nome/cognome oppure ragione sociale', path: ['nome'] })

type ClienteForm = z.infer<typeof clienteSchema>

export function NuovoClienteForm() {
  const navigate = useNavigate()
  const createCliente = useCreateCliente()
  const conflictCheck = useConflictCheck()
  const [conflictResult, setConflictResult] = useState<any>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema) as any,
    defaultValues: { tipo: 'persona_fisica', nazione: 'IT' },
  })

  const tipo = watch('tipo')
  const isPersonaFisica = tipo === 'persona_fisica'

  const onSubmit = async (data: ClienteForm) => {
    try {
      const displayName = isPersonaFisica ? `${data.cognome} ${data.nome}` : data.ragione_sociale
      await createCliente.mutateAsync({
        ...data,
        display_name: displayName,
        stato: 'attivo',
      } as any)
      navigate('/clienti')
    } catch {
      toast.error('Errore nella creazione del cliente')
    }
  }

  const runConflictCheck = async () => {
    const nome = watch('nome') || watch('ragione_sociale') || ''
    const cf = watch('codice_fiscale') || ''
    if (!nome && !cf) { toast.error('Inserisci almeno un nome o codice fiscale'); return }
    try {
      const result = await conflictCheck.mutateAsync({ nome, codiceFiscale: cf })
      setConflictResult(result)
      if (!result || result.length === 0) toast.success('Nessun conflitto rilevato')
      else toast.warning(`Trovati ${result.length} potenziali conflitti`)
    } catch {
      toast.info('Conflict check non disponibile senza Supabase')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button onClick={() => navigate('/clienti')} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-section-title text-text-primary">Nuovo Cliente</h1>
          <p className="text-sm text-text-secondary mt-1">Inserisci i dati del nuovo soggetto</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-text-primary">Tipo Soggetto</h3>
            <Button type="button" variant="secondary" size="sm" icon={<ShieldCheck size={14} />} onClick={runConflictCheck} loading={conflictCheck.isPending}>
              Conflict Check
            </Button>
          </div>
          <Select label="Tipo *" options={[
            { value: 'persona_fisica', label: 'Persona Fisica' },
            { value: 'persona_giuridica', label: 'Persona Giuridica' },
            { value: 'ente_pubblico', label: 'Ente Pubblico' },
            { value: 'associazione', label: 'Associazione' },
          ]} {...register('tipo')} />

          {conflictResult && conflictResult.length > 0 && (
            <div className="mt-4 p-3 bg-accent-orange/10 border border-accent-orange/20 rounded-lg">
              <p className="text-sm font-medium text-accent-orange mb-2">Potenziali conflitti trovati:</p>
              {conflictResult.map((c: any, i: number) => (
                <div key={i} className="text-xs text-text-secondary">• {c.nome} — {c.tipo_conflitto}</div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Anagrafica</h3>
          {isPersonaFisica ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome *" placeholder="Mario" error={errors.nome?.message} {...register('nome')} />
              <Input label="Cognome *" placeholder="Rossi" error={errors.cognome?.message} {...register('cognome')} />
            </div>
          ) : (
            <Input label="Ragione Sociale *" placeholder="Rossi S.r.l." error={errors.ragione_sociale?.message} {...register('ragione_sociale')} />
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input label="Codice Fiscale" placeholder="RSSMRA80A01H501Z" error={errors.codice_fiscale?.message} {...register('codice_fiscale')} />
            <Input label="Partita IVA" placeholder="12345678901" error={errors.partita_iva?.message} {...register('partita_iva')} />
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Contatti</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" placeholder="mario@email.it" error={errors.email?.message} {...register('email')} />
            <Input label="PEC" type="email" placeholder="mario@pec.it" error={errors.pec?.message} {...register('pec')} />
            <Input label="Telefono" placeholder="+39 06 1234567" {...register('telefono')} />
            <Input label="Cellulare" placeholder="+39 333 1234567" {...register('cellulare')} />
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Indirizzo</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Indirizzo" placeholder="Via Roma 1" {...register('indirizzo')} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Città" placeholder="Roma" {...register('citta')} />
              <Input label="Provincia" placeholder="RM" {...register('provincia')} />
              <Input label="CAP" placeholder="00100" error={errors.cap?.message} {...register('cap')} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Note</h3>
          <textarea {...register('note')} rows={3} placeholder="Note aggiuntive..."
            className="w-full bg-bg-secondary border border-border-medium rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all resize-none" />
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => navigate('/clienti')}>Annulla</Button>
          <Button type="submit" variant="gold" icon={<Save size={16} />} loading={isSubmitting}>Salva Cliente</Button>
        </div>
      </form>
    </div>
  )
}
