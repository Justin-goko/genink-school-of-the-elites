import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LightGuide from "./LightGuide";
import "./lightGuide.css";

interface Props {
  open: boolean;
  onClose: () => void;
  context: {
    unit_id?: string;
    session_id?: string;
    pillar_name?: string;
    unit_title?: string;
    session_title?: string;
  };
}

interface Msg { role: "user" | "assistant"; content: string }

const INTRO_FLAG = "genlink:lightguide:intro-seen";

export default function TutorPanel({ open, onClose, context }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [introDone, setIntroDone] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const seen = typeof window !== "undefined" && window.localStorage.getItem(INTRO_FLAG);
    if (!seen) {
      setShowIntro(true);
      setIntroDone(false);
      const t = setTimeout(() => {
        setIntroDone(true);
        try { window.localStorage.setItem(INTRO_FLAG, "1"); } catch {}
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    if (!user) { toast.error("Sign in to chat with the Light Guide"); return; }

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ask-tutor", {
        body: { message: text, conversation_history: messages, ...context },
      });
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 429) { toast.error("Daily limit reached — upgrade to keep chatting."); setUsage({ used: 10, limit: 10 }); }
        else if (status === 503) toast.error("Tutor isn't configured yet.");
        else toast.error("Tutor unavailable. Try again.");
        return;
      }
      const reply = (data as any)?.reply ?? "…";
      setMessages([...next, { role: "assistant", content: reply }]);
      if ((data as any)?.limit) setUsage({ used: (data as any).used, limit: (data as any).limit });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  const limitReached = usage && usage.used >= usage.limit;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 md:bg-transparent" onClick={onClose} />
      <aside
        className={cn(
          "fixed z-50 bg-card border-l shadow-2xl flex flex-col",
          "inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-[400px]",
        )}
      >
        <div className="p-5 border-b bg-gradient-to-b from-amber-50 to-card flex items-center gap-3">
          <LightGuide size={56} className={!introDone ? "lg-intro" : ""} intense={!introDone} />
          <div className="flex-1">
            <p className="font-bold text-foreground">Light Guide</p>
            <p className="text-xs text-muted-foreground">{context.session_title || context.unit_title || "Your AI tutor"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {showIntro && (
            <div className="flex items-start gap-2">
              <LightGuide size={28} static />
              <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm max-w-[80%]">
                <span className="font-medium">I'm your Light Guide.</span> Ask me anything about what you're learning.
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="bg-[hsl(var(--primary))] text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2">
                <LightGuide size={28} static />
                <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="flex items-start gap-2">
              <LightGuide size={28} intense />
              <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-3 h-3 inline animate-spin mr-1" /> thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          {limitReached ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
              <p className="text-sm font-medium text-amber-900 mb-2">You've used your 10 free messages today.</p>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                <Sparkles className="w-3 h-3 mr-1" /> Upgrade for unlimited
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={introDone ? "Ask the Light Guide…" : "One moment…"}
                disabled={busy || !introDone}
                rows={2}
                className="resize-none mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {usage ? `${usage.used}/${usage.limit} today` : "10 free messages / day"}
                </span>
                <Button size="sm" onClick={send} disabled={busy || !input.trim() || !introDone}>
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span className="ml-1">Send</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}