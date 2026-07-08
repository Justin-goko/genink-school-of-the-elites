import { useState } from "react";
import { DEPARTMENTS, type DepartmentRole } from "@/lib/ops/departments";
import { useDepartmentHistory, useWeeklyReports } from "@/hooks/useOpsReports";
import { currentWeekISO, pastWeeksISO } from "@/lib/ops/week";
import { WeekSelector, OrgHealthDots } from "../shared";
import WeeklyReportForm from "../WeeklyReportForm";
import Sparkline from "../Sparkline";

export default function DepartmentMemberView({ role }: { role: Exclude<DepartmentRole, "ceo" | "ops_manager"> }) {
  const [week, setWeek] = useState(currentWeekISO());
  const meta = DEPARTMENTS[role];
  const { data: allReports } = useWeeklyReports(week);
  const historyWeeks = pastWeeksISO(4).reverse();
  const { data: history } = useDepartmentHistory(role, historyWeeks);

  const orgStatuses = Object.fromEntries(
    (Object.keys(DEPARTMENTS) as (keyof typeof DEPARTMENTS)[])
      .map((d) => [d, allReports?.[d]?.status ?? null] as const),
  ) as Partial<Record<DepartmentRole, "green"|"amber"|"red"|null>>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</p>
          <h1 className="text-3xl font-serif text-[#0D2B55]">Your weekly submission</h1>
        </div>
        <WeekSelector value={week} onChange={setWeek} />
      </div>

      <div className="rounded-xl bg-white p-5 border" style={{ borderTop: `4px solid ${meta.color}` }}>
        <WeeklyReportForm meta={meta} weekStarting={week} />
      </div>

      {/* Own 4-week trend */}
      <section className="rounded-xl bg-white p-5 border">
        <h2 className="font-semibold text-[#0D2B55] mb-3">Your last 4 weeks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meta.fields.filter((f) => f.kind !== "status").slice(0, 6).map((f) => {
            const series = historyWeeks.map((w) => {
              const r = history?.find((h) => h.week_starting === w);
              const v = (r?.kpi_data as Record<string, unknown> | undefined)?.[f.key];
              const n = typeof v === "number" ? v : Number(v);
              return Number.isFinite(n) ? n : 0;
            });
            return (
              <div key={f.key} className="rounded-md border p-3">
                <div className="text-[11px] uppercase text-[#0D2B55]/60">{f.label}</div>
                <div className="mt-1"><Sparkline values={series} color={meta.color} /></div>
                <div className="text-xs text-[#0D2B55]/60 mt-1">
                  latest {series[series.length - 1]}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Org health */}
      <section className="rounded-xl bg-white p-5 border">
        <h2 className="font-semibold text-[#0D2B55] mb-3">Org health this week</h2>
        <OrgHealthDots statuses={orgStatuses} />
      </section>
    </div>
  );
}