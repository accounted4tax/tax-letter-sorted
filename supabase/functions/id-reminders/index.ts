// id-reminders: emails Option 3 clients who chose "I will upload later" and still haven't sent their ID.
// Reminders go 1, 6, 12, 24 and 48 hours after the first request, then stop.
// Called every 10 minutes by pg_cron with the private x-cron-secret header.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendIdEmail } from "./email.ts";

const HOURS = [1, 6, 12, 24, 48];

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("cron_secret, live, preview_code").eq("id", 1).single();
  if (!settings?.cron_secret || req.headers.get("x-cron-secret") !== settings.cron_secret) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }
  const { data: due } = await db.from("cases")
    .select("id, ref, language, letter_type, details, appeal_deadline, private_token, id_requested_at, id_reminders_sent")
    .eq("product", "option3").not("id_requested_at", "is", null).is("id_completed_at", null)
    .is("data_deleted_at", null).lt("id_reminders_sent", HOURS.length).limit(100);

  const sent: string[] = [];
  for (const c of due ?? []) {
    const n = c.id_reminders_sent ?? 0;
    const at = new Date(c.id_requested_at).getTime() + HOURS[n] * 3600 * 1000;
    if (Date.now() < at) continue;
    const r = await sendIdEmail(db, c, { reminder: true, previewCode: settings.live ? null : settings.preview_code });
    // count the attempt either way, so a failing address is not emailed every 10 minutes
    await db.from("cases").update({ id_reminders_sent: n + 1 }).eq("id", c.id);
    await db.from("audit_log").insert({ actor: "system", action: "id_reminder", case_id: c.id, detail: { number: n + 1, ok: r.ok } });
    if (r.ok) sent.push(c.ref);
  }
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
