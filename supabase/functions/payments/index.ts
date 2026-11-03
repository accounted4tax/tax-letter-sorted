// payments: Stripe Checkout for Option 2 (£19), Option 3 (£39) and the company accountant review (£59).
//   checkout  – creates a Stripe Checkout page for the case and returns its address
//   link_info / link_checkout – a payment link Eduard emailed after a call (£19 / £39 / £59 or a £20 / £40 top-up)
//   confirm   – after Stripe sends the client back, checks with Stripe that the payment went through,
//               then records the payment and the long-term customer record
// The Stripe secret key lives only in Supabase secrets (STRIPE_SECRET_KEY).
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://taxletters.accounted4tax.co.uk";
const PRICES: Record<string, { pence: number; name: string }> = {
  option2: { pence: 1900, name: "Tax Letter Sorted – Option 2: appeal prepared for you to sign and send" },
  option3: { pence: 3900, name: "Tax Letter Sorted – Option 3: appeal reviewed by a qualified accountant" },
  // Companies (Corporation Tax, Companies House): ID, authority to act, appeal submitted by Accounted4Tax as agent (Eduard, 1 Nov 2026)
  appointment: { pence: 5900, name: "Tax Letter Sorted – appointment with a qualified accountant" },
  option3_company: { pence: 5900, name: "Tax Letter Sorted – company penalty appeal by a qualified accountant (as agent)" },
};
const COMPANY_TYPES = ["ct-late-filing", "companies-house-late-filing"];

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
type Obj = Record<string, unknown>;

async function stripe(path: string, params?: Record<string, string>) {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("not_configured");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const j = await res.json();
  if (!res.ok) throw new Error("stripe:" + (j?.error?.message ?? res.status));
  return j as Obj;
}
const mode = () => (String(Deno.env.get("STRIPE_SECRET_KEY") ?? "").startsWith("sk_live_") ? "live" : "test");

