-- ============================================================================
-- 00029: STORAGE POLICIES + BUCKET SETUP CON RLS
-- Sicurezza file-level, bucket per tipo documento, limiti dimensione
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CREAZIONE BUCKET
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('documenti', 'documenti', false, 52428800, -- 50MB
   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'text/plain','text/csv','application/rtf']),
  ('atti', 'atti', false, 104857600, -- 100MB
   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/pkcs7-mime','application/xml','text/xml']),
  ('fatture', 'fatture', false, 10485760, -- 10MB
   ARRAY['application/pdf','application/xml','text/xml','application/pkcs7-mime']),
  ('firme', 'firme', false, 5242880, -- 5MB
   ARRAY['application/x-pkcs12','application/x-pem-file','application/pkcs7-mime']),
  ('avatars', 'avatars', true, 2097152, -- 2MB
   ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('loghi', 'loghi', true, 5242880, -- 5MB
   ARRAY['image/jpeg','image/png','image/svg+xml','image/webp']),
  ('pct-depositi', 'pct-depositi', false, 31457280, -- 30MB
   ARRAY['application/pdf','application/xml','application/pkcs7-mime','application/zip']),
  ('backup', 'backup', false, 524288000, -- 500MB
   ARRAY['application/gzip','application/zip','application/x-tar'])
ON CONFLICT (id) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. STORAGE RLS POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Helper: extract studio_id from storage path (format: studio_id/...)
CREATE OR REPLACE FUNCTION storage_studio_id(p_name TEXT)
RETURNS UUID AS $$
  SELECT CASE 
    WHEN p_name ~ '^[0-9a-f]{8}-' THEN SPLIT_PART(p_name, '/', 1)::UUID
    ELSE NULL
  END
$$ LANGUAGE sql IMMUTABLE;

-- DOCUMENTI bucket: studio isolation
CREATE POLICY "documenti_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documenti' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "documenti_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documenti' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "documenti_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'documenti' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "documenti_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'documenti' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) IN ('titolare','socio','associato','collaboratore'));

-- ATTI bucket: only lawyers
CREATE POLICY "atti_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'atti' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "atti_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'atti' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) NOT IN ('amministrativo'));

CREATE POLICY "atti_storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'atti' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) IN ('titolare','socio'));

-- FATTURE bucket: admin + titolare
CREATE POLICY "fatture_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'fatture' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "fatture_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fatture' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) IN ('titolare','socio','amministrativo'));

-- PCT bucket: lawyers only
CREATE POLICY "pct_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'pct-depositi' AND storage_studio_id(name) = get_user_studio_id());

CREATE POLICY "pct_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pct-depositi' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) NOT IN ('segretaria','amministrativo'));

-- AVATARS: users can manage their own
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (name LIKE auth.uid()::TEXT || '/%'));

CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (name LIKE auth.uid()::TEXT || '/%'));

CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (name LIKE auth.uid()::TEXT || '/%'));

-- LOGHI: only studio admin
CREATE POLICY "loghi_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'loghi');

CREATE POLICY "loghi_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'loghi' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) IN ('titolare','socio'));

-- FIRME: only the certificate owner
CREATE POLICY "firme_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'firme' AND (name LIKE auth.uid()::TEXT || '/%'));

CREATE POLICY "firme_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'firme' AND (name LIKE auth.uid()::TEXT || '/%'));

CREATE POLICY "firme_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'firme' AND (name LIKE auth.uid()::TEXT || '/%'));

-- BACKUP: only titolare
CREATE POLICY "backup_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'backup' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) = 'titolare');

CREATE POLICY "backup_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'backup' AND storage_studio_id(name) = get_user_studio_id()
    AND (SELECT ruolo FROM profili WHERE id = auth.uid()) = 'titolare');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. STORAGE QUOTA CHECK
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION check_storage_quota(p_studio_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_used_bytes BIGINT;
  v_max_bytes BIGINT;
BEGIN
  SELECT COALESCE(SUM((metadata->>'size')::BIGINT), 0) INTO v_used_bytes
  FROM storage.objects
  WHERE storage_studio_id(name) = p_studio_id;

  SELECT max_storage_gb * 1073741824 INTO v_max_bytes
  FROM studi_legali WHERE id = p_studio_id;

  RETURN jsonb_build_object(
    'used_bytes', v_used_bytes,
    'max_bytes', v_max_bytes,
    'used_gb', ROUND(v_used_bytes / 1073741824.0, 2),
    'max_gb', v_max_bytes / 1073741824,
    'pct_used', ROUND(v_used_bytes::NUMERIC / NULLIF(v_max_bytes, 0) * 100, 1),
    'remaining_gb', ROUND((v_max_bytes - v_used_bytes) / 1073741824.0, 2),
    'alert', v_used_bytes > v_max_bytes * 0.9
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
