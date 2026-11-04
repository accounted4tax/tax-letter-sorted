// drive-sync: copies the records of clients who needed Eduard's input into his Google Drive
// (Client register sheet + Client files/<ref> – <name>/01 Onboarding, 02 Documents, 03 ID).
// Only what is new is sent: every item copied is remembered in drive_sync_items, so a second run adds
// only new rows (new payment, new quote, changed phone number…) and new files. Nothing is overwritten.
// Called every 15 minutes by pg_cron, and by the admin page ("Copy to Google Drive now"), with x-cron-secret.
// Secrets (Supabase → Edge Functions → Secrets): GDRIVE_URL (the Apps Script web app address), GDRIVE_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
type Obj = Record<string, unknown>;

const TYPE: Record<string, string> = {
  "sa-late-filing-100": "SA late filing penalty £100", "sa-late-filing-later": "SA late filing penalty (daily / 6 / 12 months)",
  "sa-late-payment": "SA late payment penalty", "ct-late-filing": "Corporation Tax late filing penalty",
  "companies-house-late-filing": "Companies House late filing penalty", "companies-house-strike-off": "Companies House strike-off",
  "vat-late-submission": "VAT late submission penalty", "paye-employer-penalty": "PAYE late filing penalty",
  "cis-late-return": "CIS late return penalty", "sa-statement": "SA statement / Debt Management",
};
const PRODUCT: Record<string, string> = {
  option2: "£19 self-serve", option3: "Accountant review", option3_topup: "Top-up to accountant review", appointment: "£59 appointment", call: "Call",
};
const ID_KIND: Record<string, string> = { id_photo: "Photo ID", id_selfie: "Selfie holding photo ID", id_address: "Proof of address", incorporation_cert: "Certificate of incorporation" };
const EMAIL_TYPE: Record<string, string> = { appeal_pdf: "Appeal emailed", hmrc_code_request: "HMRC code email", id_request: "ID upload link emailed", id_reminder: "ID reminder emailed" };

const fmt = (iso: unknown) => !iso ? "" : new Date(String(iso).length === 10 ? String(iso) + "T12:00:00Z" : String(iso))
  .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/London" });
const time = (iso: unknown) => !iso ? "" : new Date(String(iso)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const money = (p: unknown) => "£" + (Number(p ?? 0) / 100).toFixed(2);
async function hash(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].slice(0, 6).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function b64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const safe = (s: string) => s.replace(/[\/\\:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);

async function post(payload: Obj) {
  const url = Deno.env.get("GDRIVE_URL"), secret = Deno.env.get("GDRIVE_SECRET");
  if (!url || !secret) throw new Error("not_configured");
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret }), redirect: "follow" });
  const txt = await r.text();
  let j: Obj; try { j = JSON.parse(txt); } catch { throw new Error("drive_reply:" + txt.slice(0, 120)); }
  if (j.error) throw new Error("drive:" + j.error);
  return j;
}

