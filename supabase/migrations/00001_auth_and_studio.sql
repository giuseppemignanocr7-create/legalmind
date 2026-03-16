-- 00001_auth_and_studio.sql

CREATE TYPE user_role AS ENUM (
  'titolare', 'socio', 'associato', 'collaboratore',
  'praticante', 'segretaria', 'amministrativo', 'consulente_esterno'
);

CREATE TYPE subscription_plan AS ENUM (
  'starter', 'professional', 'enterprise', 'enterprise_plus'
);

CREATE TYPE studio_type AS ENUM (
  'individuale', 'associato', 'slp', 'sta', 'societa_tra_avvocati'
);

CREATE TABLE studi_legali (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo studio_type NOT NULL DEFAULT 'individuale',
  partita_iva VARCHAR(11) UNIQUE,
  codice_fiscale VARCHAR(16),
  indirizzo_sede TEXT,
  cap VARCHAR(5),
  citta TEXT,
  provincia VARCHAR(2),
  regione TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  sito_web TEXT,
  codice_destinatario_sdi VARCHAR(7) DEFAULT '0000000',
  foro_competente TEXT,
  ordine_appartenenza TEXT,
  logo_url TEXT,
  subscription subscription_plan NOT NULL DEFAULT 'starter',
  subscription_expires_at TIMESTAMPTZ,
  max_users INT DEFAULT 3,
  max_fascicoli INT DEFAULT 100,
  max_storage_gb INT DEFAULT 10,
  settings JSONB DEFAULT '{
    "valuta": "EUR",
    "lingua": "it",
    "timezone": "Europe/Rome",
    "formato_data": "DD/MM/YYYY",
    "iva_default": 22,
    "cpa_default": 4,
    "ritenuta_acconto": 20,
    "numerazione_fatture": "YYYY/NNNN",
    "numerazione_fascicoli": "YYYY/NNNN-MATERIA",
    "firma_digitale_provider": null,
    "pec_provider": null,
    "backup_frequency": "daily",
    "two_factor_required": false,
    "ai_enabled": true,
    "ai_model": "claude-sonnet-4-20250514"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profili (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale VARCHAR(16),
  ruolo user_role NOT NULL DEFAULT 'collaboratore',
  titolo TEXT,
  specializzazioni TEXT[],
  numero_iscrizione_albo TEXT,
  ordine_appartenenza TEXT,
  telefono TEXT,
  email_personale TEXT,
  pec_personale TEXT,
  avatar_url TEXT,
  firma_digitale_cert_url TEXT,
  tariffa_oraria DECIMAL(10,2),
  obiettivo_ore_mensili INT DEFAULT 160,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{
    "theme": "dark",
    "lingua": "it",
    "notifiche_email": true,
    "notifiche_pec": true,
    "notifiche_push": true,
    "notifiche_sms": false,
    "dashboard_layout": "default",
    "ai_assistant_enabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profili_studio ON profili(studio_id);
CREATE INDEX idx_profili_ruolo ON profili(studio_id, ruolo);
