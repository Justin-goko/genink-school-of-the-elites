import { Link } from "react-router-dom";
import StickyNav from "@/components/StickyNav";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Smartphone, ShieldCheck, ArrowRight } from "lucide-react";
import { pillars } from "@/data/courses";
import { formatKes, usePillarPrices } from "@/hooks/usePillarPayments";
import { usePillarAccess } from "@/hooks/usePillarAccess";

/** Public pricing: Foundation free, each specialisation a one-time M-Pesa fee. */
export default function Pricing() {
  const { data: prices = {} } = usePillarPrices();
  const { data: access } = usePillarAccess();
  const track = (id: string) => access?.find((a) => a.pillar_id === id)?.track;
  const order = (id: string) => access?.find((a) => a.pillar_id === id)?.order_index ?? pillars.findIndex((p) => p.id === id) + 1;

  const sorted = pillars.slice().sort((a, b) => order(a.id) - order(b.id));
  const foundation = sorted.filter((p) => (track(p.id) ?? (order(p.id) <= 3 ? "foundation" : "specialisation")) === "foundation");
  const specialisations = sorted.filter((p) => !foundation.includes(p));

  return (
    <div className="min-h-screen bg-background">
      <StickyNav />
      <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Pricing</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Start free. Pay only for the path you choose.</h1>
          <p className="text-muted-foreground">
            The three Foundation pillars are free for every learner. Once your Foundation is built, unlock any specialisation
            with a one-time M-Pesa payment. No subscriptions.
          </p>
        </div>

        <section className="rounded-2xl border bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold">Foundation</h2>
            <span className="text-2xl font-bold text-accent">Free</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {foundation.map((p) => (
              <Link key={p.id} to={`/pillar/${p.id}`} className="rounded-xl border p-4 hover:border-accent transition-colors">
                <div className="text-xs text-muted-foreground mb-1">Pillar {order(p.id)}</div>
                <div className="font-semibold">{p.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-1">Specialisations</h2>
          <p className="text-sm text-muted-foreground mb-4">Open once the Foundation is built. Pay once, keep access.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {specialisations.map((p) => (
              <Link key={p.id} to={`/pillar/${p.id}`} className="rounded-2xl border bg-card p-5 hover:border-premium transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Pillar {order(p.id)}</div>
                    <div className="font-semibold text-lg group-hover:text-premium transition-colors">{p.name}</div>
                    <div className="text-sm text-muted-foreground italic">{p.tagline}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-premium">{prices[p.id] ? formatKes(prices[p.id]) : "Free"}</div>
                    <div className="text-xs text-muted-foreground">{prices[p.id] ? "one-time" : "for now"}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, t: "1. Build your Foundation", d: "Work through the three free pillars. Your progress opens the specialisations." },
            { icon: Smartphone, t: "2. Pay by M-Pesa", d: "On the pillar's page you'll see the Till or Paybill number. Pay, then enter the code from the M-Pesa SMS." },
            { icon: ShieldCheck, t: "3. We confirm, it opens", d: "We match your code with our M-Pesa statement, usually within a day, and the pillar unlocks." },
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
