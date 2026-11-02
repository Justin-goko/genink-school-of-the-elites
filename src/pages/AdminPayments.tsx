import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import StickyNav from "@/components/StickyNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck, XCircle, Wallet, Settings2, Tag, RefreshCw } from "lucide-react";
import { pillars } from "@/data/courses";
import { formatKes, usePaymentSettings, type PaymentSettings } from "@/hooks/usePillarPayments";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Status = "pending" | "approved" | "rejected";

interface AdminPaymentRow {
  id: string;
  user_id: string;
  learner_name: string | null;
  learner_email: string | null;
  pillar_id: string;
  amount_kes: number;
  mpesa_code: string;
  phone: string | null;
  payer_name: string | null;
  status: Status;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const pillarName = (id: string) => pillars.find((p) => p.id === id)?.name ?? id;
const when = (iso: string) => new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

export default function AdminPayments() {
  const { isAdmin, loading } = useUserRole();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const list = useQuery({
    queryKey: ["admin_pillar_payments", tab],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminPaymentRow[]> => {
      const { data, error } = await db.rpc("admin_list_pillar_payments", { _status: tab });
      if (error) throw error;
      return (data ?? []) as AdminPaymentRow[];
    },
  });

  const review = async (row: AdminPaymentRow, approve: boolean) => {
    const note = notes[row.id]?.trim();
    if (!approve && !note) return toast.error("Add a short reason so the learner knows what to fix.");
    if (approve && !window.confirm(`Approve ${row.mpesa_code} for ${formatKes(row.amount_kes)}?\n\nOnly approve once you have found this code and amount on the M-Pesa statement.`)) return;
    setBusyId(row.id);
    const { error } = await db.rpc("review_pillar_payment", { _payment_id: row.id, _approve: approve, _note: note || null });
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(approve ? `${pillarName(row.pillar_id)} unlocked for ${row.learner_name || row.learner_email || "the learner"}` : "Payment rejected");
    qc.invalidateQueries({ queryKey: ["admin_pillar_payments"] });
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Checking access…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tableMissing = list.error && String((list.error as Error).message).includes("admin_list_pillar_payments");

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />
      <div className="container mx-auto max-w-6xl px-4 pt-24 pb-16 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-accent mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-widest font-semibold">Admin · Payments</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Pillar payments</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Learners pay by M-Pesa and submit the code. Find the code and amount on the M-Pesa statement (M-Pesa app or the
            business portal), then approve. Approving unlocks the pillar straight away. Foundation pillars stay free.
          </p>
        </div>

        {tableMissing && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            The payment tables are not in the database yet. In Lovable, ask: “Run the migration
            supabase/migrations/20261102100000_pillar_payments_mpesa.sql”, then reload this page.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <SettingsCard />
          <PricesCard />
        </div>

        {/* queue */}
        <div className="rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Wallet className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-lg">Submissions</h2>
            <Tabs value={tab} onValueChange={(v) => setTab(v as Status)} className="ml-auto">
              <TabsList>
                <TabsTrigger value="pending">Waiting</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={() => list.refetch()} disabled={list.isFetching}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${list.isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {list.isLoading ? (
            <div className="p-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading…</div>
          ) : !list.data?.length ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {tab === "pending" ? "No payments waiting. New submissions appear here." : `No ${tab} payments yet.`}
            </div>
          ) : (
            <div className="divide-y">
              {list.data.map((row) => (
                <div key={row.id} className="p-4 grid md:grid-cols-[1.2fr_1fr_1fr_auto] gap-4 items-start">
                  <div>
                    <div className="font-semibold">{row.learner_name || "No name"}</div>
                    <div className="text-xs text-muted-foreground">{row.learner_email}</div>
                    <div className="text-xs text-muted-foreground mt-1">Submitted {when(row.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-sm">{pillarName(row.pillar_id)}</div>
                    <div className="text-lg font-bold">{formatKes(row.amount_kes)}</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-mono text-base tracking-widest">{row.mpesa_code}</div>
                    {row.phone && <div className="text-xs text-muted-foreground">Phone: {row.phone}</div>}
                    {row.payer_name && <div className="text-xs text-muted-foreground">M-Pesa name: {row.payer_name}</div>}
                    {row.review_note && <div className="text-xs mt-1">Note: {row.review_note}</div>}
                  </div>
                  {row.status === "pending" ? (
                    <div className="flex flex-col gap-2 md:w-56">
                      <Input
                        placeholder="Reason (needed to reject)"
                        value={notes[row.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [row.id]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-700 hover:bg-green-800 text-white" disabled={busyId === row.id} onClick={() => review(row, true)}>
                          {busyId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />} Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" disabled={busyId === row.id} onClick={() => review(row, false)}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Badge variant={row.status === "approved" ? "default" : "destructive"} className="capitalize">
                      {row.status}{row.reviewed_at ? ` · ${when(row.reviewed_at)}` : ""}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsCard() {
  const qc = useQueryClient();
  const { data } = usePaymentSettings();
  const [form, setForm] = useState<PaymentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    if (!form) return;
    if (form.mpesa_number && !/^\d{5,8}$/.test(form.mpesa_number.trim())) return toast.error("Till and Paybill numbers are 5 to 8 digits.");
    setSaving(true);
    const { error } = await db.from("payment_settings").update({
      mpesa_method: form.mpesa_method,
      mpesa_number: form.mpesa_number?.trim() || null,
      account_reference: form.account_reference?.trim() || null,
      business_name: form.business_name?.trim() || null,
      review_hours: form.review_hours,
      updated_at: new Date().toISOString(),
    }).eq("id", true);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Payment details saved");
    qc.invalidateQueries({ queryKey: ["payment_settings"] });
  };

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 font-semibold"><Settings2 className="w-4 h-4 text-accent" /> Where learners pay</div>
      {!form ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {!form.mpesa_number && <p className="text-xs rounded-md bg-accent/10 p-2">Until a number is saved, learners see “Payment details are being set up”.</p>}
          <div className="flex gap-2">
            {(["till", "paybill"] as const).map((m) => (
              <Button key={m} type="button" size="sm" variant={form.mpesa_method === m ? "default" : "outline"} onClick={() => setForm({ ...form, mpesa_method: m })}>
                {m === "till" ? "Till (Buy Goods)" : "Paybill"}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{form.mpesa_method === "till" ? "Till number" : "Business number"}</Label>
              <Input value={form.mpesa_number ?? ""} onChange={(e) => setForm({ ...form, mpesa_number: e.target.value })} inputMode="numeric" placeholder="e.g. 5123456" />
            </div>
            <div className="space-y-1.5">
              <Label>Name shown on M-Pesa</Label>
              <Input value={form.business_name ?? ""} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. GENLINK" />
            </div>
            {form.mpesa_method === "paybill" && (
              <div className="space-y-1.5">
                <Label>Account number</Label>
                <Input value={form.account_reference ?? ""} onChange={(e) => setForm({ ...form, account_reference: e.target.value })} placeholder="Blank = learner's email" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Promise to confirm within (hours)</Label>
              <Input type="number" min={1} value={form.review_hours} onChange={(e) => setForm({ ...form, review_hours: Math.max(1, Number(e.target.value) || 24) })} />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
          </Button>
        </>
      )}
    </div>
  );
}

function PricesCard() {
  const qc = useQueryClient();
  const prices = useQuery({
    queryKey: ["admin_pillar_prices"],
    queryFn: async (): Promise<{ pillar_id: string; price_kes: number; active: boolean }[]> => {
      const { data, error } = await db.from("pillar_prices").select("pillar_id,price_kes,active");
      if (error) return [];
      return data ?? [];
    },
  });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (pillarId: string, active: boolean) => {
    const value = Number(draft[pillarId] ?? prices.data?.find((p) => p.pillar_id === pillarId)?.price_kes);
    if (!Number.isInteger(value) || value <= 0) return toast.error("Enter a whole number of shillings.");
    setSaving(pillarId);
    const { error } = await db.from("pillar_prices").upsert({ pillar_id: pillarId, price_kes: value, active, updated_at: new Date().toISOString() });
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${pillarName(pillarId)}: ${active ? formatKes(value) : "now free"}`);
    qc.invalidateQueries({ queryKey: ["admin_pillar_prices"] });
    qc.invalidateQueries({ queryKey: ["pillar_prices"] });
  };

  const rows = prices.data ?? [];
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 font-semibold"><Tag className="w-4 h-4 text-accent" /> Prices (one-time, per pillar)</div>
      <p className="text-xs text-muted-foreground">Foundation pillars (1–3) are free. A new price applies to new submissions only.</p>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No prices yet. The migration seeds the four specialisations.</p>}
      {rows
        .slice()
        .sort((a, b) => pillars.findIndex((p) => p.id === a.pillar_id) - pillars.findIndex((p) => p.id === b.pillar_id))
        .map((r) => (
          <div key={r.pillar_id} className="flex items-center gap-2">
            <div className="flex-1 text-sm">
              {pillarName(r.pillar_id)}
              {!r.active && <span className="ml-2 text-xs text-muted-foreground">(free right now)</span>}
            </div>
            <span className="text-sm text-muted-foreground">Ksh</span>
            <Input
              className="w-28 h-8"
              inputMode="numeric"
              value={draft[r.pillar_id] ?? String(r.price_kes)}
              onChange={(e) => setDraft((d) => ({ ...d, [r.pillar_id]: e.target.value.replace(/[^\d]/g, "") }))}
            />
            <Button size="sm" variant="outline" disabled={saving === r.pillar_id} onClick={() => save(r.pillar_id, true)}>Save</Button>
            <Button size="sm" variant="ghost" disabled={saving === r.pillar_id} onClick={() => save(r.pillar_id, !r.active)}>
              {r.active ? "Make free" : "Charge"}
            </Button>
          </div>
        ))}
    </div>
  );
}
