export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LegalMind'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export const MATERIE_LEGALI = [
  { value: 'civile', label: 'Civile' },
  { value: 'penale', label: 'Penale' },
  { value: 'amministrativo', label: 'Amministrativo' },
  { value: 'tributario', label: 'Tributario' },
  { value: 'lavoro', label: 'Lavoro' },
  { value: 'famiglia', label: 'Famiglia' },
  { value: 'societario', label: 'Societario' },
  { value: 'fallimentare', label: 'Fallimentare' },
  { value: 'esecuzioni', label: 'Esecuzioni' },
  { value: 'stragiudiziale', label: 'Stragiudiziale' },
  { value: 'recupero_crediti', label: 'Recupero Crediti' },
  { value: 'immobiliare', label: 'Immobiliare' },
  { value: 'proprieta_intellettuale', label: 'Proprietà Intellettuale' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'ambientale', label: 'Ambientale' },
  { value: 'internazionale', label: 'Internazionale' },
  { value: 'comunitario', label: 'Comunitario' },
  { value: 'altro', label: 'Altro' },
] as const

export const STATI_FASCICOLO = [
  { value: 'aperto', label: 'Aperto', color: 'accent-green' },
  { value: 'in_corso', label: 'In Corso', color: 'accent-blue' },
  { value: 'sospeso', label: 'Sospeso', color: 'accent-orange' },
  { value: 'in_attesa', label: 'In Attesa', color: 'gold-400' },
  { value: 'chiuso_favorevole', label: 'Chiuso Favorevole', color: 'accent-green' },
  { value: 'chiuso_sfavorevole', label: 'Chiuso Sfavorevole', color: 'accent-red' },
  { value: 'chiuso_transazione', label: 'Chiuso Transazione', color: 'accent-purple' },
  { value: 'archiviato', label: 'Archiviato', color: 'text-muted' },
  { value: 'annullato', label: 'Annullato', color: 'text-muted' },
] as const

export const URGENZE = [
  { value: 'bassa', label: 'Bassa', color: '#4ADE80' },
  { value: 'media', label: 'Media', color: '#4A90D9' },
  { value: 'alta', label: 'Alta', color: '#FF8C00' },
  { value: 'critica', label: 'Critica', color: '#DC143C' },
] as const

export const RUOLI_UTENTE = [
  { value: 'titolare', label: 'Titolare' },
  { value: 'socio', label: 'Socio' },
  { value: 'associato', label: 'Associato' },
  { value: 'collaboratore', label: 'Collaboratore' },
  { value: 'praticante', label: 'Praticante' },
  { value: 'segretaria', label: 'Segretaria' },
  { value: 'amministrativo', label: 'Amministrativo' },
  { value: 'consulente_esterno', label: 'Consulente Esterno' },
] as const

export const TIPI_ATTO = [
  { value: 'atto_citazione', label: 'Atto di Citazione' },
  { value: 'comparsa_risposta', label: 'Comparsa di Risposta' },
  { value: 'memoria_183', label: 'Memoria ex art. 183' },
  { value: 'memoria_difensiva', label: 'Memoria Difensiva' },
  { value: 'memoria_replica', label: 'Memoria di Replica' },
  { value: 'ricorso', label: 'Ricorso' },
  { value: 'controricorso', label: 'Controricorso' },
  { value: 'appello', label: 'Appello' },
  { value: 'ricorso_cassazione', label: 'Ricorso in Cassazione' },
  { value: 'istanza', label: 'Istanza' },
  { value: 'precetto', label: 'Precetto' },
  { value: 'decreto_ingiuntivo', label: 'Decreto Ingiuntivo' },
  { value: 'opposizione', label: 'Opposizione' },
  { value: 'querela', label: 'Querela' },
  { value: 'denuncia', label: 'Denuncia' },
  { value: 'costituzione_parte_civile', label: 'Costituzione Parte Civile' },
  { value: 'conclusioni', label: 'Conclusioni' },
  { value: 'nota_deposito', label: 'Nota di Deposito' },
  { value: 'contratto', label: 'Contratto' },
  { value: 'parere', label: 'Parere' },
  { value: 'diffida', label: 'Diffida' },
  { value: 'transazione', label: 'Transazione' },
  { value: 'procura', label: 'Procura' },
  { value: 'delega', label: 'Delega' },
  { value: 'verbale', label: 'Verbale' },
  { value: 'altro', label: 'Altro' },
] as const
