import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Brain, Sparkles, Trash2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAIStore } from '@/stores/aiStore'

export function CoreMindPanel() {
  const { coreMindPanelOpen, setCoreMindPanelOpen } = useUIStore()
  const { messages, isProcessing, addMessage, clearChat } = useAIStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage = {
      id: crypto.randomUUID(),
      conversazione_id: '',
      ruolo: 'user' as const,
      contenuto: input.trim(),
      created_at: new Date().toISOString(),
    }
    addMessage(userMessage)
    setInput('')

    // AI response placeholder - will be connected to CoreMind engine
    const aiResponse = {
      id: crypto.randomUUID(),
      conversazione_id: '',
      ruolo: 'assistant' as const,
      contenuto: 'CoreMind AI è in fase di configurazione. Configura le credenziali Anthropic API nel file .env.local per attivare l\'assistente giuridico.',
      created_at: new Date().toISOString(),
    }
    setTimeout(() => addMessage(aiResponse), 500)
  }

  return (
    <AnimatePresence>
      {coreMindPanelOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-screen w-96 z-50 bg-bg-secondary border-l border-border-gold shadow-gold-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <Brain size={16} className="text-bg-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">CoreMind AI</h3>
                <p className="text-[10px] text-gold-400 uppercase tracking-wider">Assistente Giuridico</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                title="Nuova conversazione"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setCoreMindPanelOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-bg-primary" />
                </div>
                <h4 className="font-display text-lg font-semibold text-text-primary mb-2">
                  CoreMind Legal AI
                </h4>
                <p className="text-sm text-text-secondary mb-6">
                  Assistente giuridico avanzato. Analisi cause, redazione atti, ricerca giurisprudenziale, calcolo termini.
                </p>
                <div className="space-y-2 w-full">
                  {[
                    'Analizza il fascicolo corrente',
                    'Cerca giurisprudenza su...',
                    'Calcola i termini processuali',
                    'Redigi un atto di citazione',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left px-3 py-2 text-xs text-text-secondary bg-bg-tertiary rounded-lg hover:bg-bg-elevated hover:text-gold-400 transition-colors border border-border-subtle"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.ruolo === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed
                    ${msg.ruolo === 'user'
                      ? 'bg-gold-400/10 text-text-primary border border-gold-400/20'
                      : 'bg-bg-tertiary text-text-primary border border-border-subtle'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap">{msg.contenuto}</div>
                  <div className="text-[10px] text-text-muted mt-2">
                    {new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-bg-tertiary rounded-xl px-4 py-3 border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-text-muted">CoreMind sta analizzando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border-subtle shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Chiedi a CoreMind..."
                rows={1}
                className="flex-1 bg-bg-tertiary border border-border-medium rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="p-3 rounded-xl bg-gold-400 text-bg-primary hover:bg-gold-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
