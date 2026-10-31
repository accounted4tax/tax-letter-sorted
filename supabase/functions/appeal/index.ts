// appeal: everything from "Your details" to the approved PDF, server side.
//   get           – what the details screen needs (pre-filled from the letter)
//   save_details  – stores name, address, phone, company details; chooses Option 2 or 3
//   build         – fills the SA370 (Self Assessment) or writes the appeal letter (CT, Companies House),
//                   stores it privately and returns a short-lived link to view it
//   approve       – the client approves the exact PDF (checked by its SHA-256 fingerprint)
// Building needs a paid case, or the private preview code while the site is not live.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as PDFLib from "npm:pdf-lib@1.17.1";
import { fillSA370, sa370Row } from "./sa370-fill.js";
import { buildLetter } from "./letter-fill.js";
import { composeAppeal } from "./appeal-text.js";

const SITE = "https://accounted4tax.github.io/tax-letter-sorted";
const APPEAL_ROUTES = ["appeal", "choice", "hmrc_check_first"];
const SA_TYPES = ["sa-late-filing-100", "sa-late-filing-later", "sa-late-payment"];
const COMPANY_TYPES = ["ct-late-filing", "companies-house-late-filing"];

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

type Obj = Record<string, unknown>;
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

async function sha256(b: Uint8Array) {
  const h = await crypto.subtle.digest("SHA-256", b as BufferSource);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function funnel(visitId: unknown, step: string, c: Obj, detail?: string) {
  if (typeof visitId === "string" && /^[0-9a-f-]{36}$/i.test(visitId)) {
    await db.from("funnel_events").insert({ visit_id: visitId, step, letter_type: c.letter_type ?? null, language: c.language ?? null, detail: detail ?? null });
  }
}
let templateCache: { pdf: Uint8Array; map: Obj } | null = null;
async function sa370Template() {
  if (templateCache) return templateCache;
  const [p, m] = await Promise.all([fetch(`${SITE}/forms/SA370.pdf`), fetch(`${SITE}/forms/sa370-map.json`)]);
  if (!p.ok || !m.ok) throw new Error("template");
  templateCache = { pdf: new Uint8Array(await p.arrayBuffer()), map: await m.json() };
  return templateCache;
}
async function rules(id: string): Promise<Obj | null> {
  const r = await fetch(`${SITE}/rules/${id}.json`);
  return r.ok ? await r.json() : null;
}

// ---------- validation of the details form ----------
function cleanDetails(c: Obj, d: Obj) {
  const t = String(c.letter_type);
  const company = COMPANY_TYPES.includes(t);
  const out: Obj = {
    full_name: str(d.full_name, 120),
    address_lines: (Array.isArray(d.address_lines) ? d.address_lines : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 4),
    postcode: str(d.postcode, 10).toUpperCase(),
    phone: str(d.phone, 30),
    email: str(d.email, 200).toLowerCase(),
  };
  const errors: string[] = [];
  if (String(out.full_name).length < 2) errors.push("full_name");
  if (!(out.address_lines as string[]).length) errors.push("address_lines");
  if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(String(out.postcode))) errors.push("postcode");
  if (!/^[+\d][\d\s()-]{8,}$/.test(String(out.phone))) errors.push("phone");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(out.email))) errors.push("email");
  if (SA_TYPES.includes(t)) {
    out.utr = str(d.utr, 13).replace(/\s/g, "").toUpperCase();
    if (!/^\d{10}K?$/.test(String(out.utr))) errors.push("utr");
    const ni = str(d.ni_number, 13).replace(/\s/g, "").toUpperCase();
    if (ni && !/^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/.test(ni)) errors.push("ni_number");
    out.ni_number = ni || null;
  }
  if (company) {
    out.company_name = str(d.company_name, 160).toUpperCase();
    out.company_number = str(d.company_number, 10).replace(/\s/g, "").toUpperCase();
    out.role = d.role === "secretary" ? "Company Secretary" : "Director";
    out.penalty_reference = str(d.penalty_reference, 40) || null;
    out.utr = str(d.utr, 13).replace(/\s/g, "") || null;           // CT UTR, optional
    if (String(out.company_name).length < 2) errors.push("company_name");
    if (!/^(\d{8}|[A-Z]{2}\d{6})$/.test(String(out.company_number))) errors.push("company_number");
  }
  return { out, errors };
}

