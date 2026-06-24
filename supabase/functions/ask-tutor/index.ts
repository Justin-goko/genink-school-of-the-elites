import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAILY_LIMIT = 10;

interface TurnMsg { role: "user" | "assistant"; content: string }

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Missing Authorization" });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "Unauthorized" });
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({} as any));
    const {
      unit_id,
      session_id,
      message,
      conversation_history,
      pillar_name,
      unit_title,
      session_title,
    } = body ?? {};

    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      return json(400, { error: "message is required (1-2000 chars)" });
    }
    const history: TurnMsg[] = Array.isArray(conversation_history)
      ? conversation_history.filter((m: any) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
        ).slice(-20)
      : [];

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    // Rate limit
    const { data: usageRow } = await admin
      .from("tutor_usage")
      .select("message_count")
      .eq("user_id", user_id)
      .eq("usage_date", today)
      .maybeSingle();

    const count = usageRow?.message_count ?? 0;
    if (count >= DAILY_LIMIT) {
      return json(429, {
        error: "daily_limit_reached",
        limit: DAILY_LIMIT,
        used: count,
        message: "You've used your 10 free tutor messages today. Upgrade to continue.",
      });
    }

    if (!ANTHROPIC_API_KEY) {
      return json(503, {
        error: "tutor_unavailable",
        message: "Tutor is not yet configured. Please try again shortly.",
      });
    }

    const system = [
      "You are the Genlink Light Guide.",
      `The student is studying ${pillar_name ?? "their pillar"} > ${unit_title ?? "their unit"} > ${session_title ?? "their session"}.`,
      "Help them understand this session's concepts.",
      "Use Kenya-specific examples where relevant.",
      "Keep answers under 150 words unless they ask for more detail.",
      "If asked about topics outside this session, gently redirect them back to the current lesson.",
      "Speak warmly, like a wise guide, not a generic chatbot.",
    ].join(" ");

    const anthropicMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system,
        messages: anthropicMessages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("anthropic error", anthropicRes.status, errText);
      return json(502, { error: "tutor_failed", detail: anthropicRes.status });
    }

    const data = await anthropicRes.json();
    const reply: string =
      data?.content?.map((c: any) => (c.type === "text" ? c.text : "")).join("").trim() ||
      "I'm here. Could you ask that again?";

    // Increment usage atomically
    await admin.from("tutor_usage").upsert(
      { user_id, usage_date: today, message_count: count + 1 },
      { onConflict: "user_id,usage_date" },
    );

    return json(200, {
      reply,
      used: count + 1,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - (count + 1),
      unit_id,
      session_id,
    });
  } catch (e) {
    console.error("ask-tutor error", e);
    return json(500, { error: "Unexpected error" });
  }
});