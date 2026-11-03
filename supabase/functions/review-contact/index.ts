// review-contact: company appeals (£39). After paying, the client chooses phone or email contact.
//   save  – method "phone" (number + available slots on the next working days) or "email" (+ optional note)
// Saves to review_contacts and emails Eduard (letters@) a short alert through Brevo.
import { createClient } from "npm:@supabase/supabase-js@2";

const SLOTS = ["morning", "afternoon", "evening"];
const ALERT_TO = "letters@accounted4tax.co.uk";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
type Obj = Record<string, unknown>;
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

async function alertEduard(c: Obj, row: Obj) {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) return;
  const d = (c.details ?? {}) as Obj;
  const slots = ((row.availability ?? []) as Obj[]).map((s) => `${s.date} ${s.slot}`).join(", ");
  const lines = [
    c.product === "appointment" ? `New £59 appointment booked: ${c.ref}` : `New accountant review: ${c.ref}`,
    `Company: ${d.company_name ?? "-"} (${d.company_number ?? "-"})`,
    `Contact: ${d.full_name ?? "-"}`,
    row.method === "phone" ? `Wants a CALL on ${row.phone}. Available: ${slots || "-"}` : `Wants EMAIL contact: ${row.email}`,
    row.note ? `Note: ${row.note}` : "",
    `Appeal deadline: ${c.appeal_deadline ?? "-"}`,
  ].filter(Boolean);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Tax Letter Sorted", email: "letters@accounted4tax.co.uk" },
      to: [{ email: ALERT_TO }],
      subject: `Company review ${c.ref}: ${row.method === "phone" ? "call requested" : "email contact"}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${lines.map((l) => `<p>${esc(String(l))}</p>`).join("")}</div>`,
      textContent: lines.join("\n"), tags: ["review_alert"],
    }),
  });
  const j = await res.json().catch(() => ({}));
  await db.from("email_log").insert({ case_id: c.id, recipient: ALERT_TO, email_type: "other",
    provider_message_id: j.messageId ?? null, status: res.ok ? "sent" : "failed" });
}

Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("*").eq("id", 1).single();
  const origin = req.headers.get("origin") ?? "";
  const okOrigin = (settings?.allowed_origins ?? []).includes(origin) || origin.startsWith("http://localhost");
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? origin : "https://taxletters.accounted4tax.co.uk",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  if (!okOrigin) return reply(403, { error: "origin" });

  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: "bad_request" }); }
  const preview = !settings?.live && !!settings?.preview_code && body.preview === settings.preview_code;
  if (!settings?.live && !preview) return reply(403, { error: "closed" });
  const mustPay = !preview || !!settings?.payments_test;

  const token = String(body.case ?? "");
  if (!/^[0-9a-f]{40,80}$/.test(token)) return reply(400, { error: "bad_request" });
  const { data: c } = await db.from("cases")
    .select("id, ref, product, letter_type, details, appeal_deadline, data_deleted_at")
    .eq("private_token", token).single();
  if (!c || c.data_deleted_at) return reply(404, { error: "not_found" });
  if (c.product !== "option3" && c.product !== "appointment") return reply(400, { error: "not_option3" });
  if (mustPay) {
    const { data: paid } = await db.from("payments").select("id").eq("case_id", c.id).eq("status", "paid").limit(1);
    if (!paid?.length) return reply(402, { error: "not_paid" });
  }
  const d = (c.details ?? {}) as Obj;

  try {
    if (body.action === "get") {
      const { data: row } = await db.from("review_contacts").select("method, created_at").eq("case_id", c.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      return reply(200, { ref: c.ref, phone: d.phone ?? null, email: d.email ?? null, saved: row ?? null });
    }
    if (body.action === "save") {
      const method = body.method === "email" ? "email" : body.method === "phone" ? "phone" : null;
      if (!method) return reply(400, { error: "method" });
      const phone = str(body.phone, 30), email = str(body.email, 200).toLowerCase(), note = str(body.note, 1000);
      const today = new Date().toISOString().slice(0, 10);
      const availability = (Array.isArray(body.availability) ? body.availability : [])
        .filter((s: Obj) => typeof s?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.date as string) && (s.date as string) >= today && SLOTS.includes(String(s.slot)))
        .slice(0, 15).map((s: Obj) => ({ date: s.date, slot: s.slot }));
      if (method === "phone") {
        if (!/^[+\d][\d\s()-]{8,}$/.test(phone)) return reply(400, { error: "phone" });
        if (!availability.length) return reply(400, { error: "availability" });
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply(400, { error: "email" });
      const row = { case_id: c.id, method, phone: method === "phone" ? phone : null, email: method === "email" ? email : (d.email ?? null),
        availability: method === "phone" ? availability : null, note: note || null };
      await db.from("review_contacts").delete().eq("case_id", c.id).is("confirmed_at", null);
      await db.from("review_contacts").insert(row);
      await db.from("audit_log").insert({ actor: "client", action: "review_contact_saved", case_id: c.id, detail: { method } });
      await alertEduard(c, row).catch(() => {});
      return reply(200, { ok: true });
    }
    return reply(400, { error: "action" });
  } catch (e) {
    await db.from("audit_log").insert({ actor: "system", action: "review_contact_error", case_id: c.id, detail: { error: String((e as Error).message ?? e).slice(0, 300) } });
    return reply(502, { error: "server" });
  }
});
