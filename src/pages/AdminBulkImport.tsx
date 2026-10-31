import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { parseTextToBlocks } from "@/lib/blocks/parser";
import type { SessionBlock } from "@/lib/blocks/types";
import BlockRenderer from "@/components/reader/BlockRenderer";
import { READER } from "@/components/reader/readerTheme";
import StickyNav from "@/components/StickyNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck, RefreshCw, ArrowLeft, Eye, AlertTriangle, Upload, FolderOpen } from "lucide-react";
import { EXPECTED_UNITS, NOT_YET_WRITTEN, PILLAR_FALLBACK } from "@/content/curriculum/manifest";

// The generated types lag behind the live schema (pillars, session_blocks),
// so this page talks to the tables untyped, like the single-session importer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Curriculum files are uploaded by the admin, never bundled with the app or
// committed to the (public) repo, so the paid curriculum stays private.
// Accepted names: P3U2S4.md, P3_U2_S4_IMPORT.md, P1U4_S6_IMPORT.md …
const NAME = /P(\d)_?U(\d)_?S(\d+)(?:_IMPORT)?\.md$/i;

interface FileEntry {
  key: string; // P3U2S4
  unitKey: string; // P3U2
  p: number;
  u: number;
  s: number;
  text: string;
}

interface UnitRow { id: string; title: string; pillar_id: string; order_index: number; session_count: number; status: string }
interface SessionRow { id: string; unit_id: string; order_index: number; title: string }

type Status = "no-unit" | "missing-session" | "empty" | "has-content";

interface Row {
  entry: FileEntry;
  blocks: SessionBlock[];
  fileTitle: string;
  unit?: UnitRow;
  session?: SessionRow;
  status: Status;
}

const STATUS_LABEL: Record<Status, string> = {
  "no-unit": "No matching unit",
  "missing-session": "Session row missing",
  empty: "Empty",
  "has-content": "Has content",
};

function firstH2(blocks: SessionBlock[]): string {
  const h = blocks.find((b) => b.block_type === "heading" && (b.content as { level?: number }).level === 2);
  return h ? String((h.content as { text: string }).text).trim() : "";
}

