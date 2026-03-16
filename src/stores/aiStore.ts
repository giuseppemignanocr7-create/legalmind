import { create } from 'zustand'
import type { AIMessaggio } from '@/types'

interface AIState {
  conversationId: string | null
  messages: AIMessaggio[]
  isProcessing: boolean
  currentFascicoloContext: string | null
  setConversationId: (id: string | null) => void
  addMessage: (message: AIMessaggio) => void
  setMessages: (messages: AIMessaggio[]) => void
  setProcessing: (processing: boolean) => void
  setFascicoloContext: (fascicoloId: string | null) => void
  clearChat: () => void
}

export const useAIStore = create<AIState>((set) => ({
  conversationId: null,
  messages: [],
  isProcessing: false,
  currentFascicoloContext: null,
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setFascicoloContext: (fascicoloId) => set({ currentFascicoloContext: fascicoloId }),
  clearChat: () => set({ conversationId: null, messages: [], currentFascicoloContext: null }),
}))