// ---------- the PDF ----------
async function buildPdf(c: Obj) {
  const t = String(c.letter_type);
  const ext = (c.extracted ?? {}) as Obj;
  const d = (c.details ?? {}) as Obj;
  const { data: ans } = await db.from("case_answers").select("answers, answers_english").eq("case_id", c.id).single();
  const a = (ans?.answers ?? {}) as Obj;
  const ae = (ans?.answers_english ?? {}) as Obj;
  const eng = (ae.texts ?? {}) as Record<string, string>;
  const penalties = ((ext.penalties ?? []) as Obj[]).filter((p) => p && (p.amount != null || p.description));
  const reason = String(ae.reason ?? a.reason ?? "");

  const text = composeAppeal({
    letter_type: t, reason, tax_year: c.tax_year ?? ext.tax_year, penalty_count: Math.max(1, penalties.length),
    story: eng.story, why_late: eng.why_late, nnf_other_text: eng.nnf_other_text, something_else_text: eng.something_else_text,
    date_from: a.date_from, date_to: a.date_to, filed_date: a.filed_date, filed_asap: a.filed_asap, evidence: a.evidence ?? [],
  });

  if (SA_TYPES.includes(t)) {
    const { pdf, map } = await sa370Template();
    const notice = String(c.notice_date ?? ext.letter_date ?? "");
    const rows: Record<string, Obj> = {};
    if (!penalties.length) {
      rows[t === "sa-late-payment" ? "payment_30d" : "filing_1day"] = { amount: c.penalty_amount, date: notice };
    }
    for (const p of penalties) {
      const row = sa370Row(String(p.description ?? ""), t);
      const prev = rows[row];
      rows[row] = { amount: Number(prev?.amount ?? 0) + Number(p.amount ?? 0), date: notice };
    }
    const m = /^(\d{4})-(\d{2})$/.exec(String(c.tax_year ?? ext.tax_year ?? ""));
    const bytes = await fillSA370(PDFLib, pdf, map, {
      tax_reference: d.utr, full_name: d.full_name, address_lines: d.address_lines, postcode: d.postcode,
      ni_number: d.ni_number, phone: d.phone, tax_year_end: m ? m[1].slice(0, 2) + m[2] : "",
      penalties: rows, reason_tick: (map.reason_to_tick as Obj)[reason] ?? "other", description: text,
    });
    return { bytes: new Uint8Array(bytes), kind: "sa370", send: { how: "post", to: String(map.send_to) } };
  }

  // Company penalties: an appeal letter
  const ch = t === "companies-house-late-filing";
  const r = await rules(t);
  const out = (r?.appeal_output ?? {}) as Obj;
  const to = ch
    ? ["Companies House", "Late Filing Penalties", "By email: enquiries@companieshouse.gov.uk"]
    : String(out.post_to ?? "Corporation Tax Services, HM Revenue and Customs, BX9 1AX").split(", ");
  const refs = [`Company: ${d.company_name} (company number ${d.company_number})`];
  if (d.penalty_reference) refs.push(`Penalty reference: ${d.penalty_reference}`);
  if (!ch && d.utr) refs.push(`Corporation Tax reference (UTR): ${d.utr}`);
  if (ext.period) refs.push(`${ch ? "Accounts made up to" : "Accounting period"}: ${ext.period}`);
  if (c.notice_date) refs.push(`Penalty notice dated: ${new Date(String(c.notice_date) + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`);
  if (c.penalty_amount) refs.push(`Penalty amount: £${Number(c.penalty_amount).toFixed(2)}`);
  const bytes = await buildLetter(PDFLib, {
    from_lines: [String(d.company_name), ...(d.address_lines as string[]), String(d.postcode)],
    contact: [d.phone, d.email].filter(Boolean).join(" · "),
    date: new Date().toISOString().slice(0, 10), to_lines: to,
    subject: "Appeal against late filing penalty", ref_lines: refs, body: text,
    signer: String(d.full_name), signer_role: String(d.role ?? "Director"),
  });
  return { bytes: new Uint8Array(bytes), kind: "letter",
    send: ch ? { how: "email", to: "enquiries@companieshouse.gov.uk" } : { how: "post", to: to.join(", ") } };
}

