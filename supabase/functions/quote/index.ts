// quote: practice quotes made in the admin page ("New quote", Eduard 6 Nov 2026).
//   Admin (signed-in admin):  save · list · pdf · send · set_status
//   Client (private link on quote.html):  view · accept (→ Stripe) · pay (→ Stripe again) · confirm (after Stripe)
//   Cron (x-cron-secret):  reminders – accepted but not paid: emails 1 hour, 24 hours, 72 hours and 7 days after accepting
// Payment: Stripe Checkout – one-off catch-up lines + the monthly fee as a monthly subscription (card).
// Acceptances and payments are emailed to info@accounted4tax.co.uk. Status: draft → sent → accepted_unpaid → accepted.
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildQuotePdf, gbp, period, totals, type QItem } from "./quote-pdf.ts";

const SITE = "https://taxletters.accounted4tax.co.uk";
const NOTIFY = "info@accounted4tax.co.uk";
const SENDER = { name: "Accounted4Tax", email: "letters@accounted4tax.co.uk" };
const REMINDER_HOURS = [1, 24, 72, 168];
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
type Obj = Record<string, any>;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().replace(/[ \t]+/g, " ").slice(0, max) : "");
const today = () => new Date().toISOString().slice(0, 10);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
function b64(bytes: Uint8Array) { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); }
async function sha256(b: Uint8Array) { const h = await crypto.subtle.digest("SHA-256", b as BufferSource); return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
const acceptUrl = (q: Obj) => `${SITE}/quote.html?q=${q.token}`;

async function stripe(path: string, params?: Record<string, string>) {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("not_configured");
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { method: params ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params ? new URLSearchParams(params) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error("stripe:" + (j?.error?.message ?? r.status));
  return j as Obj;
}
const stripeMode = () => (String(Deno.env.get("STRIPE_SECRET_KEY") ?? "").startsWith("sk_live_") ? "live" : "test");

async function brevo(to: string, name: string, subject: string, paras: string[], opts: { button?: [string, string]; attach?: { name: string; content: string }; tag: string; replyTo?: string }) {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) return { ok: false };
  const btn = opts.button ? `<p style="margin:24px 0"><a href="${opts.button[1]}" style="background:#0E6E6B;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold;display:inline-block">${esc(opts.button[0])}</a></p>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#14213D"><div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#14213D;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;font-size:18px;font-weight:bold">Accounted4Tax</div>
<div style="background:#fff;padding:22px 18px;border-radius:0 0 10px 10px;font-size:15px;line-height:1.55">${paras.map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}${btn}</div>
<p style="font-size:12px;color:#4A5568;text-align:center">Accounted4Tax Ltd · 128 City Road, London, EC1V 2NX · info@accounted4tax.co.uk · 07563 811938</p></div></body></html>`;
  const text = [...paras, opts.button ? `${opts.button[0]}: ${opts.button[1]}` : ""].filter(Boolean).join("\n\n");
  const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: SENDER, replyTo: { email: opts.replyTo ?? NOTIFY }, to: [{ email: to, name: name || undefined }], subject, htmlContent: html, textContent: text,
      attachment: opts.attach ? [opts.attach] : undefined, tags: [opts.tag] }) });
  const j = await r.json().catch(() => ({}));
  await db.from("email_log").insert({ case_id: null, recipient: to, email_type: "other", provider_message_id: j.messageId ?? null, status: r.ok ? "sent" : "failed" });
  return { ok: r.ok };
}
// copy to the Google Drive Client register (Quotes tab), if connected
async function driveRow(q: Obj, status: string) {
  const url = Deno.env.get("GDRIVE_URL"), secret = Deno.env.get("GDRIVE_SECRET");
  if (!url || !secret) return;
  const t = q.totals ?? {}, c = q.client ?? {};
  const work = (q.items as QItem[]).filter((i) => i.label).map((i) => i.label).join("; ").slice(0, 300);
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, action: "quote",
    row: [new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/London" }), q.number,
      [c.company_name, c.name].filter(Boolean).join(" – "), work, t.oneoff ? Number(t.oneoff).toFixed(2) : "", t.monthly_total ? Number(t.monthly_total).toFixed(2) : "",
      t.months ?? "", status, "Practice quote"] }) }).catch(() => {});
}

