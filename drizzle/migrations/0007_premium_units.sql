-- Premium units: pay for the advanced units, not for entry to a pillar.
-- * Joining any pillar is free again (progress rules still decide when it opens).
-- * units.is_premium marks the advanced units. One payment per pillar unlocks
--   all of that pillar's premium units. A pillar with no active price has no
--   paywall, so marking a unit premium does nothing until a price is set.
-- * The first session of every premium unit stays open as a free taste.
-- * session_blocks of other premium sessions are readable only after an
--   approved payment (or by admins). Premium units don't count toward pillar
--   completion, so free learners can still finish a pillar and unlock the next.

-- ---------------------------------------------------------------- units
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------- free entry again
DROP POLICY IF EXISTS "Paid pillars need an approved payment" ON public.enrollments;

-- ---------------------------------------------------------------- access check
CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid, _pillar_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
      OR NOT EXISTS (SELECT 1 FROM public.pillar_prices pp WHERE pp.pillar_id = _pillar_id AND pp.active)
      OR EXISTS (
        SELECT 1 FROM public.pillar_payments x
        WHERE x.user_id = _user_id AND x.pillar_id = _pillar_id AND x.status = 'approved'
      );
$$;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid, text) TO anon, authenticated;

-- Restrictive: ANDed with "Session blocks readable by admin or enrolled".
DROP POLICY IF EXISTS "Premium sessions need premium access" ON public.session_blocks;
CREATE POLICY "Premium sessions need premium access" ON public.session_blocks
  AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.unit_sessions us
      JOIN public.units u ON u.id = us.unit_id
      WHERE us.id = session_blocks.session_id
        AND u.is_premium
        -- the first session of a premium unit is a free taste
        AND us.order_index > (SELECT min(s2.order_index) FROM public.unit_sessions s2 WHERE s2.unit_id = u.id)
        AND NOT public.has_premium_access(auth.uid(), u.pillar_id)
    )
  );

-- ---------------------------------------------------------------- payments
-- A payment now buys the pillar's premium units. Learners are usually already
-- enrolled, so the old "already enrolled" check becomes "already paid".
CREATE OR REPLACE FUNCTION public.pillar_payments_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _price integer;
BEGIN
  NEW.mpesa_code := upper(btrim(NEW.mpesa_code));
  SELECT price_kes INTO _price FROM public.pillar_prices WHERE pillar_id = NEW.pillar_id AND active;
  IF _price IS NULL THEN
    RAISE EXCEPTION 'Everything in this pillar is free; no payment is needed.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.units u WHERE u.pillar_id = NEW.pillar_id AND u.is_premium) THEN
    RAISE EXCEPTION 'This pillar has no premium units yet.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.pillar_payments x
    WHERE x.user_id = NEW.user_id AND x.pillar_id = NEW.pillar_id AND x.status = 'approved'
  ) THEN
    RAISE EXCEPTION 'You have already unlocked the premium units in this pillar.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.get_pillar_access() g WHERE g.pillar_id = NEW.pillar_id AND g.state = 'locked') THEN
    RAISE EXCEPTION 'This pillar is not open to you yet. You can unlock its premium units once it opens.';
  END IF;
  NEW.amount_kes := _price;
  NEW.status := 'pending';
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  NEW.review_note := NULL;
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------- admin toggle
-- Premium units stop counting toward pillar completion (and count again when
-- switched off), so pillar progress and unlock rules stay reachable for free.
CREATE OR REPLACE FUNCTION public.set_unit_premium(_unit_id uuid, _premium boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can change premium units';
  END IF;
  UPDATE public.units
     SET is_premium = _premium,
         counts_toward_completion = CASE WHEN track_type::text = 'learning_path' THEN NOT _premium ELSE counts_toward_completion END
   WHERE id = _unit_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unit not found'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.set_unit_premium(uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_unit_premium(uuid, boolean) TO authenticated;

-- ---------------------------------------------------------------- suggested premium units
-- Advanced, career and AI units, by position in each pillar's learning path.
-- Admins switch these on or off on /admin/payments.
WITH ranked AS (
  SELECT u.id, u.pillar_id,
         row_number() OVER (PARTITION BY u.pillar_id ORDER BY u.order_index) AS pos
  FROM public.units u
  WHERE u.track_type::text = 'learning_path'
), picks(pillar_id, pos) AS (
  VALUES
    ('personal-mastery', 4),                                              -- Digital Attention & Cognitive Sovereignty
    ('financial-intelligence', 6),                                        -- Financial Markets & Professional Competency
    ('digital-literacy', 7),                                              -- Digital Career Architecture
    ('cybersecurity', 4), ('cybersecurity', 6), ('cybersecurity', 7),     -- Ethical Hacking; AI in Cybersecurity; Legal & Career
    ('programming-systems', 3), ('programming-systems', 6), ('programming-systems', 7), -- AI-Assisted Dev; Intelligent Systems; Developer-Entrepreneur
    ('creator-economy', 5), ('creator-economy', 6), ('creator-economy', 7),             -- Digital Products; Monetisation; Creator-Entrepreneur
    ('civic-leadership', 6), ('civic-leadership', 7)                      -- Kenya & the World; Civic Entrepreneur
)
UPDATE public.units u
   SET is_premium = true,
       counts_toward_completion = false
  FROM ranked r JOIN picks p ON p.pillar_id = r.pillar_id AND p.pos = r.pos
 WHERE u.id = r.id AND NOT u.is_premium;

-- Foundation pillars get premium units but no price yet, so nothing is locked
-- there until an admin sets a price. Specialisation prices carry over.
