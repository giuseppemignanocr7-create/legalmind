-- 00023_auth_trigger.sql
-- Auto-create studio + profilo when a new user signs up via Supabase Auth

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_studio_id UUID;
  v_nome TEXT;
  v_cognome TEXT;
  v_nome_studio TEXT;
  v_tipo_studio TEXT;
BEGIN
  -- Extract metadata from signup
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Utente');
  v_cognome := COALESCE(NEW.raw_user_meta_data->>'cognome', '');
  v_nome_studio := COALESCE(NEW.raw_user_meta_data->>'nome_studio', 'Studio Legale ' || v_cognome);
  v_tipo_studio := COALESCE(NEW.raw_user_meta_data->>'tipo_studio', 'individuale');

  -- Create studio
  INSERT INTO public.studi_legali (nome, tipo, email, subscription, max_users, max_fascicoli, max_storage_gb)
  VALUES (
    v_nome_studio,
    v_tipo_studio::studio_type,
    NEW.email,
    'starter',
    3,
    100,
    10
  )
  RETURNING id INTO v_studio_id;

  -- Create profilo linked to auth user
  INSERT INTO public.profili (id, studio_id, nome, cognome, ruolo, email_personale, is_active)
  VALUES (
    NEW.id,
    v_studio_id,
    v_nome,
    v_cognome,
    'titolare',
    NEW.email,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Allow new users to read their own profile (needed before RLS policies from 00018)
-- The profili RLS from 00018 uses get_user_studio_id() which queries profili itself,
-- so we need a bootstrap policy that allows a user to read their own row
CREATE POLICY "Users can read own profile" ON profili
  FOR SELECT USING (id = auth.uid());

-- Allow authenticated users to read their own studio
CREATE POLICY "Users can read own studio" ON studi_legali
  FOR SELECT USING (
    id IN (SELECT studio_id FROM profili WHERE id = auth.uid())
  );

-- Enable RLS on studi_legali if not already
ALTER TABLE studi_legali ENABLE ROW LEVEL SECURITY;