// English labels from the website's language file (reasons, evidence)
let EN: Obj | null = null;
async function en() {
  if (EN) return EN;
  try { const r = await fetch("https://taxletters.accounted4tax.co.uk/lang/en.json"); EN = r.ok ? await r.json() : {}; } catch { EN = {}; }
  return EN!;
}
const month = (v: unknown) => /^\d{4}-\d{2}$/.test(String(v ?? "")) ? new Date(String(v) + "-15T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }) : fmt(v);

// ---------- one case ----------
async function syncCase(c: Obj) {
  const ref = String(c.ref), d = (c.details ?? {}) as Obj;
  const { data: doneRows } = await db.from("drive_sync_items").select("item_key").like("item_key", ref + ":%");
  const done = new Set((doneRows ?? []).map((x) => x.item_key as string));
  const newKeys: string[] = [];
  const isNew = (k: string) => !done.has(ref + ":" + k);
  const mark = (k: string) => newKeys.push(ref + ":" + k);
  const sections: Record<string, string[][]> = {};
  const add = (sec: string, date: unknown, item: string, details: string, key: string) => {
    if (!isNew(key)) return;
    (sections[sec] ??= []).push([fmt(date) || fmt(new Date().toISOString()), item, details]); mark(key);
  };

  const name = String(d.business_name ?? d.company_name ?? d.full_name ?? "").trim();
  const folderName = safe(ref + (name ? " – " + name : ""));

  // Case and client: each field once; if its value changes later, a "(changed)" row is added
  const company = d.business_type === "company" || ["ct-late-filing", "companies-house-late-filing", "companies-house-strike-off"].includes(String(c.letter_type));
  const fields: [string, string][] = [
    ["Case", ref],
    ["Letter", (TYPE[String(c.letter_type)] ?? String(c.letter_type ?? "")) + (c.penalty_amount ? " – £" + Number(c.penalty_amount).toFixed(2) : "") + (c.tax_year ? " (" + c.tax_year + ")" : "")],
    ["Notice date / appeal deadline", [fmt(c.notice_date), fmt(c.appeal_deadline)].filter(Boolean).join(" / ")],
    ["Client", company ? "" : String(d.full_name ?? "")],
    ["Business", [d.business_name ?? d.company_name, d.business_type ? (d.business_type === "company" ? "limited company" : "sole trader") : (company ? "limited company" : ""), d.company_number ? "company number " + d.company_number : ""].filter(Boolean).join(" · ")],
    ["Address", [...((d.address_lines as string[]) ?? []), d.postcode].filter(Boolean).join(", ")],
    ["Phone / email", company ? "" : [d.phone, d.email].filter(Boolean).join(" · ")],
    ["Home address (ID check)", company ? "" : String(d.person_address ?? "")],
    ["Date of birth", company || !d.person_dob ? "" : fmt(d.person_dob)],
    ["UTR", String(d.utr ?? c.utr ?? "")],
    ["NI number", String(d.ni_number ?? "")],
    ["VAT", [d.vat_number, d.vat_registration_date ? "registered " + fmt(d.vat_registration_date) : "", d.vat_returns_up_to_date ? "returns up to date: " + d.vat_returns_up_to_date : ""].filter(Boolean).join(" · ")],
    ["PAYE / Accounts Office ref", [d.paye_ref, d.accounts_office_ref].filter(Boolean).join(" · ")],
    ["Language", c.language === "ro" ? "Romanian" : "English"],
    ["Marketing consent", d.marketing_consent ? "Yes" : "No"],
  ];
  for (const [item, val] of fields) {
    if (!val) continue;
    const k = "cc:" + item + ":" + await hash(val);
    const seenBefore = [...done].some((x) => x.startsWith(ref + ":cc:" + item + ":"));
    add("Case and client", seenBefore ? new Date().toISOString() : c.created_at, seenBefore ? item + " (changed)" : item, val, k);
  }

  // Director (limited companies): name, role, contact; home address is on the proof of address in 03 ID
  if (company) {
    const dir: [string, string][] = [
      ["Name", String(d.full_name ?? c.authority_name ?? "")],
      ["Role", String(d.role ?? "Director")],
      ["Phone / email", [d.phone, d.email].filter(Boolean).join(" · ")],
      ["Home address", String(d.person_address ?? "")],
      ["Date of birth", d.person_dob ? fmt(d.person_dob) : ""],
    ];
    for (const [item, val] of dir) {
      if (!val) continue;
      const k = "dir:" + item + ":" + await hash(val);
      const seenBefore = [...done].some((x) => x.startsWith(ref + ":dir:" + item + ":"));
      add("Director", seenBefore ? new Date().toISOString() : c.created_at, seenBefore ? item + " (changed)" : item, val, k);
    }
  }

  // Service and payment
  if (c.product) add("Service and payment", c.details_saved_at ?? c.created_at, "Option", PRODUCT[String(c.product)] ?? String(c.product), "svc:" + c.product);
  const { data: pays } = await db.from("payments").select("id, product, amount_pence, stripe_payment_intent, stripe_session_id, paid_at, stripe_mode, payment_link_id")
    .eq("case_id", c.id).eq("status", "paid").order("paid_at");
  const { data: links } = await db.from("payment_links").select("id, label, amount_pence, created_at, sent_to").eq("case_id", c.id).order("created_at");
  for (const l of links ?? []) add("Service and payment", l.created_at, "Payment link sent", `${money(l.amount_pence)} – ${l.label ?? ""} (to ${l.sent_to ?? "-"})`, "link:" + l.id);
  const payRows: string[][] = [];
  for (const p of pays ?? []) {
    const label = (links ?? []).find((l) => l.id === p.payment_link_id)?.label ?? PRODUCT[String(p.product)] ?? String(p.product);
    const sref = String(p.stripe_payment_intent ?? p.stripe_session_id ?? "");
    if (isNew("pay:" + p.id)) payRows.push([fmt(p.paid_at), ref, name, label, (Number(p.amount_pence) / 100).toFixed(2), sref, String(p.stripe_mode ?? "")]);
    add("Service and payment", p.paid_at, "Paid", `${money(p.amount_pence)} – ${label}${sref ? " · Stripe " + sref : ""}${p.stripe_mode === "test" ? " (test)" : ""}`, "pay:" + p.id);
  }
  const { data: quotes } = await db.from("help_requests").select("id, note, created_at, status").eq("tax_year", "package").ilike("note", `%Case: ${ref}%`).order("created_at");
  const quoteRows: string[][] = [];
  for (const q of quotes ?? []) {
    const note = String(q.note ?? "");
    const work = (/^\[([^\]]+)\]/.exec(note)?.[1] ?? "Quote").replace(/ \[prepared by Eduard\]/, "");
    const one = /ESTIMATE £([\d,.]+)/.exec(note)?.[1] ?? "";
    const mon = /MONTHLY FROM NOW £([\d,.]+) x (\d+)/.exec(note);
    if (isNew("quote:" + q.id)) quoteRows.push([fmt(q.created_at), ref, name, work, one, mon?.[1] ?? "", mon?.[2] ?? "", String(q.status ?? ""), "Case"]);
    add("Service and payment", q.created_at, "Quote", [work, one ? "£" + one : "", mon ? `then £${mon[1]} a month × ${mon[2]}` : ""].filter(Boolean).join(" – "), "quote:" + q.id);
  }

  // Client's answers (only the facts the client confirmed)
  const { data: ans } = await db.from("case_answers").select("answers, answers_english, updated_at").eq("case_id", c.id).maybeSingle();
  if (ans && c.facts_confirmed_at) {
    const a = (ans.answers ?? {}) as Obj, ae = (ans.answers_english ?? {}) as Obj, eng = (ae.texts ?? {}) as Obj;
    const L = await en(), rid = String(ae.reason ?? a.reason ?? "");
    const reasonLabel = String(((L.reason ?? {}) as Obj)[rid] ?? rid.replace(/_/g, " "));
    const evLabels = ((L.q ?? {}) as Obj).evidence_opt as Obj ?? {};
    const items: [string, string][] = [
      ["Reason chosen", reasonLabel],
      ["Dates", [a.date_from, a.date_to].filter(Boolean).map(month).join(" to ")],
      ["Filed / paid", a.filed_date ? fmt(a.filed_date) + (a.filed_asap === "yes" ? " (as soon as able)" : "") : ""],
      ["Client wrote", String(a.story ?? "")],
      ["English (confirmed)", String(eng.story ?? "")],
      ["Why late (appeal)", String(eng.why_late ?? "")],
      ["Evidence held", ((a.evidence as string[]) ?? []).map((k) => String(evLabels[k] ?? k.replace(/_/g, " "))).join(", ")],
    ];
    // the key uses the raw answer, so a change of wording on the website never adds a duplicate row
    const raw: Record<string, string> = { "Reason chosen": rid, "Dates": [a.date_from, a.date_to].filter(Boolean).join(" to "), "Evidence held": ((a.evidence as string[]) ?? []).join(",") };
    for (const [item, val] of items) if (val) add("Client's answers", c.facts_confirmed_at, item, val, "ans:" + item + ":" + await hash(raw[item] ?? val));
  }

  // Identity check (AML) and agent steps
  const { data: files } = await db.from("case_files").select("id, kind, doc_type, sha256, storage_path, created_at").eq("case_id", c.id).is("deleted_at", null).order("created_at");
  for (const f of files ?? []) if (ID_KIND[f.kind]) add("Identity check (AML)", f.created_at, ID_KIND[f.kind], `${String(f.doc_type ?? "received").replace(/_/g, " ")} (file in 03 ID)`, "idf:" + f.id);
  if (c.authority_to_act_at) add("Identity check (AML)", c.authority_to_act_at, "Director's instruction", `Ticked by ${c.authority_name ?? "-"} at ${time(c.authority_to_act_at)} (${c.authority_version ?? ""})`, "auth:" + c.authority_to_act_at);
  if (c.id_completed_at) add("Identity check (AML)", c.id_completed_at, "ID check completed", time(c.id_completed_at), "idc:" + c.id_completed_at);
  if (c.hmrc_code_requested_at) add("Appeal, agent and emails", c.hmrc_code_requested_at, c.letter_type === "vat-late-submission" ? "ASA link sent" : "Agent code requested", "", "hcr:" + c.hmrc_code_requested_at);
  if (c.hmrc_code_at) add("Appeal, agent and emails", c.hmrc_code_at, "HMRC code received", "From the client (the code itself is not copied)", "hc:" + c.hmrc_code_at);
  if (c.approved_at) add("Appeal, agent and emails", c.approved_at, "Appeal approved by client", time(c.approved_at), "appr:" + c.approved_at);
  const { data: calls } = await db.from("review_contacts").select("id, method, phone, email, confirmed_at, confirmed_slot, created_at").eq("case_id", c.id);
  for (const r of calls ?? []) {
    add("Appeal, agent and emails", r.created_at, "Contact preference", r.method === "phone" ? `Phone ${r.phone ?? ""}` : `Email ${r.email ?? ""}`, "rc:" + r.id);
    if (r.confirmed_at) add("Appeal, agent and emails", r.confirmed_at, "Call confirmed", String(r.confirmed_slot ?? ""), "rcc:" + r.id);
  }
  const { data: emails } = await db.from("email_log").select("id, email_type, recipient, sent_at, status, pdf_sha256").eq("case_id", c.id)
    .lt("sent_at", new Date(Date.now() - 15 * 60e3).toISOString()).order("sent_at");
  for (const e of emails ?? []) {
    if (e.recipient === "info@mytacs.co.uk" || e.recipient === "info@accounted4tax.co.uk") continue;   // alerts to Eduard
    add("Appeal, agent and emails", e.sent_at, EMAIL_TYPE[String(e.email_type)] ?? "Email sent", `To ${e.recipient} – ${e.status}${e.pdf_sha256 ? " · fingerprint " + String(e.pdf_sha256).slice(0, 12) : ""}`, "em:" + e.id);
  }
  // Documents copied (listed in the record too)
  for (const f of files ?? []) if (f.kind === "letter" || f.kind === "appeal_pdf") {
    add("Appeal, agent and emails", f.created_at, f.kind === "letter" ? "HMRC letter uploaded" : "Appeal PDF prepared", `(file in 02 Documents)${f.sha256 ? " · fingerprint " + String(f.sha256).slice(0, 12) : ""}`, "doc:" + f.id);
  }

  // Client register row
  const service = [PRODUCT[String(c.product)] ?? c.product, ...(quotes ?? []).map((q) => (/^\[([^\]]+)\]/.exec(String(q.note))?.[1] ?? "").replace(/ \[prepared by Eduard\]/, ""))].filter(Boolean).join("; ");
  const clientRow = [ref, fmt(c.created_at), String(d.full_name ?? ""), String(d.business_name ?? d.company_name ?? ""),
    d.business_type ? (d.business_type === "company" ? "Ltd" : "Sole trader") : (company ? "Ltd" : (d.full_name ? "Individual" : "")),
    String(d.company_number ?? ""), String(d.email ?? ""), String(d.phone ?? ""), [...((d.address_lines as string[]) ?? []), d.postcode].filter(Boolean).join(", "),
    String(d.utr ?? c.utr ?? ""), String(d.vat_number ?? ""), String(d.paye_ref ?? ""), String(d.accounts_office_ref ?? ""),
    TYPE[String(c.letter_type)] ?? String(c.letter_type ?? ""), service, String(c.status ?? "").replace(/_/g, " "), fmt(c.id_completed_at)];

  // 1) the record + register, 2) each new file on its own (keeps each request small)
  const anything = Object.keys(sections).length || payRows.length || quoteRows.length;
  const fileQueue = (files ?? []).filter((f) => isNew("file:" + f.id) && (f.kind === "letter" || f.kind === "appeal_pdf" || ID_KIND[f.kind]));
  if (!anything && !fileQueue.length) return { ref, added: 0, files: 0 };
  const title = name || ref;
  await post({ action: "case", ref, folder_name: folderName, title, company, client_row: clientRow, sections, quotes: quoteRows, payments: payRows });
  if (newKeys.length) await db.from("drive_sync_items").upsert(newKeys.map((k) => ({ item_key: k, case_id: c.id })), { onConflict: "item_key" });

  let copied = 0;
  for (const f of fileQueue) {
    const [bucket, ...rest] = String(f.storage_path).split("/");
    const dl = await db.storage.from(bucket).download(rest.join("/"));
    if (dl.error || !dl.data) continue;
    const bytes = new Uint8Array(await dl.data.arrayBuffer());
    const mime = dl.data.type || "application/octet-stream";
    const ext = mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime.startsWith("image/") ? "jpg" : (rest.join("/").split(".").pop() ?? "bin");
    const label = f.kind === "letter" ? "HMRC letter" : f.kind === "appeal_pdf" ? "Appeal" : ID_KIND[f.kind] + (f.doc_type ? " – " + String(f.doc_type).replace(/_/g, " ") : "");
    const fname = safe(`${new Date(String(f.created_at)).toISOString().slice(0, 10)} ${label} ${String(f.sha256 ?? f.id).slice(0, 6)}`) + "." + ext;
    await post({ action: "file", ref, folder_name: folderName, sub: ID_KIND[f.kind] ? "03 ID" : "02 Documents", name: fname, mime, base64: b64(bytes), sha256: f.sha256 ?? "" });
    await db.from("drive_sync_items").upsert({ item_key: ref + ":file:" + f.id, case_id: c.id }, { onConflict: "item_key" });
    copied++;
  }
  await db.from("audit_log").insert({ actor: "system", action: "drive_synced", case_id: c.id, detail: { rows: newKeys.length, files: copied } });
  return { ref, added: newKeys.length, files: copied };
}

