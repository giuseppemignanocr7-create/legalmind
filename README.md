# LegalMind — Ecosystem UltraDivine

> Piattaforma gestionale AI di nuova generazione per studi legali italiani.

![Build](https://img.shields.io/badge/build-passing-brightgreen) ![Tests](https://img.shields.io/badge/tests-28%20passing-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![License](https://img.shields.io/badge/license-proprietary-gold)

## Stack Tecnologico

| Layer | Tecnologie |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | TailwindCSS 3, Framer Motion, dark/light theme |
| **State** | Zustand (6 stores), TanStack React Query |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions) |
| **AI** | Anthropic Claude via CoreMind Engine (7 prompt template) |
| **Charts** | Recharts (4 tipi di grafici) |
| **Editor** | TipTap (rich text con toolbar e BubbleMenu) |
| **PDF** | jsPDF + jspdf-autotable (fatture, report) |
| **Testing** | Vitest + Testing Library |
| **CI/CD** | GitHub Actions (lint → test → build) |

## Funzionalità

### Gestione Studio Legale
- **Fascicoli** — CRUD completo, vista Kanban, dettaglio con 8 tab, analisi predittiva AI
- **Clienti & CRM** — Anagrafica, conflict check, validazione CF/PIVA
- **Atti & Contratti** — Redazione con TipTap editor, template AI, firma digitale
- **Scadenziario Forense** — Calendario visuale, calcolo termini processuali, alert automatici
- **Contabilità** — Fatturazione, parcelle DM 55, time tracking, KPI finanziari

### Processo Civile Telematico (PCT)
- **Depositi telematici** — Workflow completo bozza → firma → invio → accettazione
- **Consultazione registri** — Integrazione SICID/SIECIC/SIGP
- **PEC integrata** — Casella PEC con sincronizzazione automatica
- **Firma digitale** — CAdES (P7M), PAdES (PDF), XAdES (XML)

### Fatturazione Elettronica
- **XML FatturaPA** — Generazione conforme a specifiche SdI
- **Invio SdI** — Workflow con tracking stato (inviata/consegnata/accettata/rifiutata)
- **Conservazione digitale** — Conforme CAD e DPCM 3/12/2013
- **Tipi documento** — TD01, TD02, TD04, TD06, TD24

### CoreMind AI
- **Chat AI giuridico** — Connessione reale ad Anthropic Claude via Edge Function
- **7 prompt template** — Analisi fascicolo, ricerca giurisprudenza, redazione atti, calcolo termini, GDPR, strategia, parere
- **Demo mode** — Risposte intelligenti su termini, risarcimento, contratti senza API key
- **Analisi predittiva** — Score probabilità esito favorevole

### Calcoli Legali
- **Parcelle DM 55** — Scaglioni, parametri per fase, maggiorazioni/riduzioni
- **Contributo Unificato** — DPR 115/2002 con tutti i tipi (civile, lavoro, appello, cassazione, esecuzione)
- **Termini Processuali** — Calcolo con sospensione feriale e festività italiane
- **Interessi Legali** — Tassi storici dal 1942 con calcolo pro-rata

### Analytics & Report
- **4 grafici Recharts** — Fatturato mensile, fascicoli per materia, ore avvocati, forecast AI
- **KPI dashboard** — Tasso successo, clienti attivi, tariffa media, fatturato YTD
- **Export PDF** — Report con layout brandizzato LegalMind

### Infrastruttura
- **22 + 1 migrazioni SQL** — Schema completo con RLS, trigger, funzioni, indici
- **Full-text search** — pg_trgm + tsvector con funzione `global_search`
- **Realtime** — Supabase subscriptions su tutte le tabelle con notifiche live
- **PWA** — Manifest, meta tag Apple, installabile su mobile
- **Dark/Light theme** — Toggle con persistenza localStorage
- **Command Palette** — Ctrl+K per navigazione e azioni rapide

## Quick Start

```bash
# 1. Clone
git clone https://github.com/giuseppemignanocr7-create/legalmind.git
cd legalmind

# 2. Installa dipendenze
npm install

# 3. Configura ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase e Anthropic

# 4. Avvia dev server
npm run dev
# → http://localhost:5173

# 5. Test
npx vitest run

# 6. Build produzione
npm run build
npm run preview
```

## Configurazione Ambiente

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=sk-ant-your-key
VITE_APP_NAME=LegalMind
VITE_APP_VERSION=1.0.0
```

> **Demo Mode**: senza credenziali Supabase, l'app funziona automaticamente in modalità demo con utente `avvocato@legalmind.it`.

## Struttura Progetto

```
src/
├── components/
│   ├── auth/          # Login, Register, ForgotPassword, AuthGuard
│   ├── dashboard/     # 6 widget (Stats, Scadenze, Udienze, Fascicoli, Normativa, AI)
│   ├── fascicoli/     # Lista, dettaglio (8 tab), form creazione
│   ├── clienti/       # Lista, form creazione con conflict check
│   ├── atti/          # Lista atti con badge AI
│   ├── scadenziario/  # Vista lista/calendario con urgenze
│   ├── contabilita/   # Fatture, fatturazione elettronica
│   ├── pct/           # PCT: depositi, registri, PEC, firma
│   ├── analytics/     # 4 grafici Recharts + KPI
│   ├── layout/        # Sidebar, Header, AppLayout, CoreMind, Notifiche
│   └── ui/            # 17 primitive (Button, Input, Card, Modal, Calendar, Kanban, TipTap, FileUpload...)
├── stores/            # 6 Zustand stores
├── hooks/             # 9 React Query hooks + useRealtime
├── lib/
│   ├── ai/            # CoreMind engine + prompt template
│   ├── calcoli/       # DM55, CU, termini, interessi legali
│   └── utils/         # formatters, validators, date-utils, pdf-export
├── config/            # supabase, constants, routes, ai.config
├── types/             # 11 definizioni TypeScript
├── styles/            # globals.css (dark + light theme)
└── test/              # setup Vitest
```

## Test

```bash
npx vitest run          # Esegui tutti i test
npx vitest --watch      # Watch mode
npx vitest --coverage   # Con coverage report
```

**28 test** su formatters e contributo unificato. Coverage su librerie di calcolo legale.

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`):
1. **Lint & Type Check** — `tsc --noEmit` + `vite build`
2. **Unit Tests** — `vitest run --coverage`
3. **Production Build** — Artifact upload

## Database

23 migrazioni SQL in `supabase/migrations/`:
- Schema completo per fascicoli, clienti, atti, scadenze, udienze, fatture
- RLS (Row Level Security) per multi-tenant
- Trigger per audit trail e search vector update
- Full-text search con `pg_trgm` + `tsvector`
- Funzione `global_search()` per ricerca cross-entity

## Licenza

Proprietaria — © 2025 LegalMind. Tutti i diritti riservati.
