import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
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

const STARTERS = ["Explain this simply", "Give me a Gidurai example", "Quiz me on this"];

export default function TutorPanel({ open, onClose, context }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  async function send(message?: string) {
    const text = (message ?? input).trim();
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
  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? 10;
  const remaining = Math.max(0, limit - used);
  const subtitle = [context.pillar_name, context.unit_title, context.session_title].filter(Boolean).join(" › ");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-primary/30 lg:hidden" onClick={onClose} />
      <aside
        className={cn(
          "fixed z-50 border-l shadow-2xl flex flex-col bg-tutor",
          "inset-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[400px]",
        )}
      >
        <div className="p-4 border-b border-primary-foreground/15 bg-primary text-primary-foreground flex items-center gap-3">
          <LightGuide size={52} />
          <div className="flex-1 min-w-0">
            <p className="font-bold">Light Guide</p>
            <p className="text-xs text-primary-foreground/70 truncate">{subtitle || "Your AI tutor"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Light Guide" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><X className="w-4 h-4" /></Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-tutor">
          {messages.length === 0 && !busy && (
            <div className="h-full min-h-72 flex flex-col items-center justify-center text-center px-4">
              <LightGuide size={72} />
              <p className="mt-4 text-sm font-medium text-primary">I'm your Light Guide. Ask me anything about this session.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {STARTERS.map((starter) => (
                  <Button key={starter} type="button" variant="outline" size="sm" onClick={() => send(starter)} className="h-auto whitespace-normal border-premium/60 bg-tutor-field py-2 text-primary hover:bg-premium/15 hover:text-primary">
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2">
                <LightGuide size={28} static />
                <div className="bg-card border-l-[3px] border-premium rounded-r-2xl rounded-bl-2xl px-3.5 py-2 text-sm max-w-[80%] whitespace-pre-wrap text-foreground shadow-sm">
                  {m.content}
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="flex items-start gap-2">
              <LightGuide size={28} intense />
              <div className="bg-card border-l-[3px] border-premium rounded-r-2xl rounded-bl-2xl px-4 py-3 shadow-sm" aria-label="Light Guide is thinking">
                <span className="lg-thinking-dot" /><span className="lg-thinking-dot" /><span className="lg-thinking-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-premium/25 bg-tutor-field p-3">
          <p className="mb-2 text-xs font-medium text-primary">{remaining} of {limit} free messages left today</p>
          <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={limitReached ? "Daily message limit reached" : "Ask the Light Guide…"}
                disabled={busy || Boolean(limitReached)}
                rows={2}
                className="min-h-[64px] resize-none border-premium/30 bg-tutor-field focus-visible:ring-premium focus-visible:ring-offset-0"
              />
              <Button size="icon" onClick={() => send()} disabled={busy || !input.trim() || Boolean(limitReached)} aria-label="Send message" className="shrink-0 bg-premium text-premium-foreground hover:bg-premium/90 disabled:bg-muted disabled:text-muted-foreground">
                <Send className="w-4 h-4" />
              </Button>
          </div>
        </div>
      </aside>
    </>
  );
}