// Quote and service requests from the website that never became a case: Quotes tab only
async function syncLooseQuotes() {
  const { data: qs } = await db.from("help_requests").select("id, full_name, note, created_at, status").eq("tax_year", "package").not("note", "ilike", "%Case: TLS-%").order("created_at").limit(100);
  const { data: doneRows } = await db.from("drive_sync_items").select("item_key").like("item_key", "hr:%");
  const done = new Set((doneRows ?? []).map((x) => x.item_key as string));
  let n = 0;
  for (const q of qs ?? []) {
    if (done.has("hr:" + q.id)) continue;
    const note = String(q.note ?? "");
    const work = /^\[([^\]]+)\]/.exec(note)?.[1] ?? "Quote request";
    const one = /ESTIMATE £([\d,.]+)/.exec(note)?.[1] ?? "";
    const mon = /MONTHLY FROM NOW £([\d,.]+) x (\d+)/.exec(note) ?? /ESTIMATE £([\d,.]+) per month/.exec(note);
    await post({ action: "quote", row: [fmt(q.created_at), "", String(q.full_name ?? ""), work, /per month/.test(note) ? "" : one, mon?.[1] ?? "", mon?.[2] ?? "", String(q.status ?? ""), "Website request"] });
    await db.from("drive_sync_items").upsert({ item_key: "hr:" + q.id, case_id: null }, { onConflict: "item_key" });
    n++;
  }
  return n;
}