async function funnel(visitId: unknown, step: string, c: Obj, detail?: string) {
  if (typeof visitId === "string" && /^[0-9a-f-]{36}$/i.test(visitId)) {
    await db.from("funnel_events").insert({ visit_id: visitId, step, letter_type: c.letter_type ?? null, language: c.language ?? null, detail: detail ?? null });
  }
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
  // Before launch only Stripe TEST keys may be used.
  if (!settings?.live && mode() === "live") return reply(503, { error: "live_key_before_launch" });

  const token = String(body.case ?? "");
  if (!/^[0-9a-f]{40,80}$/.test(token)) return reply(400, { error: "bad_request" });
  const { data: c } = await db.from("cases")
    .select("id, ref, language, product, letter_type, details, details_saved_at, customer_id, data_deleted_at")
    .eq("private_token", token).single();
  if (!c || c.data_deleted_at) return reply(404, { error: "not_found" });
  const d = (c.details ?? {}) as Obj;

  try {
    if (body.action === "checkout") {
      if (!c.details_saved_at) return reply(400, { error: "no_details" });
      const product = String(c.product);
      const company = COMPANY_TYPES.includes(String(c.letter_type));
      if (company && product !== "option3") return reply(400, { error: "product" });   // no £19 option for companies
      const price = PRICES[company ? "option3_company" : product];
      if (!price) return reply(400, { error: "product" });
      const lang = c.language === "ro" ? "ro" : "en-GB";
      const q = (s: string) => `${SITE}/${s}`;
      const session = await stripe("checkout/sessions", {
        mode: "payment",
        "line_items[0][price_data][currency]": "gbp",
        "line_items[0][price_data][unit_amount]": String(price.pence),
        "line_items[0][price_data][product_data][name]": price.name,
        "line_items[0][quantity]": "1",
        customer_email: String(d.email ?? ""),
        client_reference_id: String(c.ref),
        "metadata[case_ref]": String(c.ref),
        "metadata[product]": product,
        "payment_intent_data[description]": `${c.ref} · ${product}`,
        "payment_intent_data[metadata][case_ref]": String(c.ref),
        locale: lang,
        success_url: q("paid.html?session={CHECKOUT_SESSION_ID}"),
        cancel_url: q("details.html?product=" + product + "&cancelled=1"),
        expires_at: String(Math.floor(Date.now() / 1000) + 60 * 60),
      });
      await db.from("payments").insert({
        case_id: c.id, product, amount_pence: price.pence, stripe_session_id: session.id, status: "pending", stripe_mode: mode(),
      });
      await funnel(body.visit_id, "stripe_opened", c, product);
      return reply(200, { url: session.url });
    }

    // ---- £59 appointment (SA statement / debt letters): name, email, phone, then Stripe ----
    if (body.action === "appointment_checkout") {
      const name = String(body.name ?? "").trim().slice(0, 120), email = String(body.email ?? "").trim().toLowerCase().slice(0, 200), phone = String(body.phone ?? "").trim().slice(0, 30);
      if (name.length < 2) return reply(400, { error: "name" });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply(400, { error: "email" });
      if (!/^[+\d][\d\s()-]{8,}$/.test(phone)) return reply(400, { error: "phone" });
      if (body.terms !== true) return reply(400, { error: "terms" });
      const nd = { ...d, full_name: name, email, phone, marketing_consent: body.marketing === true, terms_accepted_at: new Date().toISOString() };
      await db.from("cases").update({ details: nd, details_saved_at: new Date().toISOString(), product: "appointment",
        delete_after: new Date(Date.now() + 60 * 864e5).toISOString() }).eq("id", c.id);
      const price = PRICES.appointment;
      const q = (s: string) => `${SITE}/${s}`;
      const session = await stripe("checkout/sessions", {
        mode: "payment",
        "line_items[0][price_data][currency]": "gbp",
        "line_items[0][price_data][unit_amount]": String(price.pence),
        "line_items[0][price_data][product_data][name]": price.name,
        "line_items[0][quantity]": "1",
        customer_email: email, client_reference_id: String(c.ref),
        "metadata[case_ref]": String(c.ref), "metadata[product]": "appointment",
        "payment_intent_data[description]": `${c.ref} · appointment`, "payment_intent_data[metadata][case_ref]": String(c.ref),
        locale: c.language === "ro" ? "ro" : "en-GB",
        success_url: q("paid.html?session={CHECKOUT_SESSION_ID}"), cancel_url: q("appointment.html?cancelled=1"),
        expires_at: String(Math.floor(Date.now() / 1000) + 60 * 60),
      });
      await db.from("payments").insert({ case_id: c.id, product: "appointment", amount_pence: price.pence, stripe_session_id: session.id, status: "pending", stripe_mode: mode() });
      await funnel(body.visit_id, "stripe_opened", c, "appointment");
      return reply(200, { url: session.url });
    }

    // ---- payment links sent from the admin page ----
    if (body.action === "link_info" || body.action === "link_checkout") {
      const { data: link } = await db.from("payment_links").select("*").eq("id", String(body.link ?? "")).eq("case_id", c.id).maybeSingle();
      if (!link) return reply(404, { error: "no_link" });
      const expired = link.expires_at && new Date(link.expires_at) < new Date();
      if (body.action === "link_info") {
        return reply(200, { ref: c.ref, amount_pence: link.amount_pence, label: link.label, target: link.target, used: !!link.used_at, expired: !!expired, letter_type: c.letter_type });
      }
      if (link.used_at) return reply(400, { error: "used" });
      if (expired) return reply(400, { error: "expired" });
      const lang = c.language === "ro" ? "ro" : "en-GB";
      const q = (s: string) => `${SITE}/${s}`;
      const session = await stripe("checkout/sessions", {
        mode: "payment",
        "line_items[0][price_data][currency]": "gbp",
        "line_items[0][price_data][unit_amount]": String(link.amount_pence),
        "line_items[0][price_data][product_data][name]": "Tax Letter Sorted – " + String(link.label ?? link.product),
        "line_items[0][quantity]": "1",
        customer_email: String(d.email ?? ""),
        client_reference_id: String(c.ref),
        "metadata[case_ref]": String(c.ref),
        "metadata[product]": String(link.product),
        "metadata[payment_link]": String(link.id),
        "payment_intent_data[description]": `${c.ref} · ${link.label ?? link.product}`,
        "payment_intent_data[metadata][case_ref]": String(c.ref),
        locale: lang,
        success_url: q("paid.html?session={CHECKOUT_SESSION_ID}"),
        cancel_url: q(`pay-link.html?l=${link.id}&cancelled=1`),
        expires_at: String(Math.floor(Date.now() / 1000) + 60 * 60),
      });
      await db.from("payments").insert({
        case_id: c.id, product: link.product, amount_pence: link.amount_pence, stripe_session_id: session.id, status: "pending", stripe_mode: mode(), payment_link_id: link.id,
      });
      await funnel(body.visit_id, "stripe_opened", c, String(link.product));
      return reply(200, { url: session.url });
    }

    if (body.action === "confirm") {
      const sid = String(body.session ?? "");
      if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sid)) return reply(400, { error: "bad_request" });
      const { data: p } = await db.from("payments").select("id, status, product, payment_link_id").eq("stripe_session_id", sid).eq("case_id", c.id).single();
      if (!p) return reply(404, { error: "no_payment" });
      // where the client goes next: option 3 (or a top-up to it) → identity check; a £19 link after a call → Eduard prepares it
      let target = p.product === "option3_topup" ? "option3" : String(p.product);
      if (p.payment_link_id) {
        const { data: lk } = await db.from("payment_links").select("target").eq("id", p.payment_link_id).maybeSingle();
        target = String(lk?.target ?? target);
      }
      const next = target === "option3" ? "id" : target === "appointment" ? "slots" : p.payment_link_id ? "done" : "review";
      if (p.status === "paid") return reply(200, { paid: true, product: target, next });
      const s = await stripe(`checkout/sessions/${sid}`);
      if (s.payment_status !== "paid") return reply(200, { paid: false, status: s.status });
      const now = new Date().toISOString();
      // Long-term customer record (kept 6 years): name, email, phone, marketing consent.
      let customerId = c.customer_id as string | null;
      if (!customerId) {
        const consent = d.marketing_consent === true;
        const { data: cu } = await db.from("customers").insert({
          full_name: String(d.full_name ?? ""), email: String(d.email ?? (s.customer_details as Obj)?.email ?? ""),
          phone: (d.phone as string) ?? null, marketing_consent: consent, marketing_consent_at: consent ? now : null,
        }).select("id").single();
        customerId = cu?.id ?? null;
      }
      await db.from("payments").update({ status: "paid", paid_at: now, stripe_payment_intent: String(s.payment_intent ?? ""), customer_id: customerId }).eq("id", p.id);
      const upd: Obj = { customer_id: customerId, status: target === "option3" || target === "appointment" || p.payment_link_id ? "in_review" : "paid" };
      if (p.payment_link_id) upd.product = target;
      if (target === "option3") upd.delete_after = null;     // Option 3 records are kept (AAT period)
      await db.from("cases").update(upd).eq("id", c.id);
      if (p.payment_link_id) await db.from("payment_links").update({ used_at: now }).eq("id", p.payment_link_id);
      await db.from("audit_log").insert({ actor: "stripe", action: "payment_confirmed", case_id: c.id, detail: { product: p.product, mode: mode() } });
      await funnel(body.visit_id, "paid", c, String(p.product));
      return reply(200, { paid: true, product: target, next });
    }

    return reply(400, { error: "action" });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    await db.from("audit_log").insert({ actor: "system", action: "payments_error", case_id: c.id, detail: { action: body.action, error: msg.slice(0, 300) } });
    return reply(msg === "not_configured" ? 503 : 502, { error: msg === "not_configured" ? "not_configured" : "server" });
  }
});
