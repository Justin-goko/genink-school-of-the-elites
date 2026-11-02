import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// pillar_prices, payment_settings and pillar_payments are newer than the
// generated types, so they are queried untyped (as elsewhere in the app).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface PaymentSettings {
  mpesa_method: "till" | "paybill";
  mpesa_number: string | null;
  account_reference: string | null;
  business_name: string | null;
  review_hours: number;
}

export interface PillarPayment {
  id: string;
  pillar_id: string;
  amount_kes: number;
  mpesa_code: string;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
}

export const formatKes = (n: number) => `Ksh ${n.toLocaleString("en-KE")}`;

/** M-Pesa transaction codes are 10 letters and digits, e.g. SJK7H2LMN0. */
export const MPESA_CODE = /^[A-Z0-9]{10}$/;

/** Active prices keyed by pillar id. A pillar with no price is free. */
export function usePillarPrices() {
  return useQuery({
    queryKey: ["pillar_prices"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await db.from("pillar_prices").select("pillar_id,price_kes,active");
      if (error) return {}; // table not created yet: treat everything as free
      return Object.fromEntries(
        (data ?? []).filter((r: { active: boolean }) => r.active).map((r: { pillar_id: string; price_kes: number }) => [r.pillar_id, r.price_kes]),
      );
    },
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["payment_settings"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PaymentSettings | null> => {
      const { data, error } = await db.from("payment_settings").select("*").maybeSingle();
      if (error) return null;
      return data as PaymentSettings | null;
    },
  });
}

/** The signed-in learner's own payment submissions, newest first. */
export function useMyPillarPayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_pillar_payments", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<PillarPayment[]> => {
      const { data, error } = await db
        .from("pillar_payments")
        .select("id,pillar_id,amount_kes,mpesa_code,status,review_note,created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as PillarPayment[];
    },
  });
}

export function useSubmitPillarPayment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return async (input: { pillarId: string; code: string; phone?: string; payerName?: string }) => {
    if (!user) throw new Error("Please sign in first.");
    const code = input.code.replace(/\s+/g, "").toUpperCase();
    if (!MPESA_CODE.test(code)) throw new Error("An M-Pesa code is 10 letters and numbers, like SJK7H2LMN0.");
    // amount_kes is set by the database from the price table; 0 is a placeholder.
    const { error } = await db.from("pillar_payments").insert({
      user_id: user.id,
      pillar_id: input.pillarId,
      mpesa_code: code,
      amount_kes: 0,
      phone: input.phone?.trim() || null,
      payer_name: input.payerName?.trim() || null,
    });
    if (error) {
      const msg = String(error.message ?? "");
      if (msg.includes("pillar_payments_code_once")) throw new Error("That M-Pesa code has already been used.");
      if (msg.includes("pillar_payments_one_pending")) throw new Error("You already have a payment waiting for review for this pillar.");
      if (msg.includes("phone_check")) throw new Error("Please check the phone number.");
      throw new Error(msg || "Could not submit the payment.");
    }
    await qc.invalidateQueries({ queryKey: ["my_pillar_payments", user.id] });
  };
}

/**
 * Premium access for one pillar. A pillar's premium units are locked only when
 * the pillar has an active price and the learner has no approved payment
 * (admins always have access). The database enforces the same rule
 * (has_premium_access + the session_blocks policy); this only drives the UI.
 */
export function usePremiumAccess(pillarId: string | undefined, isAdmin = false) {
  const { data: prices = {}, isLoading: pricesLoading } = usePillarPrices();
  const { data: payments = [], isLoading: paymentsLoading } = useMyPillarPayments();
  const price = pillarId ? prices[pillarId] : undefined;
  const mine = payments.filter((p) => p.pillar_id === pillarId);
  const approved = mine.some((p) => p.status === "approved");
  const pending = mine.some((p) => p.status === "pending");
  return {
    price,
    unlocked: isAdmin || !price || approved,
    pending,
    loading: pricesLoading || paymentsLoading,
  };
}
