// brevo-webhook: Brevo tells us what happened to each email (delivered, bounced, spam complaint...).
// Address set in Brevo: .../functions/v1/brevo-webhook?token=<app_settings.webhook_secret>
// Matches the email by Brevo's message id and updates email_log.status (bounces show in the admin page).
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
type Obj = Record<string, unknown>;

// Brevo event → our status (email_log_status_check: sent, delivered, bounced, complaint, failed)
const MAP: Record<string, string> = {
  delivered: "delivered",
  hard_bounce: "bounced", soft_bounce: "bounced", blocked: "bounced", invalid_email: "bounced", error: "failed", deferred: "sent",
  spam: "complaint", complaint: "complaint", unsubscribed: "complaint",
};
// a later, "worse" event should not be overwritten by an earlier, better one
const RANK: Record<string, number> = { sent: 0, delivered: 1, failed: 2, bounced: 3, complaint: 4 };

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });
  const { data: settings } = await db.from("app_settings").select("webhook_secret").eq("id", 1).single();
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!settings?.webhook_secret || token !== settings.webhook_secret) return new Response("forbidden", { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  const events = (Array.isArray(body) ? body : [body]) as Obj[];
  let updated = 0;
  for (const e of events) {
    const status = MAP[String(e.event ?? "").toLowerCase()];
    const mid = String(e["message-id"] ?? e.messageId ?? e.message_id ?? "");
    if (!status || !mid) continue;
    const { data: rows } = await db.from("email_log").select("id, status, case_id").eq("provider_message_id", mid);
    for (const r of rows ?? []) {
      if ((RANK[status] ?? 0) < (RANK[r.status] ?? 0)) continue;
      await db.from("email_log").update({ status, status_at: new Date().toISOString() }).eq("id", r.id);
      if (status === "bounced" || status === "complaint") {
        await db.from("audit_log").insert({ actor: "brevo", action: "email_" + status, case_id: r.case_id,
          detail: { event: e.event, reason: String(e.reason ?? "").slice(0, 200) } });
      }
      updated++;
    }
  }
  return new Response(JSON.stringify({ ok: true, updated }), { status: 200, headers: { "Content-Type": "application/json" } });
});
