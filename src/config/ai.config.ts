export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  maxConversationHistory: 20,
  maxContextTokens: 8000,
  costPerInputToken: 0.003 / 1000,
  costPerOutputToken: 0.015 / 1000,
} as const

export const AI_FEATURES = {
  analisiPredittiva: true,
  redazioneAtti: true,
  ricercaGiurisprudenza: true,
  analisiContratto: true,
  calcoloTermini: true,
  assistenteUdienza: true,
  osservatorioNormativo: true,
} as const