Deno.serve(async (req) => {
  const { data: settings } = await db.from("app_settings").select("cron_secret").eq("id", 1).single();
  if (!settings?.cron_secret || (req.headers.get("x-cron-secret") ?? "") !== settings.cron_secret) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  if (!Deno.env.get("GDRIVE_URL") || !Deno.env.get("GDRIVE_SECRET")) return new Response(JSON.stringify({ error: "not_configured" }), { status: 200 });
  let body: Obj = {};
  try { body = await req.json(); } catch { /* cron sends {} */ }

  try {
    if (body.action === "ping") return new Response(JSON.stringify(await post({ action: "ping" })), { status: 200 });
    // clients who needed Eduard's input: paid, not the £19 self-serve product
    let q = db.from("cases").select("id, ref, created_at, language, letter_type, product, status, tax_year, notice_date, appeal_deadline, penalty_amount, utr, details, details_saved_at, facts_confirmed_at, approved_at, id_completed_at, authority_to_act_at, authority_name, authority_version, hmrc_code_at, hmrc_code_requested_at")
      .is("data_deleted_at", null).neq("product", "option2").not("product", "is", null).order("created_at", { ascending: false }).limit(200);
    if (body.ref) q = q.eq("ref", String(body.ref));
    const { data: cases } = await q;
    const ids = (cases ?? []).map((c) => c.id);
    const { data: paid } = ids.length ? await db.from("payments").select("case_id").eq("status", "paid").in("case_id", ids) : { data: [] };
    const paidSet = new Set((paid ?? []).map((p) => p.case_id));
    const results: Obj[] = [];
    for (const c of (cases ?? []).filter((c) => paidSet.has(c.id) || body.ref)) {
      try { results.push(await syncCase(c as Obj)); }
      catch (e) { results.push({ ref: c.ref, error: String((e as Error).message ?? e).slice(0, 200) }); }
    }
    const loose = body.ref ? 0 : await syncLooseQuotes().catch(() => 0);
    return new Response(JSON.stringify({ ok: true, cases: results.filter((r) => r.added || r.files || r.error), loose_quotes: loose }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e).slice(0, 300) }), { status: 502 });
  }
});
