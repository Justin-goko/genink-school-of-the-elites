import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StickyNav from "@/components/StickyNav";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Smartphone, ShieldCheck, ArrowRight, Crown, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pillars } from "@/data/courses";
import { formatKes, usePillarPrices } from "@/hooks/usePillarPayments";
import { usePillarAccess } from "@/hooks/usePillarAccess";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface PremiumUnit { id: string; title: string; pillar_id: string; order_index: number }

/** Public pricing: every pillar free to join; premium units unlock per pillar. */
export default function Pricing() {
  const { data: prices = {} } = usePillarPrices();
  const { data: access } = usePillarAccess();
  const { data: premiumUnits = [] } = useQuery({
    queryKey: ["public_premium_units"],
    queryFn: async (): Promise<PremiumUnit[]> => {
      const { data, error } = await db
        .from("units")
        .select("id,title,pillar_id,order_index")
        .eq("is_premium", true)
        .eq("track_type", "learning_path")
        .order("order_index");
      if (error) return [];
      return data ?? [];
    },
  });

  const order = (id: string) => access?.find((a) => a.pillar_id === id)?.order_index ?? pillars.findIndex((p) => p.id === id) + 1;
  const isFoundation = (id: string) => (access?.find((a) => a.pillar_id === id)?.track ?? (order(id) <= 3 ? "foundation" : "specialisation")) === "foundation";
  const sorted = pillars.slice().sort((a, b) => order(a.id) - order(b.id));

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />
      <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Pricing</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Learn the fundamentals free. Pay only for Premium.</h1>
          <p className="text-muted-foreground">
            Every pillar is free to join, and its fundamental units are free to finish. The advanced units, marked{" "}
            <span className="inline-flex items-center gap-1 rounded-full bg-premium px-2 py-0.5 text-xs font-bold text-premium-foreground"><Crown className="w-3 h-3" />Premium</span>,
            unlock with one M-Pesa payment per pillar. The first session of every premium unit is free to read.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((p) => {
            const units = premiumUnits.filter((u) => u.pillar_id === p.id);
            const price = prices[p.id];
            const charged = !!price && units.length > 0;
            return (
              <div key={p.id} className="rounded-2xl border bg-card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Pillar {order(p.id)} · {isFoundation(p.id) ? "Foundation" : "Specialisation"}
                    </div>
                    <Link to={`/pillar/${p.id}`} className="font-semibold text-lg hover:text-accent transition-colors">{p.name}</Link>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-accent">Free to join</div>
                    {charged && <div className="text-xl font-bold text-amber-700">+ {formatKes(price)}</div>}
                    {charged && <div className="text-[11px] text-muted-foreground">Premium, one-time</div>}
                  </div>
                </div>
                {units.length > 0 ? (
                  <div className="mt-auto">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{charged ? "Premium units" : "Premium units (free for now)"}</p>
                    <ul className="space-y-1">
                      {units.map((u) => (
                        <li key={u.id} className="flex gap-2 text-sm"><Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />Unit {u.order_index}: {u.title}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-auto text-sm text-muted-foreground">All units free.</p>
                )}
              </div>
            );
          })}
        </div>

        <section className="grid md:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle2, t: "1. Join free", d: "Enrol in any pillar that's open to you and work through its fundamental units." },
            { icon: Eye, t: "2. Try Premium", d: "Read the first session of any premium unit free, so you know what you're paying for." },
            { icon: Smartphone, t: "3. Pay by M-Pesa", d: "Pay the Till or Paybill shown in the app, then enter the code from the M-Pesa SMS." },
            { icon: ShieldCheck, t: "4. We confirm", d: "We match your code with our M-Pesa statement, usually within a day, and Premium opens." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border bg-card p-5">
              <Icon className="w-6 h-6 text-accent mb-2" />
              <div className="font-semibold mb-1">{t}</div>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        <div className="text-center">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
            <Link to="/pathway-intelligence">Take the free assessment <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