async function inChunks<T>(ids: string[], size: number, fn: (chunk: string[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += size) out.push(...(await fn(ids.slice(i, i + size))));
  return out;
}

export default function AdminBulkImport() {
  const { isAdmin, loading } = useUserRole();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<number | 0>(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Row | null>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  // 1. Read the uploaded files (a folder or many .md files at once).
  const onFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const byKey = new Map(entries.map((e) => [e.key, e]));
    const bad: string[] = [];
    for (const f of Array.from(list)) {
      const m = f.name.match(NAME);
      if (!m) {
        if (/\.md$/i.test(f.name)) bad.push(f.name);
        continue;
      }
      const [p, u, sn] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const key = `P${p}U${u}S${sn}`;
      byKey.set(key, { key, unitKey: `P${p}U${u}`, p, u, s: sn, text: await f.text() });
    }
    setSkipped(bad);
    setEntries(Array.from(byKey.values()).sort((a, b) => a.p - b.p || a.u - b.u || a.s - b.s));
  };

  const parsedFiles = useMemo(
    () => (entries.length ? Object.fromEntries(entries.map((e) => [e.key, parseTextToBlocks(e.text)])) : null),
    [entries],
  );

  // 2. Match files to the database.
  const scan = useCallback(async () => {
    if (!parsedFiles) return;
    setScanning(true);
    try {
      const pRes = await db.from("pillars").select("id,order_index").order("order_index");
      const pillarIds: string[] = !pRes.error && pRes.data?.length ? pRes.data.map((p: { id: string }) => p.id) : PILLAR_FALLBACK;

      const uRes = await db
        .from("units")
        .select("id,title,pillar_id,order_index,session_count,status")
        .eq("track_type", "learning_path")
        .order("order_index");
      if (uRes.error) throw uRes.error;
      const units = (uRes.data ?? []) as UnitRow[];
      const unitsByPillar: Record<string, UnitRow[]> = {};
      units.forEach((u) => (unitsByPillar[u.pillar_id] ??= []).push(u));

      const sessions = await inChunks<SessionRow>(units.map((u) => u.id), 60, async (chunk) => {
        const r = await db.from("unit_sessions").select("id,unit_id,order_index,title").in("unit_id", chunk);
        if (r.error) throw r.error;
        return r.data ?? [];
      });
      const sessionsByUnit: Record<string, SessionRow[]> = {};
      sessions.forEach((s) => (sessionsByUnit[s.unit_id] ??= []).push(s));
      Object.values(sessionsByUnit).forEach((l) => l.sort((a, b) => a.order_index - b.order_index));

      const filled = new Set(
        (
          await inChunks<{ session_id: string }>(sessions.map((s) => s.id), 80, async (chunk) => {
            const r = await db.from("session_blocks").select("session_id").eq("order_index", 0).in("session_id", chunk);
            if (r.error) throw r.error;
            return r.data ?? [];
          })
        ).map((r) => r.session_id),
      );

      const next: Row[] = entries.map((entry) => {
        const blocks = parsedFiles[entry.key] ?? [];
        const unit = unitsByPillar[pillarIds[entry.p - 1]]?.[entry.u - 1];
        const session = unit ? sessionsByUnit[unit.id]?.[entry.s - 1] : undefined;
        const status: Status = !unit ? "no-unit" : !session ? "missing-session" : filled.has(session.id) ? "has-content" : "empty";
        return { entry, blocks, fileTitle: firstH2(blocks), unit, session, status };
      });
      setRows(next);
      setSelected(new Set(next.filter((r) => r.status === "empty" || r.status === "missing-session").map((r) => r.entry.key)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read the curriculum tables");
    } finally {
      setScanning(false);
    }
  }, [parsedFiles, entries]);

  useEffect(() => { scan(); }, [scan]);

  const visible = useMemo(() => rows.filter((r) => !pillarFilter || r.entry.p === pillarFilter), [rows, pillarFilter]);
  const counts = useMemo(() => {
    const c: Record<Status, number> = { "no-unit": 0, "missing-session": 0, empty: 0, "has-content": 0 };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const selectWhere = (pred: (r: Row) => boolean) => setSelected(new Set(visible.filter(pred).map((r) => r.entry.key)));

  // 3. Publish the selected rows, one session at a time.
  const runImport = async () => {
    const todo = rows.filter((r) => selected.has(r.entry.key) && r.status !== "no-unit");
    if (!todo.length) return toast.error("Nothing selected that can be imported");
    const overwriting = todo.filter((r) => r.status === "has-content").length;
    if (overwriting && !window.confirm(`${overwriting} selected session(s) already have content and will be replaced. Continue?`)) return;

    setBusy(true);
    setErrors({});
    setProgress({ done: 0, total: todo.length });
    const errs: Record<string, string> = {};
    const touchedUnits = new Map<string, UnitRow>();

    for (let i = 0; i < todo.length; i++) {
      const r = todo[i];
      try {
        let sessionId = r.session?.id;
        if (!sessionId) {
          const ins = await db
            .from("unit_sessions")
            .insert({ unit_id: r.unit!.id, order_index: r.entry.s - 1, title: r.fileTitle || `Session ${r.entry.s}` })
            .select("id")
            .single();
          if (ins.error) throw new Error(`Could not create the session row: ${ins.error.message}`);
          sessionId = ins.data.id;
        }
        const del = await db.from("session_blocks").delete().eq("session_id", sessionId);
        if (del.error) throw del.error;
        const ins = await db.from("session_blocks").insert(
          r.blocks.map((b) => ({ session_id: sessionId, order_index: b.order_index, block_type: b.block_type, content: b.content })),
        );
        if (ins.error) throw ins.error;
        if (r.fileTitle) {
          const up = await db.from("unit_sessions").update({ title: r.fileTitle }).eq("id", sessionId);
          if (up.error) throw up.error;
        }
        touchedUnits.set(r.unit!.id, r.unit!);
      } catch (err) {
        errs[r.entry.key] = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Failed";
      }
      setProgress({ done: i + 1, total: todo.length });
    }

    // Keep units.session_count in step with the sessions that now exist, so
    // unit completion and XP (award-xp) count the extra sessions.
    for (const unit of touchedUnits.values()) {
      const c = await db.from("unit_sessions").select("id", { count: "exact", head: true }).eq("unit_id", unit.id);
      if (!c.error && typeof c.count === "number" && c.count > (unit.session_count ?? 0)) {
        const up = await db.from("units").update({ session_count: c.count }).eq("id", unit.id);
        if (up.error) errs[`${unit.title} (session count)`] = up.error.message;
      }
    }

    setErrors(errs);
    setBusy(false);
    const ok = todo.length - Object.keys(errs).filter((k) => /^P\dU\dS\d+$/.test(k)).length;
    if (Object.keys(errs).length) toast.warning(`Imported ${ok} of ${todo.length}. See the errors below.`);
    else toast.success(`Imported ${ok} sessions`);
    await scan();
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">Checking access…</div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const selectedCount = rows.filter((r) => selected.has(r.entry.key)).length;

  return (
    <div className="min-h-screen" style={{ background: READER.cream }}>
      <StickyNav />
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-16">
        <Link to="/admin/import" className="inline-flex items-center gap-1 text-xs mb-4 hover:underline" style={{ color: READER.inkSoft }}>
          <ArrowLeft className="w-3 h-3" /> Single-session importer
        </Link>
        <div className="flex items-center gap-2 mb-2" style={{ color: READER.gold }}>
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Admin · Bulk curriculum import</span>
        </div>
        <h1 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: READER.serif, color: READER.ink }}>
          Import the whole curriculum
        </h1>
        <p className="mb-6 text-sm max-w-3xl" style={{ color: READER.inkSoft }}>
          Upload the curriculum import files (a whole folder, or many .md files at once). Each file is matched to its pillar,
          unit and session from its name, e.g. <code>P3_U2_S4_IMPORT.md</code>. Empty sessions are selected for you; sessions that
          already have content are left alone unless you tick them. Check that the unit names line up before you publish.
        </p>

        <div className="rounded-xl border-2 border-dashed p-5 mb-6 bg-white flex flex-col md:flex-row md:items-center gap-3" style={{ borderColor: `${READER.ink}22` }}>
          <div className="flex-1 text-sm" style={{ color: READER.inkSoft }}>
            {entries.length ? (
              <span><b style={{ color: READER.ink }}>{entries.length}</b> session files loaded. Add more any time; a file with the same name replaces the earlier one.</span>
            ) : (
              <span>No files loaded yet. Unzip the import packs first, then pick the folder.</span>
            )}
            {skipped.length > 0 && <div className="mt-1 text-xs" style={{ color: "#8A2C1A" }}>Skipped (name not recognised): {skipped.slice(0, 6).join(", ")}{skipped.length > 6 ? ` +${skipped.length - 6} more` : ""}</div>}
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border hover:bg-black/5" style={{ borderColor: `${READER.ink}22`, color: READER.ink }}>
            <FolderOpen className="w-4 h-4" /> Choose folder
            {/* @ts-expect-error webkitdirectory is supported by every current browser but missing from React's types */}
            <input type="file" webkitdirectory="" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border hover:bg-black/5" style={{ borderColor: `${READER.ink}22`, color: READER.ink }}>
            <Upload className="w-4 h-4" /> Choose .md files
            <input type="file" accept=".md" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>

        {/* summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(["empty", "missing-session", "has-content", "no-unit"] as Status[]).map((s) => (
            <div key={s} className="rounded-xl border p-4 bg-white" style={{ borderColor: `${READER.ink}14` }}>
              <div className="text-2xl font-semibold" style={{ color: READER.ink }}>{rows.length ? counts[s] : "…"}</div>
              <div className="text-xs uppercase tracking-widest" style={{ color: READER.inkSoft }}>{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4 mb-6 text-sm bg-white" style={{ borderColor: `${READER.ink}14`, color: READER.inkSoft }}>
          <span className="font-semibold" style={{ color: READER.ink }}>Not written yet:</span> {NOT_YET_WRITTEN.join(" · ")}
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(Number(e.target.value))}
            className="rounded-md border px-2 py-2 text-sm bg-white"
            style={{ borderColor: `${READER.ink}22`, color: READER.ink }}
          >
            <option value={0}>All pillars</option>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => <option key={p} value={p}>Pillar {p}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => selectWhere((r) => r.status === "empty" || r.status === "missing-session")}>Select empty</Button>
          <Button variant="outline" size="sm" onClick={() => selectWhere((r) => r.status !== "no-unit")}>Select all (overwrite)</Button>
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button variant="outline" size="sm" onClick={scan} disabled={scanning || busy}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${scanning ? "animate-spin" : ""}`} /> Re-check
          </Button>
          <div className="flex-1" />
          <Button onClick={runImport} disabled={busy || !selectedCount} style={{ background: READER.navy, color: "white" }}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {busy && progress ? `Importing ${progress.done}/${progress.total}…` : `Import ${selectedCount} selected`}
          </Button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="rounded-xl border p-4 mb-4 text-sm" style={{ background: "#FFF4F2", borderColor: "#E8B4A8", color: "#7A2E1F" }}>
            <div className="flex items-center gap-2 font-semibold mb-2"><AlertTriangle className="w-4 h-4" /> {Object.keys(errors).length} problem(s)</div>
            <ul className="space-y-1">
              {Object.entries(errors).map(([k, v]) => <li key={k}><b>{k}</b>: {v}</li>)}
            </ul>
            {Object.values(errors).some((v) => v.includes("session row")) && (
              <p className="mt-3">
                Creating new session rows was blocked by database permissions. Ask Lovable: “Allow admins to insert rows into
                unit_sessions (RLS policy using has_role(auth.uid(), 'admin'))”, then run this import again.
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          {/* table */}
          <div className="rounded-xl border bg-white overflow-x-auto" style={{ borderColor: `${READER.ink}14` }}>
            {!parsedFiles ? (
              <div className="p-10 text-center text-sm" style={{ color: READER.inkSoft }}>Load the curriculum files above to see what will be imported.</div>
            ) : scanning && !rows.length ? (
              <div className="p-10 text-center text-sm" style={{ color: READER.inkSoft }}>
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Checking the database…
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest" style={{ color: READER.inkSoft }}>
                    <th className="p-3 w-8"></th>
                    <th className="p-3">File</th>
                    <th className="p-3">Unit in database / expected</th>
                    <th className="p-3">Session title in file</th>
                    <th className="p-3">Blocks</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const expected = EXPECTED_UNITS[r.entry.unitKey];
                    return (
                      <tr key={r.entry.key} className="border-t align-top" style={{ borderColor: `${READER.ink}0F` }}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.has(r.entry.key)}
                            disabled={r.status === "no-unit" || busy}
                            onChange={() => toggle(r.entry.key)}
                            aria-label={`Select ${r.entry.key}`}
                          />
                        </td>
                        <td className="p-3 font-mono text-xs" style={{ color: READER.ink }}>{r.entry.key}</td>
                        <td className="p-3 max-w-[260px]">
                          <div style={{ color: READER.ink }}>
                            {r.unit ? r.unit.title : <i>none at position {r.entry.u}</i>}
                            {r.unit?.status === "hidden" && <span className="ml-1 text-[10px] uppercase" style={{ color: READER.gold }}>hidden</span>}
                          </div>
                          {expected && <div className="text-xs" style={{ color: READER.inkSoft }}>{expected}</div>}
                        </td>
                        <td className="p-3 max-w-[280px]" style={{ color: READER.ink }}>{r.fileTitle || <i>no title</i>}</td>
                        <td className="p-3" style={{ color: READER.inkSoft }}>{r.blocks.length}</td>
                        <td className="p-3">
                          <StatusPill status={r.status} error={errors[r.entry.key]} />
                        </td>
                        <td className="p-3">
                          <button className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: READER.navy }} onClick={() => setPreview(r)}>
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* preview */}
          <div className="rounded-xl border p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] overflow-y-auto" style={{ background: READER.paper, borderColor: `${READER.ink}14` }}>
            <div className="text-[11px] uppercase tracking-widest mb-4" style={{ color: READER.gold }}>
              {preview ? `Preview · ${preview.entry.key}` : "Preview"}
            </div>
            {preview ? (
              <article>
                {preview.blocks.map((b, i) => (
                  <BlockRenderer key={i} index={i} block={b} onAwardReflection={async () => {}} onAwardExercise={async () => {}} />
                ))}
              </article>
            ) : (
              <p className="text-sm italic" style={{ color: READER.inkSoft }}>Pick “Preview” on any row to see it as a student will.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, error }: { status: Status; error?: string }) {
  const style: Record<Status, { bg: string; fg: string }> = {
    empty: { bg: "#FFF6DB", fg: "#7A5B00" },
    "missing-session": { bg: "#E8F0FF", fg: "#1F4A9A" },
    "has-content": { bg: "#E3F5EC", fg: "#1D6B45" },
    "no-unit": { bg: "#FBE7E3", fg: "#8A2C1A" },
  };
  if (error) return <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#FBE7E3", color: "#8A2C1A" }}>Failed</span>;
  return (
    <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{ background: style[status].bg, color: style[status].fg }}>
      {STATUS_LABEL[status]}
    </span>
  );
}
