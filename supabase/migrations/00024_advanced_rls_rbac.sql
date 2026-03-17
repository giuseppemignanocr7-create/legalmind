-- ============================================================================
-- 00024: ADVANCED RLS + RBAC (Role-Based Access Control)
-- Ingegneria estrema: permessi granulari per ruolo, operazione e contesto
-- ============================================================================

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT ruolo FROM profili WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is admin (titolare/socio)
CREATE OR REPLACE FUNCTION is_studio_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM profili 
    WHERE id = auth.uid() AND ruolo IN ('titolare', 'socio')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is assigned to fascicolo
CREATE OR REPLACE FUNCTION is_assigned_to_fascicolo(p_fascicolo_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM fascicoli 
    WHERE id = p_fascicolo_id 
    AND (
      avvocato_responsabile = auth.uid()
      OR dominus = auth.uid()
      OR auth.uid() = ANY(co_counsel)
    )
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(p_entity TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_studio_id UUID;
  v_plan subscription_plan;
  v_max INT;
  v_current INT;
BEGIN
  SELECT studio_id INTO v_studio_id FROM profili WHERE id = auth.uid();
  SELECT subscription, max_fascicoli INTO v_plan, v_max FROM studi_legali WHERE id = v_studio_id;
  
  IF p_entity = 'fascicoli' THEN
    SELECT COUNT(*) INTO v_current FROM fascicoli WHERE studio_id = v_studio_id;
    RETURN v_current < v_max;
  ELSIF p_entity = 'users' THEN
    SELECT COUNT(*) INTO v_current FROM profili WHERE studio_id = v_studio_id AND is_active;
    SELECT max_users INTO v_max FROM studi_legali WHERE id = v_studio_id;
    RETURN v_current < v_max;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DROP existing basic policies and replace with granular ones
-- ============================================================================

-- PROFILI: Granular RBAC
DROP POLICY IF EXISTS "Studio isolation" ON profili;

CREATE POLICY "profili_select" ON profili FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "profili_insert" ON profili FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id() AND is_studio_admin());

CREATE POLICY "profili_update_self" ON profili FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profili_update_admin" ON profili FOR UPDATE
  USING (studio_id = get_user_studio_id() AND is_studio_admin())
  WITH CHECK (studio_id = get_user_studio_id() AND is_studio_admin());

CREATE POLICY "profili_delete" ON profili FOR DELETE
  USING (studio_id = get_user_studio_id() AND is_studio_admin() AND id != auth.uid());

-- FASCICOLI: Role-based access
DROP POLICY IF EXISTS "Studio isolation" ON fascicoli;

CREATE POLICY "fascicoli_select" ON fascicoli FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "fascicoli_insert" ON fascicoli FOR INSERT
  WITH CHECK (
    studio_id = get_user_studio_id()
    AND get_user_role() NOT IN ('segretaria', 'amministrativo')
    AND check_subscription_limit('fascicoli')
  );

CREATE POLICY "fascicoli_update" ON fascicoli FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND (
      is_studio_admin()
      OR avvocato_responsabile = auth.uid()
      OR dominus = auth.uid()
    )
  );

CREATE POLICY "fascicoli_delete" ON fascicoli FOR DELETE
  USING (studio_id = get_user_studio_id() AND is_studio_admin());

-- ATTI: Only assigned lawyers can modify
DROP POLICY IF EXISTS "Studio isolation" ON atti;

CREATE POLICY "atti_select" ON atti FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "atti_insert" ON atti FOR INSERT
  WITH CHECK (
    studio_id = get_user_studio_id()
    AND get_user_role() NOT IN ('amministrativo')
  );

CREATE POLICY "atti_update" ON atti FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND (
      is_studio_admin()
      OR redattore_id = auth.uid()
      OR is_assigned_to_fascicolo(fascicolo_id)
    )
  );

CREATE POLICY "atti_delete" ON atti FOR DELETE
  USING (studio_id = get_user_studio_id() AND is_studio_admin());

-- FATTURE: Only admin + amministrativo can manage
DROP POLICY IF EXISTS "Studio isolation" ON fatture;

