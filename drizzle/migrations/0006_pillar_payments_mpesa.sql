-- Per-pillar payments, manual M-Pesa (stage 1).
-- Foundation pillars (1-3) stay free. Specialisation pillars (4-7) have a price.
-- A learner pays to the Genlink Till/Paybill, submits the M-Pesa code, and an
-- admin checks it against the M-Pesa statement and approves it. Approval calls
-- grant_pillar_access, so lock state still comes only from get_pillar_access.
-- Stage 2 (STK push via Daraja) will write to the same pillar_payments table.

-- ---------------------------------------------------------------- prices
CREATE TABLE IF NOT EXISTS public.pillar_prices (
  pillar_id text PRIMARY KEY REFERENCES public.pillars(id) ON DELETE CASCADE,
  price_kes integer NOT NULL CHECK (price_kes > 0),
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pillar_prices TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pillar_prices TO authenticated;
GRANT ALL ON public.pillar_prices TO service_role;
ALTER TABLE public.pillar_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pillar prices are public" ON public.pillar_prices;
CREATE POLICY "Pillar prices are public" ON public.pillar_prices
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage pillar prices" ON public.pillar_prices;
CREATE POLICY "Admins manage pillar prices" ON public.pillar_prices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Starting prices = the existing catalogue prices for these four pillars.
-- Admins can change them on /admin/payments.
INSERT INTO public.pillar_prices (pillar_id, price_kes)
SELECT p.id, v.price
FROM (VALUES ('cybersecurity', 10999), ('programming-systems', 14999),
             ('creator-economy', 11999), ('civic-leadership', 7999)) AS v(id, price)
JOIN public.pillars p ON p.id = v.id
ON CONFLICT (pillar_id) DO NOTHING;

-- ---------------------------------------------------------------- settings
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  mpesa_method text NOT NULL DEFAULT 'till' CHECK (mpesa_method IN ('till', 'paybill')),
  mpesa_number text,
  account_reference text,
  business_name text,
  review_hours integer NOT NULL DEFAULT 24 CHECK (review_hours > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.payment_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT SELECT, UPDATE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Payment settings are public" ON public.payment_settings;
CREATE POLICY "Payment settings are public" ON public.payment_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins update payment settings" ON public.payment_settings;
CREATE POLICY "Admins update payment settings" ON public.payment_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------- payments
CREATE TABLE IF NOT EXISTS public.pillar_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id text NOT NULL REFERENCES public.pillars(id),
  amount_kes integer NOT NULL,
  mpesa_code text NOT NULL CHECK (mpesa_code ~ '^[A-Z0-9]{10}$'),
  phone text CHECK (phone IS NULL OR phone ~ '^\+?[0-9 ]{9,15}$'),
  payer_name text CHECK (payer_name IS NULL OR length(payer_name) <= 120),
  method text NOT NULL DEFAULT 'mpesa_manual',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pillar_payments TO authenticated;
GRANT ALL ON public.pillar_payments TO service_role;
-- One M-Pesa code can only pay once; one open request per learner per pillar.
CREATE UNIQUE INDEX IF NOT EXISTS pillar_payments_code_once
  ON public.pillar_payments (mpesa_code) WHERE status <> 'rejected';
CREATE UNIQUE INDEX IF NOT EXISTS pillar_payments_one_pending
  ON public.pillar_payments (user_id, pillar_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS pillar_payments_status_created
  ON public.pillar_payments (status, created_at DESC);

ALTER TABLE public.pillar_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners read own payments" ON public.pillar_payments;
CREATE POLICY "Learners read own payments" ON public.pillar_payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Learners submit own payments" ON public.pillar_payments;
CREATE POLICY "Learners submit own payments" ON public.pillar_payments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);
-- No UPDATE/DELETE policies: only review_pillar_payment() changes a payment.

-- The amount always comes from the price table, never from the browser.
CREATE OR REPLACE FUNCTION public.pillar_payments_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _price integer;
BEGIN
  NEW.mpesa_code := upper(btrim(NEW.mpesa_code));
  SELECT price_kes INTO _price FROM public.pillar_prices WHERE pillar_id = NEW.pillar_id AND active;
  IF _price IS NULL THEN
    RAISE EXCEPTION 'This pillar is free; no payment is needed.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.enrollments e WHERE e.user_id = NEW.user_id AND e.course_id = NEW.pillar_id) THEN
    RAISE EXCEPTION 'You already have access to this pillar.';
  END IF;
  -- Foundation first: a specialisation can be paid for only once it is open
  -- to this learner (get_pillar_access reads auth.uid(), the learner here).
  IF EXISTS (SELECT 1 FROM public.get_pillar_access() g WHERE g.pillar_id = NEW.pillar_id AND g.state = 'locked') THEN
    RAISE EXCEPTION 'This pillar opens once you have built the Foundation. You can pay for it then.';
  END IF;
  NEW.amount_kes := _price;
  NEW.status := 'pending';
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  NEW.review_note := NULL;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS pillar_payments_before_insert ON public.pillar_payments;
CREATE TRIGGER pillar_payments_before_insert
  BEFORE INSERT ON public.pillar_payments
  FOR EACH ROW EXECUTE FUNCTION public.pillar_payments_before_insert();

-- Admin review. Approving grants the pillar through the existing access path.
CREATE OR REPLACE FUNCTION public.review_pillar_payment(_payment_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p public.pillar_payments%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can review payments';
  END IF;
  SELECT * INTO _p FROM public.pillar_payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF _p.status <> 'pending' THEN RAISE EXCEPTION 'This payment has already been reviewed'; END IF;

  UPDATE public.pillar_payments
     SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
         review_note = NULLIF(btrim(coalesce(_note, '')), ''),
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE id = _payment_id;

  IF _approve AND NOT EXISTS (
    SELECT 1 FROM public.enrollments e WHERE e.user_id = _p.user_id AND e.course_id = _p.pillar_id
  ) THEN
    PERFORM public.grant_pillar_access(_p.pillar_id, _p.user_id);
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.review_pillar_payment(uuid, boolean, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_pillar_payment(uuid, boolean, text) TO authenticated;

-- Admin list with the learner's name and email (emails live in auth.users).
CREATE OR REPLACE FUNCTION public.admin_list_pillar_payments(_status text DEFAULT 'pending')
RETURNS TABLE (
  id uuid, user_id uuid, learner_name text, learner_email text, pillar_id text,
  amount_kes integer, mpesa_code text, phone text, payer_name text, status text,
  review_note text, reviewed_at timestamptz, created_at timestamptz
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can list payments';
  END IF;
  RETURN QUERY
  SELECT pp.id, pp.user_id, pr.full_name, u.email::text, pp.pillar_id, pp.amount_kes, pp.mpesa_code,
         pp.phone, pp.payer_name, pp.status, pp.review_note, pp.reviewed_at, pp.created_at
  FROM public.pillar_payments pp
  LEFT JOIN public.profiles pr ON pr.user_id = pp.user_id
  LEFT JOIN auth.users u ON u.id = pp.user_id
  WHERE _status IS NULL OR pp.status = _status
  ORDER BY pp.created_at DESC
  LIMIT 500;
END $$;

REVOKE ALL ON FUNCTION public.admin_list_pillar_payments(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_pillar_payments(text) TO authenticated;

-- ---------------------------------------------------------------- the gate
-- Restrictive: ANDed with the existing enrolment policies (can_access_pillar).
-- A priced pillar can be joined only by an admin or after an approved payment.
-- grant_pillar_access is SECURITY DEFINER, so approvals and admin grants pass.
-- Learners already enrolled keep their access.
DROP POLICY IF EXISTS "Paid pillars need an approved payment" ON public.enrollments;
CREATE POLICY "Paid pillars need an approved payment" ON public.enrollments
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR NOT EXISTS (
      SELECT 1 FROM public.pillar_prices pp WHERE pp.pillar_id = enrollments.course_id AND pp.active
    )
    OR EXISTS (
      SELECT 1 FROM public.pillar_payments x
      WHERE x.user_id = auth.uid() AND x.pillar_id = enrollments.course_id AND x.status = 'approved'
    )
  );