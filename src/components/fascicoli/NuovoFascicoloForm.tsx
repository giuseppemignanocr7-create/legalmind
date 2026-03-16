import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MATERIE_LEGALI } from '@/config/constants'
import { useCreateFascicolo } from '@/hooks/useFascicoli'
import { useClienti } from '@/hooks/useClienti'
import { toast } from 'sonner'

const fascicoloSchema = z.object({
  materia: z.string().min(1, 'Seleziona una materia'),
  oggetto: z.string().min(3, 'Oggetto obbligatorio (min 3 caratteri)'),
  descrizione: z.string().optional(),
  valore_causa: z.number().positive('Il valore deve essere positivo').optional().or(z.literal(0)),
  autorita_giudiziaria: z.string().optional(),
  sezione: z.string().optional(),
  numero_rg: z.string().optional(),
  giudice: z.string().optional(),
  priorita: z.number().min(1).max(5).default(3),
  note_interne: z.string().optional(),
})

type FascicoloForm = z.infer<typeof fascicoloSchema>

interface Parte {
  soggetto_id: string
  soggetto_nome: string
  ruolo: string
  tipo_parte: 'cliente' | 'controparte' | 'terzo'
}

export function NuovoFascicoloForm() {
  const navigate = useNavigate()
  const createFascicolo = useCreateFascicolo()
  const { data: clienti } = useClienti()
  const [parti, setParti] = useState<Parte[]>([])
  const [searchCliente, setSearchCliente] = useState('')
  const [showClienteSearch, setShowClienteSearch] = useState(false)

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FascicoloForm>({
    resolver: zodResolver(fascicoloSchema) as any,
    defaultValues: { priorita: 3, materia: '' },
  })

  const onSubmit = async (data: FascicoloForm) => {
    try {
      const result = await createFascicolo.mutateAsync({
        ...data,
        valore_causa: data.valore_causa || null,
        stato: 'aperto',
      } as any)
      toast.success('Fascicolo creato con successo')
      navigate(`/fascicoli/${result.id}`)
    } catch {
      toast.error('Errore nella creazione del fascicolo')
    }
  }

  const addParte = (cliente: any, tipo: 'cliente' | 'controparte' | 'terzo') => {
    setParti([...parti, {
      soggetto_id: cliente.id,
      soggetto_nome: cliente.display_name,
      ruolo: tipo === 'cliente' ? 'attore' : tipo === 'controparte' ? 'convenuto' : 'terzo_chiamato',
      tipo_parte: tipo,
    }])
    setShowClienteSearch(false)
    setSearchCliente('')
  }

  const removeParte = (index: number) => {
    setParti(parti.filter((_, i) => i !== index))
  }

  const filteredClienti = clienti?.filter(c =>
    c.display_name?.toLowerCase().includes(searchCliente.toLowerCase())
  ) || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/fascicoli')} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-section-title text-text-primary">Nuovo Fascicolo</h1>
            <p className="text-sm text-text-secondary mt-1">Compila i dati per aprire un nuovo fascicolo</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Dati principali */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Dati Principali</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Materia *" options={MATERIE_LEGALI.map(m => ({ value: m.value, label: m.label }))} placeholder="Seleziona materia" error={errors.materia?.message} {...register('materia')} />
            <Controller name="priorita" control={control} render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-label uppercase text-text-secondary tracking-widest">Priorità</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(p => (
                    <button key={p} type="button" onClick={() => field.onChange(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${field.value >= p ? 'bg-gold-400 text-bg-primary' : 'bg-bg-tertiary text-text-muted border border-border-medium'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )} />
          </div>
          <div className="mt-4">
            <Input label="Oggetto *" placeholder="Es: Risarcimento danni da responsabilità medica" error={errors.oggetto?.message} {...register('oggetto')} />
          </div>
          <div className="mt-4">
            <label className="text-label uppercase text-text-secondary tracking-widest mb-1.5 block">Descrizione</label>
            <textarea {...register('descrizione')} rows={4} placeholder="Descrivi brevemente il caso..."
              className="w-full bg-bg-secondary border border-border-medium rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all resize-none" />
          </div>
        </Card>

        {/* Dati giudiziari */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Dati Giudiziari</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Autorità Giudiziaria" placeholder="Es: Tribunale di Roma" {...register('autorita_giudiziaria')} />
            <Input label="Sezione" placeholder="Es: III Sezione Civile" {...register('sezione')} />
            <Input label="Numero RG" placeholder="Es: 1234/2025" {...register('numero_rg')} />
            <Input label="Giudice" placeholder="Es: Dott. Rossi" {...register('giudice')} />
          </div>
          <div className="mt-4">
            <Input label="Valore Causa (€)" type="number" step="0.01" placeholder="0.00" {...register('valore_causa', { valueAsNumber: true })} error={errors.valore_causa?.message} />
          </div>
        </Card>

        {/* Parti */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-text-primary">Parti del Procedimento</h3>
            <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setShowClienteSearch(true)}>
              Aggiungi Parte
            </Button>
          </div>

          {showClienteSearch && (
            <div className="mb-4 p-4 bg-bg-tertiary rounded-lg border border-border-medium">
              <Input placeholder="Cerca cliente per nome..." value={searchCliente} onChange={e => setSearchCliente(e.target.value)} icon={<Search size={16} />} />
              {searchCliente.length >= 2 && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredClienti.length === 0 ? (
                    <p className="text-xs text-text-muted py-2">Nessun cliente trovato. <button type="button" onClick={() => navigate('/clienti/nuovo')} className="text-gold-400 hover:underline">Crea nuovo</button></p>
                  ) : filteredClienti.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-elevated transition-colors">
                      <span className="text-sm text-text-primary">{c.display_name}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => addParte(c, 'cliente')} className="px-2 py-1 text-[10px] bg-accent-green/10 text-accent-green rounded">Cliente</button>
                        <button type="button" onClick={() => addParte(c, 'controparte')} className="px-2 py-1 text-[10px] bg-accent-red/10 text-accent-red rounded">Controparte</button>
                        <button type="button" onClick={() => addParte(c, 'terzo')} className="px-2 py-1 text-[10px] bg-accent-blue/10 text-accent-blue rounded">Terzo</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {parti.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Nessuna parte aggiunta. Clicca "Aggiungi Parte" per iniziare.</p>
          ) : (
            <div className="space-y-2">
              {parti.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Badge variant={p.tipo_parte === 'cliente' ? 'green' : p.tipo_parte === 'controparte' ? 'red' : 'blue'} size="sm">
                      {p.tipo_parte}
                    </Badge>
                    <span className="text-sm text-text-primary">{p.soggetto_nome}</span>
                    <span className="text-xs text-text-muted">({p.ruolo})</span>
                  </div>
                  <button type="button" onClick={() => removeParte(i)} className="p-1 text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Note */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Note Interne</h3>
          <textarea {...register('note_interne')} rows={3} placeholder="Note interne non visibili al cliente..."
            className="w-full bg-bg-secondary border border-border-medium rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all resize-none" />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => navigate('/fascicoli')}>Annulla</Button>
          <Button type="submit" variant="gold" icon={<Save size={16} />} loading={isSubmitting}>Crea Fascicolo</Button>
        </div>
      </form>
    </div>
  )
}