function clean(b: Obj) {
  const c = (b.client ?? {}) as Obj;
  const client = { name: str(c.name, 120), company_name: str(c.company_name, 160).toUpperCase(), company_number: str(c.company_number, 10).replace(/\s/g, "").toUpperCase(),
    address: str(c.address, 300), email: str(c.email, 200).toLowerCase(), phone: str(c.phone, 30) };
  const items: QItem[] = (Array.isArray(b.items) ? b.items : []).slice(0, 40).map((i: Obj) => ({
    section: ["oneoff", "yearend", "monthly"].includes(i.section) ? i.section : "monthly", label: str(i.label, 160),
    qty: Math.max(0, Math.min(10000, Number(i.qty) || 0)), price: Math.max(0, Math.min(100000, Math.round((Number(i.price) || 0) * 100) / 100)) }))
    .filter((i: QItem) => i.label && i.qty > 0);
  const spread = Math.max(1, Math.min(36, Math.round(Number(b.spread_months) || 12)));
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(String(b.valid_until ?? "")) ? String(b.valid_until) : new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const pr = (b.periods ?? {}) as Obj;
  const periods = { oneoff: str(pr.oneoff, 80) || undefined, yearend: str(pr.yearend, 80) || undefined };
  return { periods, client, items, spread_months: spread, totals: totals(items, spread), notes: str(b.notes, 1500) || null, cover_text: str(b.cover_text, 3000) || null, valid_until: valid };
}
async function pdfFor(q: Obj) {
  return await buildQuotePdf({ number: q.number, date: String(q.created_at).slice(0, 10), valid_until: q.valid_until, spread_months: q.spread_months,
    client: q.client, items: q.items, notes: q.notes ?? "", accept_url: acceptUrl(q), periods: q.periods ?? {} });
}
function publicView(q: Obj) {
  const t = q.totals ?? {};
  return { number: q.number, status: q.status, valid_until: q.valid_until, expired: q.valid_until < today() && !["accepted", "accepted_unpaid"].includes(q.status),
    company_name: q.client?.company_name ?? null, name: q.client?.name ?? null, items: q.items, spread_months: q.spread_months, totals: t,
    periods: { oneoff: period(q.periods?.oneoff), yearend: period(q.periods?.yearend) } };
}
async function checkout(q: Obj) {
  const t = q.totals ?? {}, c = q.client ?? {};
  const monthly = Math.round(Number(t.monthly_total ?? 0) * 100), oneoff = (q.items as QItem[]).filter((i) => i.section === "oneoff");
  const p: Record<string, string> = {
    mode: monthly > 0 ? "subscription" : "payment", customer_email: c.email ?? "", client_reference_id: q.number,
    "metadata[quote]": q.number, success_url: `${acceptUrl(q)}&session={CHECKOUT_SESSION_ID}`, cancel_url: `${acceptUrl(q)}&cancelled=1`, locale: "en-GB",
  };
  let n = 0;
  if (monthly > 0) {
    p[`line_items[${n}][price_data][currency]`] = "gbp"; p[`line_items[${n}][price_data][unit_amount]`] = String(monthly);
    p[`line_items[${n}][price_data][recurring][interval]`] = "month";
    p[`line_items[${n}][price_data][product_data][name]`] = `Accounted4Tax monthly fee – ${c.company_name || c.name || q.number}`;
    p[`line_items[${n}][quantity]`] = "1"; n++;
    p["subscription_data[metadata][quote]"] = q.number;
    p["subscription_data[description]"] = `${q.number} · monthly fee`;
  }
  for (const i of oneoff) {
    p[`line_items[${n}][price_data][currency]`] = "gbp"; p[`line_items[${n}][price_data][unit_amount]`] = String(Math.round(i.price * 100));
    p[`line_items[${n}][price_data][product_data][name]`] = i.label.slice(0, 120); p[`line_items[${n}][quantity]`] = String(i.qty); n++;
  }
  if (!n) throw new Error("nothing_to_pay");
  if (monthly <= 0) p["payment_intent_data[description]"] = `${q.number} · one-off fee`;
  const s = await stripe("checkout/sessions", p);
  await db.from("practice_quotes").update({ stripe_session_id: s.id, stripe_mode: stripeMode() }).eq("id", q.id);
  return String(s.url);
}
// Stripe says paid → mark accepted, tell Eduard
async function markPaid(q: Obj, session: Obj) {
  if (q.status === "accepted") return;
  const now = new Date().toISOString();
  await db.from("practice_quotes").update({ status: "accepted", paid_at: now, stripe_subscription_id: session.subscription ?? null }).eq("id", q.id);
  const t = q.totals ?? {}, c = q.client ?? {};
  await brevo(NOTIFY, "Eduard", `Quote ${q.number} paid – ${c.company_name || c.name}`, [
    `${c.name || "The client"}${c.company_name ? " (" + c.company_name + ")" : ""} has paid quote ${q.number}.`,
    [t.oneoff ? `One-off: ${gbp(t.oneoff)}` : "", t.monthly_total ? `Monthly fee: ${gbp(t.monthly_total)} a month (subscription set up in Stripe)` : ""].filter(Boolean).join("\n"),
    "Next: send the engagement letter."], { tag: "quote_paid" });
  await driveRow({ ...q, status: "accepted" }, "Accepted – paid");
}
async function sessionPaid(id: string | null) {
  if (!id) return null;
  try { const s = await stripe(`checkout/sessions/${id}`); return s.status === "complete" && ["paid", "no_payment_required"].includes(String(s.payment_status)) ? s : null; } catch { return null; }
}

Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("*").eq("id", 1).single();
  const origin = req.headers.get("origin") ?? "";
  const okOrigin = (settings?.allowed_origins ?? []).includes(origin) || origin.startsWith("http://localhost");
  const cors = { "Access-Control-Allow-Origin": okOrigin ? origin : SITE, "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info", "Vary": "Origin" };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: "bad_request" }); }

  try {
    // ---------- cron: reminders ----------
    if (req.headers.get("x-cron-secret")) {
      if (req.headers.get("x-cron-secret") !== settings?.cron_secret) return reply(403, { error: "forbidden" });
      const { data: qs } = await db.from("practice_quotes").select("*").eq("status", "accepted_unpaid").limit(100);
      const sent: string[] = [];
      for (const q of qs ?? []) {
        const paid = await sessionPaid(q.stripe_session_id);
        if (paid) { await markPaid(q, paid); continue; }
        const due = REMINDER_HOURS[q.reminders_sent];
        if (due == null || Date.now() - new Date(q.accepted_at).getTime() < due * 3600e3) continue;
        const c = q.client ?? {}, t = q.totals ?? {};
        const r = await brevo(c.email, c.name, `Reminder: complete your payment – quote ${q.number}`, [
          `Dear ${(c.name || "").split(" ")[0] || "client"},`,
          `Thank you for accepting our quote ${q.number}${c.company_name ? " for " + c.company_name : ""}. We haven't received the payment yet, so we can't start the work.`,
          [t.oneoff ? `One-off fee: ${gbp(t.oneoff)}` : "", t.monthly_total ? `Monthly fee: ${gbp(t.monthly_total)} a month` : ""].filter(Boolean).join("\n"),
          "You can pay securely online using the button below. If you have any questions, just reply to this email or call 07563 811938.",
          "Kind regards,\nEduard Husaru MAAT\nAccounted4Tax Ltd"], { button: ["Complete payment", acceptUrl(q)], tag: "quote_reminder" });
        await db.from("practice_quotes").update({ reminders_sent: q.reminders_sent + 1, last_reminder_at: new Date().toISOString() }).eq("id", q.id);
        if (r.ok) sent.push(q.number);
      }
      return reply(200, { ok: true, reminders: sent });
    }

    // ---------- admin ----------
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (body.action && ["save", "list", "get", "pdf", "send", "set_status"].includes(String(body.action))) {
      if (!okOrigin) return reply(403, { error: "origin" });
      const { data: u } = jwt ? await db.auth.getUser(jwt) : { data: null };
      const email = String(u?.user?.email ?? "").toLowerCase();
      if (!email) return reply(401, { error: "signin" });
      if (!((settings?.admin_emails ?? []) as string[]).map((x) => x.toLowerCase()).includes(email)) return reply(403, { error: "not_admin" });

      if (body.action === "list") {
        const { data } = await db.from("practice_quotes").select("id, number, created_at, client, totals, status, sent_at, accepted_at, paid_at, reminders_sent, valid_until, spread_months").order("created_at", { ascending: false }).limit(200);
        return reply(200, { quotes: data ?? [] });
      }
      if (body.action === "save") {
        const v = clean(body);
        if (!v.items.length) return reply(400, { error: "no_items" });
        if (body.id) {
          const { data: cur } = await db.from("practice_quotes").select("status").eq("id", body.id).single();
          if (cur && ["accepted", "accepted_unpaid"].includes(cur.status)) return reply(400, { error: "already_accepted" });
          const { data } = await db.from("practice_quotes").update(v).eq("id", body.id).select("*").single();
          return reply(200, { quote: data });
        }
        const { data: num } = await db.rpc("next_practice_quote_number");
        const token = [...crypto.getRandomValues(new Uint8Array(24))].map((x) => x.toString(16).padStart(2, "0")).join("");
        const { data } = await db.from("practice_quotes").insert({ ...v, number: num, token, created_by: email }).select("*").single();
        return reply(200, { quote: data });
      }
      const { data: q } = await db.from("practice_quotes").select("*").eq("id", String(body.id ?? "")).maybeSingle();
      if (!q) return reply(404, { error: "not_found" });
      if (body.action === "get") return reply(200, { quote: q });
      if (body.action === "pdf") {
        const pdf = await pdfFor(q);
        return reply(200, { pdf: b64(pdf), name: `Quote ${q.number} – ${q.client?.company_name || q.client?.name || ""}.pdf`.replace(/[\/\\:*?"<>|]/g, " ") });
      }
      if (body.action === "send") {
        const c = q.client ?? {};
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email ?? "")) return reply(400, { error: "email" });
        const pdf = await pdfFor(q), sha = await sha256(pdf);
        const cover = q.cover_text || `Dear ${(c.name || "").split(" ")[0] || "client"},\n\nThank you for considering Accounted4Tax. Please find attached our quote ${q.number}${c.company_name ? " for " + c.company_name : ""}.\n\nIf you are happy to go ahead, click "Accept this quote" in the PDF or the button below, where you can accept and pay securely online. If you have any questions, just reply to this email or call me on 07563 811938.\n\nKind regards,\nEduard Husaru MAAT\nDirector, Accounted4Tax Ltd`;
        const r = await brevo(c.email, c.name, `Your quote from Accounted4Tax${c.company_name ? " – " + c.company_name : ""}`, cover.split(/\n\n+/),
          { button: ["View and accept the quote", acceptUrl(q)], attach: { name: `Quote ${q.number}.pdf`, content: b64(pdf) }, tag: "practice_quote" });
        if (!r.ok) return reply(502, { error: "email_failed" });
        await db.from("practice_quotes").update({ status: q.status === "draft" ? "sent" : q.status, sent_at: new Date().toISOString(), pdf_sha256: sha }).eq("id", q.id);
        await driveRow(q, "Sent");
        return reply(200, { ok: true, link: acceptUrl(q) });
      }
      if (body.action === "set_status") {
        const s = String(body.status);
        if (!["draft", "sent", "accepted_unpaid", "accepted", "declined", "expired"].includes(s)) return reply(400, { error: "status" });
        await db.from("practice_quotes").update({ status: s }).eq("id", q.id);
        return reply(200, { ok: true, link: acceptUrl(q) });
      }
    }

    // ---------- client (private link) ----------
    if (!okOrigin) return reply(403, { error: "origin" });
    const token = String(body.q ?? "");
    if (!/^[0-9a-f]{48}$/.test(token)) return reply(400, { error: "bad_request" });
    const { data: q } = await db.from("practice_quotes").select("*").eq("token", token).maybeSingle();
    if (!q || q.status === "draft") return reply(404, { error: "not_found" });

    if (body.action === "view") return reply(200, publicView(q));
    if (body.action === "confirm") {
      const s = await sessionPaid(String(body.session ?? "") || q.stripe_session_id);
      if (s && (!q.stripe_session_id || s.id === q.stripe_session_id || s.client_reference_id === q.number)) { await markPaid(q, s); return reply(200, { paid: true }); }
      return reply(200, { paid: false });
    }
    if (body.action === "accept" || body.action === "pay") {
      if (q.status === "accepted") return reply(200, { paid: true });
      if (q.status === "declined") return reply(400, { error: "declined" });
      if (body.action === "accept") {
        if (q.valid_until < today() && q.status !== "accepted_unpaid") return reply(400, { error: "expired" });
        const name = str(body.name, 120);
        if (name.length < 2 || body.agree !== true) return reply(400, { error: "agree" });
        if (q.status !== "accepted_unpaid") {
          await db.from("practice_quotes").update({ status: "accepted_unpaid", accepted_at: new Date().toISOString(), accepted_name: name }).eq("id", q.id);
          const c = q.client ?? {}, t = q.totals ?? {};
          await brevo(NOTIFY, "Eduard", `Quote ${q.number} accepted – ${c.company_name || c.name}`, [
            `${name} accepted quote ${q.number}${c.company_name ? " for " + c.company_name : ""} on ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}.`,
            [t.oneoff ? `One-off: ${gbp(t.oneoff)}` : "", t.monthly_total ? `Monthly fee: ${gbp(t.monthly_total)} a month` : ""].filter(Boolean).join("\n"),
            "They have been sent to Stripe to pay. You'll get another email when the payment goes through; if it doesn't, reminders go out automatically after 1 hour, 24 hours, 72 hours and 7 days."],
            { tag: "quote_accepted", replyTo: c.email || NOTIFY });
          await driveRow(q, "Accepted – not paid");
        }
      }
      return reply(200, { url: await checkout(q) });
    }
    return reply(400, { error: "action" });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    await db.from("audit_log").insert({ actor: "system", action: "quote_error", detail: { action: body.action, error: msg.slice(0, 300) } });
    return reply(msg === "not_configured" ? 503 : 502, { error: msg.startsWith("stripe:") ? "stripe" : "server" });
  }
});