async function signedUrl(path: string, seconds = 900) {
  const { data } = await db.storage.from("appeals").createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

// ---------- entry point ----------
Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("*").eq("id", 1).single();
  const origin = req.headers.get("origin") ?? "";
  const okOrigin = (settings?.allowed_origins ?? []).includes(origin) || origin.startsWith("http://localhost");
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? origin : "https://accounted4tax.github.io",
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

  const token = String(body.case ?? "");
  if (!/^[0-9a-f]{40,80}$/.test(token)) return reply(400, { error: "bad_request" });
  const { data: c } = await db.from("cases")
    .select("id, ref, language, status, product, letter_type, outcome_route, facts_confirmed_at, notice_date, appeal_deadline, penalty_amount, tax_year, extracted, utr, details, details_saved_at, approved_at, data_deleted_at")
    .eq("private_token", token).single();
  if (!c || c.data_deleted_at) return reply(404, { error: "not_found" });
  const ext = (c.extracted ?? {}) as Obj;

  try {
    if (body.action === "get") {
      const conf = (ext.confirmed ?? {}) as Obj;
      return reply(200, {
        ref: c.ref, letter_type: c.letter_type, outcome_route: c.outcome_route, product: c.product,
        appeal_deadline: c.appeal_deadline, can_continue: !!c.facts_confirmed_at && APPEAL_ROUTES.includes(String(c.outcome_route)),
        details: c.details ?? null,
        prefill: { full_name: conf.name_on_letter ?? ext.name_on_letter ?? null, utr: c.utr ?? ext.utr ?? null,
          company_name: conf.company_name ?? ext.company_name ?? null, company_number: ext.company_number ?? null },
      });
    }

    if (body.action === "save_details") {
      if (!c.facts_confirmed_at || !APPEAL_ROUTES.includes(String(c.outcome_route))) return reply(400, { error: "not_ready" });
      const product = body.product === "option3" ? "option3" : "option2";
      const { out, errors } = cleanDetails(c, (body.details ?? {}) as Obj);
      if (errors.length) return reply(400, { error: "invalid", fields: errors });
      await db.from("cases").update({
        details: out, details_saved_at: new Date().toISOString(), product, status: "awaiting_payment",
        address: [...(out.address_lines as string[]), out.postcode].join(", "),
        ni_number: out.ni_number ?? null, utr: out.utr ?? c.utr ?? null,
      }).eq("id", c.id);
      await funnel(body.visit_id, "option_chosen", c, product);
      await db.from("audit_log").insert({ actor: "system", action: "details_saved", case_id: c.id, detail: { product } });
      return reply(200, { ok: true, product, needs_payment: !preview });
    }

    if (body.action === "build" || body.action === "approve" || body.action === "download") {
      if (!c.details_saved_at) return reply(400, { error: "no_details" });
      if (!preview) {
        const { data: paid } = await db.from("payments").select("id").eq("case_id", c.id).eq("status", "paid").limit(1);
        if (!paid?.length) return reply(402, { error: "not_paid" });
      }
    }

    if (body.action === "build") {
      const { bytes, kind, send } = await buildPdf(c as Obj);
      const hash = await sha256(bytes);
      const path = `${c.id}/appeal-${hash.slice(0, 12)}.pdf`;
      const up = await db.storage.from("appeals").upload(path, bytes, { contentType: "application/pdf", upsert: true });
      if (up.error) throw new Error("storage:" + up.error.message);
      await db.from("case_files").update({ deleted_at: new Date().toISOString() }).eq("case_id", c.id).eq("kind", "appeal_pdf").is("deleted_at", null);
      await db.from("case_files").insert({ case_id: c.id, kind: "appeal_pdf", storage_path: `appeals/${path}`, sha256: hash });
      await db.from("cases").update({ pdf_built_at: new Date().toISOString(), approved_at: null }).eq("id", c.id);
      await db.from("audit_log").insert({ actor: "system", action: "appeal_pdf_built", case_id: c.id, detail: { kind, sha256: hash, bytes: bytes.length } });
      return reply(200, { url: await signedUrl(path), sha256: hash, kind, send, product: c.product, ref: c.ref, preview });
    }

    if (body.action === "approve" || body.action === "download") {
      const { data: f } = await db.from("case_files").select("storage_path, sha256").eq("case_id", c.id)
        .eq("kind", "appeal_pdf").is("deleted_at", null).order("created_at", { ascending: false }).limit(1).single();
      if (!f) return reply(400, { error: "no_pdf" });
      const path = f.storage_path.replace(/^appeals\//, "");
      if (body.action === "approve") {
        if (body.sha256 !== f.sha256) return reply(409, { error: "changed" });
        if (body.declaration !== true) return reply(400, { error: "declaration" });
        await db.from("cases").update({ approved_at: new Date().toISOString(), status: "approved" }).eq("id", c.id);
        await db.from("audit_log").insert({ actor: "client", action: "appeal_approved", case_id: c.id, detail: { sha256: f.sha256 } });
        await funnel(body.visit_id, "approved", c);
      } else {
        await funnel(body.visit_id, "downloaded", c);
      }
      return reply(200, { url: await signedUrl(path, 3600), sha256: f.sha256 });
    }

    return reply(400, { error: "action" });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    await db.from("audit_log").insert({ actor: "system", action: "appeal_error", case_id: c.id, detail: { action: body.action, error: msg.slice(0, 300) } });
    return reply(502, { error: "server" });
  }
});
