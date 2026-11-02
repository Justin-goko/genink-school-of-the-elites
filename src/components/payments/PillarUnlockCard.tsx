import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Clock, Crown, Loader2, Smartphone, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatKes, MPESA_CODE, useMyPillarPayments, usePaymentSettings, useSubmitPillarPayment,
} from "@/hooks/usePillarPayments";

interface Props {
  pillarId: string;
  pillarName: string;
  price: number;
  color: string;
  icon?: ReactNode;
  /** Titles of the premium units this payment unlocks. */
  premiumUnits?: string[];
}

/**
 * Unlocks a pillar's premium units (manual M-Pesa): pay to the Till/Paybill,
 * submit the code, an admin approves it and the premium sessions open.
 */
export default function PillarUnlockCard({ pillarId, pillarName, price, color, icon, premiumUnits = [] }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: settings } = usePaymentSettings();
  const { data: payments = [], refetch } = useMyPillarPayments();
  const submit = useSubmitPillarPayment();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const latest = payments.find((p) => p.pillar_id === pillarId);
  const ready = !!settings?.mpesa_number;
  const cleanCode = code.replace(/\s+/g, "").toUpperCase();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ pillarId, code: cleanCode, phone, payerName: name });
      toast.success("Payment submitted. We'll unlock the premium units once it's confirmed.");
      setCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit the payment.");
    } finally {
      setBusy(false);
    }
  };

  // Approved: reload the premium content and enrolment so it opens here.
  const openPremium = async () => {
    if (!user) return;
    await qc.invalidateQueries({ queryKey: ["session_blocks"] });
    await qc.invalidateQueries({ queryKey: ["pillar_enrollment", user.id, pillarId] });
  };

  return (
    <div
      className="rounded-2xl p-6 md:p-10 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}18, hsl(var(--accent) / 0.08))`, border: `1px solid ${color}40` }}
    >
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          {icon && (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4" style={{ backgroundColor: color }}>
              {icon}
            </div>
          )}
          <p className="text-xs uppercase tracking-widest text-amber-700 mb-1 inline-flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> Premium · one-time fee</p>
          <h3 className="text-2xl md:text-3xl font-bold mb-1">Unlock {pillarName} Premium</h3>
          <div className="text-3xl font-bold text-amber-700 mb-3">{formatKes(price)}</div>
          <p className="text-sm text-muted-foreground mb-3">
            The other units in this pillar are free. One payment unlocks every premium unit below, and you keep access for good.
            You can read the first session of each premium unit before paying.
          </p>
          {premiumUnits.length > 0 && (
            <ul className="mb-5 space-y-1.5">
              {premiumUnits.map((t) => (
                <li key={t} className="flex gap-2 text-sm font-medium"><Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          )}
          {ready ? (
            <ol className="space-y-3 text-sm">
              <Step n={1}>
                Open M-Pesa and choose <b>Lipa na M-Pesa</b>, then{" "}
                <b>{settings!.mpesa_method === "paybill" ? "Pay Bill" : "Buy Goods and Services"}</b>.
              </Step>
              <Step n={2}>
                {settings!.mpesa_method === "paybill" ? "Business number" : "Till number"}:{" "}
                <b className="font-mono text-base">{settings!.mpesa_number}</b>
                {settings!.business_name && <span className="text-muted-foreground"> ({settings!.business_name})</span>}
              </Step>
              {settings!.mpesa_method === "paybill" && (
                <Step n={3}>
                  Account number: <b className="font-mono">{settings!.account_reference || user?.email || "your email"}</b>
                </Step>
              )}
              <Step n={settings!.mpesa_method === "paybill" ? 4 : 3}>
                Amount: <b>{formatKes(price)}</b>. Then enter the code from the M-Pesa SMS here.
              </Step>
            </ol>
          ) : (
            <p className="text-sm rounded-lg border p-3 bg-background/60">
              Payment details are being set up. Please check back soon, or ask at the Mwiki Ward ICT Hub.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-background/80 p-5">
          {latest?.status === "pending" ? (
            <Status icon={<Clock className="w-5 h-5 text-accent" />} title="Payment received, being checked">
              <p>
                Code <b className="font-mono">{latest.mpesa_code}</b> for {formatKes(latest.amount_kes)}. We usually confirm within{" "}
                {settings?.review_hours ?? 24} hours, and the premium units open automatically.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Check again</Button>
            </Status>
          ) : latest?.status === "approved" ? (
            <Status icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} title="Payment confirmed">
              <p>Your payment was confirmed. The premium units are open.</p>
              <Button className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={openPremium}>
                Start reading <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Status>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {latest?.status === "rejected" && (
                <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    We couldn't confirm code <b className="font-mono">{latest.mpesa_code}</b>.
                    {latest.review_note && <> Reason: {latest.review_note}.</>} Please check the code and try again.
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 font-semibold"><Smartphone className="w-4 h-4 text-accent" /> I've paid, here is my code</div>
              <div className="space-y-1.5">
                <Label htmlFor="mpesa-code">M-Pesa code</Label>
                <Input
                  id="mpesa-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SJK7H2LMN0"
                  maxLength={12}
                  className="font-mono tracking-widest uppercase"
                  autoComplete="off"
                  disabled={!ready}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mpesa-phone">Phone used</Label>
                  <Input id="mpesa-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" disabled={!ready} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mpesa-name">Name on M-Pesa</Label>
                  <Input id="mpesa-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" disabled={!ready} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-premium hover:bg-premium/90 text-premium-foreground font-semibold" disabled={!ready || busy || !MPESA_CODE.test(cleanCode)}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit payment
              </Button>
              <p className="text-xs text-muted-foreground">An admin matches the code with the M-Pesa statement before unlocking. Each code works once.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function Status({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold">{icon} {title}</div>
      <div className="text-sm text-muted-foreground flex flex-col items-start">{children}</div>
    </div>
  );
}