CREATE POLICY "fatture_select" ON fatture FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "fatture_insert" ON fatture FOR INSERT
  WITH CHECK (
    studio_id = get_user_studio_id()
    AND get_user_role() IN ('titolare', 'socio', 'amministrativo')
  );

CREATE POLICY "fatture_update" ON fatture FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND get_user_role() IN ('titolare', 'socio', 'amministrativo')
  );

CREATE POLICY "fatture_delete" ON fatture FOR DELETE
  USING (studio_id = get_user_studio_id() AND is_studio_admin());

-- SCADENZE: Everyone reads, lawyers + admin modify
DROP POLICY IF EXISTS "Studio isolation" ON scadenze;

CREATE POLICY "scadenze_select" ON scadenze FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "scadenze_insert" ON scadenze FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id());

CREATE POLICY "scadenze_update" ON scadenze FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND (
      is_studio_admin()
      OR assegnato_a = auth.uid()
      OR creato_da = auth.uid()
    )
  );

-- UDIENZE: Same pattern
DROP POLICY IF EXISTS "Studio isolation" ON udienze;

CREATE POLICY "udienze_select" ON udienze FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "udienze_insert" ON udienze FOR INSERT
  WITH CHECK (
    studio_id = get_user_studio_id()
    AND get_user_role() NOT IN ('amministrativo')
  );

CREATE POLICY "udienze_update" ON udienze FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND (is_studio_admin() OR avvocato_presente = auth.uid())
  );

-- SOGGETTI: Read all, create/edit restricted
DROP POLICY IF EXISTS "Studio isolation" ON soggetti;

CREATE POLICY "soggetti_select" ON soggetti FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "soggetti_insert" ON soggetti FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id());

CREATE POLICY "soggetti_update" ON soggetti FOR UPDATE
  USING (studio_id = get_user_studio_id() AND get_user_role() NOT IN ('praticante'));

CREATE POLICY "soggetti_delete" ON soggetti FOR DELETE
  USING (studio_id = get_user_studio_id() AND is_studio_admin());

-- DOCUMENTI: file-level security
DROP POLICY IF EXISTS "Studio isolation" ON documenti;

CREATE POLICY "documenti_select" ON documenti FOR SELECT
  USING (
    studio_id = get_user_studio_id()
    AND (
      NOT riservato 
      OR caricato_da = auth.uid()
      OR is_studio_admin()
    )
  );

CREATE POLICY "documenti_insert" ON documenti FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id());

CREATE POLICY "documenti_update" ON documenti FOR UPDATE
  USING (
    studio_id = get_user_studio_id()
    AND (caricato_da = auth.uid() OR is_studio_admin())
  );

CREATE POLICY "documenti_delete" ON documenti FOR DELETE
  USING (
    studio_id = get_user_studio_id()
    AND (caricato_da = auth.uid() OR is_studio_admin())
  );

-- AUDIT LOG: Read-only for admins, no delete
DROP POLICY IF EXISTS "Studio isolation" ON audit_log;

CREATE POLICY "audit_select" ON audit_log FOR SELECT
  USING (studio_id = get_user_studio_id() AND is_studio_admin());

CREATE POLICY "audit_insert" ON audit_log FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id());

-- AI: Users see only their own conversations
DROP POLICY IF EXISTS "Studio isolation" ON ai_conversazioni;
DROP POLICY IF EXISTS "Studio isolation" ON ai_usage;

CREATE POLICY "ai_conv_select" ON ai_conversazioni FOR SELECT
  USING (studio_id = get_user_studio_id() AND profilo_id = auth.uid());

CREATE POLICY "ai_conv_insert" ON ai_conversazioni FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id() AND profilo_id = auth.uid());

CREATE POLICY "ai_usage_select" ON ai_usage FOR SELECT
  USING (
    studio_id = get_user_studio_id()
    AND (profilo_id = auth.uid() OR is_studio_admin())
  );

-- PAGAMENTI: Admin only
DROP POLICY IF EXISTS "Studio isolation" ON pagamenti;

CREATE POLICY "pagamenti_select" ON pagamenti FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE POLICY "pagamenti_insert" ON pagamenti FOR INSERT
  WITH CHECK (
    studio_id = get_user_studio_id()
    AND get_user_role() IN ('titolare', 'socio', 'amministrativo')
  );
