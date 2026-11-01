// admin: Eduard's admin page (admin.html), server side.
// Sign-in: Supabase Auth (email + password). Every request carries the signed-in user's token;
// only emails listed in app_settings.admin_emails are allowed. The service key never leaves the server.
//
// Actions
//   me                       – who is signed in
//   overview                 – counts for the dashboard and the work queues
//   cases {filter}           – case list (latest 300)
//   case {ref}               – one case in full: details, answers, files, payments, emails, contact preference, history
//   file_url {file_id}       – short-lived link to a stored file (letter, ID document, appeal PDF)
//   update_case {ref, ...}   – status, notes, HMRC code requested / cleared, call slot confirmed
//   save_appeal {ref, ...}   – Eduard's details and appeal wording for the case
//   build_appeal {ref}       – builds the PDF with that wording (appeal function) and returns a preview link
//   send_appeal {ref}        – emails the approved PDF to the client (appeal function)
//   requests                 – help / quote / call-back requests;  update_request {id, status, notes}
//   emails                   – email log (latest 300), bounces flagged
//   funnel {days}            – visitors at each step
//   export {what}            – rows for CSV: customers | cases | payments | emails
//   find_person {email}      – what is held about someone;  delete_person {email, include_kept}
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const db = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
type Obj = Record<string, unknown>;
const STATUSES = ["uploaded", "explained", "questions", "outcome", "callback_requested", "awaiting_payment", "paid", "awaiting_id",
  "in_review", "awaiting_hmrc_code", "awaiting_signature", "approved", "sent", "submitted", "posted", "closed", "deleted"];
const REQUEST_STATUSES = ["new", "contacted", "client", "closed"];
const CALLBACK_STATUSES = ["new", "called", "link_sent", "no_appeal", "closed"];
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function bucketPath(p: string) { const i = p.indexOf("/"); return { bucket: p.slice(0, i), path: p.slice(i + 1) }; }
async function signed(storagePath: string, seconds = 600) {
  const { bucket, path } = bucketPath(storagePath);
  const { data } = await db.storage.from(bucket).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
async function caseByRef(ref: unknown) {
  const { data } = await db.from("cases").select("*").eq("ref", String(ref ?? "")).maybeSingle();
  return data;
}
async function callAppeal(secret: string, payload: Obj) {
  const r = await fetch(`${URL_}/functions/v1/appeal`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": secret }, body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
}
function summary(c: Obj, extra: { paid?: Obj; email?: Obj; contact?: Obj } = {}) {
  const d = (c.details ?? {}) as Obj;
  return {
    ref: c.ref, created_at: c.created_at, letter_type: c.letter_type, product: c.product, status: c.status, language: c.language,
    outcome_route: c.outcome_route, appeal_deadline: c.appeal_deadline, penalty_amount: c.penalty_amount,
    name: d.full_name ?? null, email: d.email ?? null, company: d.company_name ?? null,
    paid_pence: extra.paid?.amount_pence ?? null, paid_at: extra.paid?.paid_at ?? null,
    id_completed_at: c.id_completed_at, id_requested_at: c.id_requested_at, authority_at: c.authority_to_act_at,
    hmrc_code_at: c.hmrc_code_at, hmrc_code_requested_at: c.hmrc_code_requested_at,
    approved_at: c.approved_at, sent_at: c.sent_at, data_deleted_at: c.data_deleted_at, delete_after: c.delete_after,
    last_email: extra.email ? { type: extra.email.email_type, status: extra.email.status, at: extra.email.sent_at } : null,
    contact: extra.contact ? { method: extra.contact.method, confirmed_at: extra.contact.confirmed_at } : null,
  };
}

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

  // ---- who is asking ----
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return reply(401, { error: "signin" });
  const { data: u } = await db.auth.getUser(jwt);
  const email = (u?.user?.email ?? "").toLowerCase();
  const allowed = ((settings?.admin_emails ?? []) as string[]).map((x) => x.toLowerCase());
  if (!email) return reply(401, { error: "signin" });
  if (!allowed.includes(email)) return reply(403, { error: "not_admin" });

  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: "bad_request" }); }
  const log = (action: string, caseId: unknown, detail: Obj = {}) =>
    db.from("audit_log").insert({ actor: "admin:" + email, action, case_id: caseId ?? null, detail });

  try {
    switch (body.action) {
      case "me":
        return reply(200, { email, live: !!settings?.live, payments_test: !!settings?.payments_test });

      case "overview": {
        const { data: cs } = await db.from("cases")
          .select("id, ref, product, status, letter_type, appeal_deadline, id_completed_at, id_requested_at, hmrc_code_at, hmrc_code_requested_at, sent_at, data_deleted_at, details")
          .in("product", ["option2", "option3"]).is("data_deleted_at", null).order("created_at", { ascending: false }).limit(500);
        const ids = (cs ?? []).map((c) => c.id);
        const { data: paid } = ids.length ? await db.from("payments").select("case_id, amount_pence, paid_at").eq("status", "paid").in("case_id", ids) : { data: [] };
        const paidSet = new Set((paid ?? []).map((p) => p.case_id));
        const { data: contacts } = ids.length ? await db.from("review_contacts").select("case_id, method, confirmed_at, availability, phone, email, note").in("case_id", ids) : { data: [] };
        const queue = (cs ?? []).filter((c) => c.product === "option3" && paidSet.has(c.id) && !["sent", "submitted", "posted", "closed"].includes(c.status));
        const company = (t: string) => t === "ct-late-filing" || t === "companies-house-late-filing";
        const q = queue.map((c) => {
          const rc = (contacts ?? []).find((x) => x.case_id === c.id);
          const todo: string[] = [];
          if (!c.id_completed_at) todo.push(c.id_requested_at ? "waiting_for_id" : "id_not_started");
          if (company(c.letter_type) && rc && rc.method === "phone" && !rc.confirmed_at) todo.push("confirm_call");
          if (c.letter_type === "ct-late-filing" && c.id_completed_at && !c.hmrc_code_requested_at) todo.push("request_hmrc_code");
          if (c.hmrc_code_at) todo.push("hmrc_code_received");
          if (c.id_completed_at) todo.push("write_appeal");
          return { ref: c.ref, letter_type: c.letter_type, status: c.status, appeal_deadline: c.appeal_deadline,
            name: (c.details as Obj)?.full_name ?? null, company: (c.details as Obj)?.company_name ?? null, todo,
            contact: rc ? { method: rc.method, confirmed_at: rc.confirmed_at, phone: rc.phone, email: rc.email, availability: rc.availability, note: rc.note } : null };
        }).sort((a, b) => String(a.appeal_deadline ?? "9999").localeCompare(String(b.appeal_deadline ?? "9999")));
        const { count: newRequests } = await db.from("help_requests").select("id", { count: "exact", head: true }).eq("status", "new");
        const { count: newCallbacks } = await db.from("callbacks").select("id", { count: "exact", head: true }).eq("status", "new");
        const { count: bounced } = await db.from("email_log").select("id", { count: "exact", head: true }).in("status", ["bounced", "complaint", "failed"]);
        const option2Unsent = (cs ?? []).filter((c) => c.product === "option2" && paidSet.has(c.id) && !c.sent_at).length;
        const since = new Date(Date.now() - 30 * 864e5).toISOString();
        const takings = (paid ?? []).filter((p) => p.paid_at && p.paid_at >= since).reduce((s, p) => s + Number(p.amount_pence ?? 0), 0);
        return reply(200, { queue: q, new_requests: newRequests ?? 0, new_callbacks: newCallbacks ?? 0, email_problems: bounced ?? 0,
          option2_unsent: option2Unsent, takings_30d_pence: takings, live: !!settings?.live });
      }

      case "cases": {
        let q = db.from("cases").select("*").order("created_at", { ascending: false }).limit(300);
        const f = String(body.filter ?? "all");
        if (f === "paid") q = q.in("product", ["option2", "option3"]);
        if (f === "option3") q = q.eq("product", "option3");
        if (f === "option2") q = q.eq("product", "option2");
        if (f === "active") q = q.is("data_deleted_at", null);
        const { data: cs } = await q;
        const ids = (cs ?? []).map((c) => c.id);
        const [{ data: pays }, { data: mails }, { data: rcs }] = ids.length ? await Promise.all([
          db.from("payments").select("case_id, amount_pence, paid_at").eq("status", "paid").in("case_id", ids),
          db.from("email_log").select("case_id, email_type, status, sent_at").in("case_id", ids).order("sent_at", { ascending: false }),
          db.from("review_contacts").select("case_id, method, confirmed_at").in("case_id", ids),
        ]) : [{ data: [] }, { data: [] }, { data: [] }];
        return reply(200, { cases: (cs ?? []).map((c) => summary(c, {
          paid: (pays ?? []).find((p) => p.case_id === c.id), email: (mails ?? []).find((m) => m.case_id === c.id),
          contact: (rcs ?? []).find((r) => r.case_id === c.id),
        })) });
      }

      case "case": {
        const c = await caseByRef(body.ref);
        if (!c) return reply(404, { error: "not_found" });
        const [ans, files, pays, mails, rcs, hist] = await Promise.all([
          db.from("case_answers").select("answers, answers_english, updated_at").eq("case_id", c.id).maybeSingle(),
          db.from("case_files").select("id, kind, doc_type, sha256, created_at, deleted_at").eq("case_id", c.id).order("created_at"),
          db.from("payments").select("product, amount_pence, status, stripe_mode, paid_at, created_at, stripe_payment_intent").eq("case_id", c.id).order("created_at"),
          db.from("email_log").select("recipient, email_type, status, sent_at, status_at, pdf_sha256").eq("case_id", c.id).order("sent_at"),
          db.from("review_contacts").select("id, method, phone, email, availability, note, created_at, confirmed_at, confirmed_slot").eq("case_id", c.id).order("created_at"),
          db.from("audit_log").select("at, actor, action, detail").eq("case_id", c.id).order("at", { ascending: false }).limit(60),
        ]);
        const { private_token: _t, letter_text, ...rest } = c as Obj;
        const site = "https://accounted4tax.github.io/tax-letter-sorted";
        return reply(200, {
          case: rest, letter_text_chars: String(letter_text ?? "").length,
          answers: ans.data ?? null, files: files.data ?? [], payments: pays.data ?? [], emails: mails.data ?? [],
          contacts: rcs.data ?? [], history: hist.data ?? [],
          links: c.data_deleted_at ? {} : {
            id_upload: `${site}/id.html?case=${c.private_token}&lang=${c.language}` + (settings?.live ? "" : `&preview=${settings?.preview_code}`),
            hmrc_code: c.letter_type === "ct-late-filing" ? `${site}/code.html?case=${c.private_token}&lang=${c.language}` + (settings?.live ? "" : `&preview=${settings?.preview_code}`) : null,
          },
        });
      }

      case "file_url": {
        const { data: f } = await db.from("case_files").select("id, case_id, kind, storage_path, deleted_at").eq("id", String(body.file_id ?? "")).maybeSingle();
        if (!f || f.deleted_at) return reply(404, { error: "not_found" });
        await log("file_viewed", f.case_id, { kind: f.kind });
        return reply(200, { url: await signed(f.storage_path) });
      }

      case "update_case": {
        const c = await caseByRef(body.ref);
        if (!c) return reply(404, { error: "not_found" });
        const upd: Obj = {};
        if (body.status !== undefined) {
          if (!STATUSES.includes(String(body.status))) return reply(400, { error: "status" });
          upd.status = body.status;
        }
        if (body.notes !== undefined) upd.admin_notes = str(body.notes, 5000) || null;
        if (body.hmrc_code_requested === true) { upd.hmrc_code_requested_at = new Date().toISOString(); if (c.status === "in_review") upd.status = "awaiting_hmrc_code"; }
        if (body.hmrc_code_requested === false) upd.hmrc_code_requested_at = null;
        if (body.clear_hmrc_code === true) { upd.hmrc_code = null; }
        if (Object.keys(upd).length) await db.from("cases").update(upd).eq("id", c.id);
        if (body.confirm_contact) {
          const cc = body.confirm_contact as Obj;
          await db.from("review_contacts").update({ confirmed_at: new Date().toISOString(), confirmed_slot: str(cc.slot, 120) || null })
            .eq("id", String(cc.id ?? "")).eq("case_id", c.id);
        }
        await log("case_updated", c.id, { fields: Object.keys(upd), confirm_contact: !!body.confirm_contact });
        return reply(200, { ok: true });
      }

      case "save_appeal": {
        const c = await caseByRef(body.ref);
        if (!c) return reply(404, { error: "not_found" });
        if (c.data_deleted_at) return reply(400, { error: "deleted" });
        const d = { ...((c.details ?? {}) as Obj) };
        const inD = (body.details ?? {}) as Obj;
        for (const k of ["full_name", "postcode", "phone", "email", "utr", "ni_number", "company_name", "company_number", "penalty_reference", "role"]) {
          if (inD[k] !== undefined) d[k] = str(inD[k], 200) || null;
        }
        if (Array.isArray(inD.address_lines)) d.address_lines = (inD.address_lines as unknown[]).map((x) => str(x, 80)).filter(Boolean).slice(0, 4);
        const text = body.appeal_text === undefined ? c.admin_appeal_text : (str(body.appeal_text, 12000) || null);
        await db.from("cases").update({ details: d, admin_appeal_text: text, details_saved_at: c.details_saved_at ?? new Date().toISOString() }).eq("id", c.id);
        await log("appeal_saved", c.id, { own_text: !!text });
        return reply(200, { ok: true });
      }

      case "build_appeal":
      case "send_appeal": {
        const c = await caseByRef(body.ref);
        if (!c) return reply(404, { error: "not_found" });
        const r = await callAppeal(String(settings?.cron_secret ?? ""), {
          action: body.action === "build_appeal" ? "admin_build" : "admin_send", case_id: c.id, actor: email,
        });
        return reply(r.ok ? 200 : r.status, r.j);
      }

      case "requests": {
        const [h, cb] = await Promise.all([
          db.from("help_requests").select("*").order("created_at", { ascending: false }).limit(300),
          db.from("callbacks").select("*").order("created_at", { ascending: false }).limit(300),
        ]);
        return reply(200, { help: h.data ?? [], callbacks: cb.data ?? [] });
      }

      case "update_request": {
        const table = body.table === "callbacks" ? "callbacks" : "help_requests";
        const upd: Obj = {};
        if (body.status !== undefined) {
          const ok = (table === "callbacks" ? CALLBACK_STATUSES : REQUEST_STATUSES).includes(String(body.status));
          if (!ok) return reply(400, { error: "status" });
          upd.status = body.status;
          if (table === "callbacks" && body.status === "called") upd.called_at = new Date().toISOString();
        }
        if (body.notes !== undefined) upd[table === "callbacks" ? "call_notes" : "admin_notes"] = str(body.notes, 5000) || null;
        await db.from(table).update(upd).eq("id", String(body.id ?? ""));
        await log("request_updated", null, { table, id: body.id, status: body.status });
        return reply(200, { ok: true });
      }

      case "emails": {
        const { data } = await db.from("email_log").select("id, case_id, recipient, email_type, status, sent_at, status_at, provider_message_id, pdf_sha256")
          .order("sent_at", { ascending: false }).limit(300);
        const ids = [...new Set((data ?? []).map((e) => e.case_id).filter(Boolean))];
        const { data: refs } = ids.length ? await db.from("cases").select("id, ref").in("id", ids) : { data: [] };
        return reply(200, { emails: (data ?? []).map((e) => ({ ...e, ref: (refs ?? []).find((r) => r.id === e.case_id)?.ref ?? null,
          problem: ["bounced", "complaint", "failed"].includes(e.status) })) });
      }

      case "funnel": {
        const days = Math.min(365, Math.max(1, Number(body.days ?? 30)));
        const since = new Date(Date.now() - days * 864e5).toISOString();
        const { data } = await db.from("funnel_events").select("visit_id, step, letter_type, language").gte("created_at", since).limit(20000);
        const steps: Record<string, Set<string>> = {};
        const types: Record<string, number> = {};
        const langs: Record<string, Set<string>> = {};
        for (const e of data ?? []) {
          (steps[e.step] ??= new Set()).add(e.visit_id);
          if (e.step === "recognised" && e.letter_type) types[e.letter_type] = (types[e.letter_type] ?? 0) + 1;
          if (e.language) (langs[e.language] ??= new Set()).add(e.visit_id);
        }
        return reply(200, { days, steps: Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, v.size])), letter_types: types,
          languages: Object.fromEntries(Object.entries(langs).map(([k, v]) => [k, v.size])) });
      }

      case "export": {
        const what = String(body.what ?? "");
        const tables: Record<string, [string, string]> = {
          customers: ["customers", "id, created_at, full_name, email, phone, marketing_consent, marketing_consent_at, deleted_at"],
          payments: ["payments", "id, created_at, case_id, product, amount_pence, status, stripe_mode, paid_at, stripe_payment_intent"],
          emails: ["email_log", "id, sent_at, case_id, recipient, email_type, status, status_at, provider_message_id, pdf_sha256"],
          cases: ["cases", "id, ref, created_at, language, letter_type, product, status, outcome_route, tax_year, appeal_deadline, penalty_amount, approved_at, sent_at, id_completed_at, authority_to_act_at, delete_after, data_deleted_at"],
        };
        if (!tables[what]) return reply(400, { error: "what" });
        const { data } = await db.from(tables[what][0]).select(tables[what][1]).order(what === "emails" ? "sent_at" : "created_at", { ascending: false }).limit(10000);
        await log("export", null, { what, rows: (data ?? []).length });
        return reply(200, { rows: data ?? [] });
      }

      case "find_person":
      case "delete_person": {
        const who = str(body.email, 200).toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(who)) return reply(400, { error: "email" });
        const { data: custs } = await db.from("customers").select("id, full_name, email, created_at, deleted_at").ilike("email", who);
        const custIds = (custs ?? []).map((x) => x.id);
        const { data: byDetails } = await db.from("cases").select("id").ilike("details->>email", who);
        const { data: byCust } = custIds.length ? await db.from("cases").select("id").in("customer_id", custIds) : { data: [] };
        const caseIds = [...new Set([...(byDetails ?? []), ...(byCust ?? [])].map((x) => x.id))];
        const { data: cs } = caseIds.length ? await db.from("cases").select("id, ref, product, status, letter_type, created_at, data_deleted_at").in("id", caseIds) : { data: [] };
        const { data: paidRows } = caseIds.length ? await db.from("payments").select("case_id").eq("status", "paid").in("case_id", caseIds) : { data: [] };
        const paidIds = new Set((paidRows ?? []).map((p) => p.case_id));
        // Accountant-review cases are client engagements: records kept for the AML period unless Eduard decides otherwise
        const kept = (cs ?? []).filter((c) => c.product === "option3" && paidIds.has(c.id));
        const { data: helps } = await db.from("help_requests").select("id").ilike("email", who);
        const { data: cbs } = await db.from("callbacks").select("id").ilike("email", who);
        const found = { customers: custs ?? [], cases: (cs ?? []).map((c) => ({ ...c, kept_for_aml: kept.some((k) => k.id === c.id) })),
          help_requests: (helps ?? []).length, callbacks: (cbs ?? []).length };
        if (body.action === "find_person") return reply(200, found);

        const includeKept = body.include_kept === true;
        const now = new Date().toISOString();
        let wiped = 0;
        for (const c of cs ?? []) {
          if (!includeKept && kept.some((k) => k.id === c.id)) continue;
          const { data: files } = await db.from("case_files").select("id, storage_path").eq("case_id", c.id).is("deleted_at", null);
          const byBucket: Record<string, string[]> = {};
          for (const f of files ?? []) { const { bucket, path } = bucketPath(f.storage_path); (byBucket[bucket] ??= []).push(path); }
          for (const [b, paths] of Object.entries(byBucket)) await db.storage.from(b).remove(paths);
          await db.from("case_files").update({ deleted_at: now }).eq("case_id", c.id).is("deleted_at", null);
          await db.from("case_answers").delete().eq("case_id", c.id);
          await db.from("review_contacts").delete().eq("case_id", c.id);
          await db.from("cases").update({ address: null, ni_number: null, utr: null, letter_text: null, extracted: null, details: null,
            admin_appeal_text: null, admin_notes: null, hmrc_code: null, authority_name: null, data_deleted_at: now, status: "deleted" }).eq("id", c.id);
          await db.from("email_log").update({ recipient: "deleted" }).eq("case_id", c.id);
          wiped++;
        }
        const keptLeft = includeKept ? [] : kept;
        if (!keptLeft.length) {
          if (custIds.length) await db.from("customers").update({ full_name: "deleted", email: "deleted", phone: null, marketing_consent: false, deleted_at: now }).in("id", custIds);
        } else if (custIds.length) {
          // keep the engagement record, but stop marketing
          await db.from("customers").update({ marketing_consent: false }).in("id", custIds);
        }
        await db.from("help_requests").delete().ilike("email", who);
        await db.from("callbacks").delete().ilike("email", who);
        await db.from("email_log").update({ recipient: "deleted" }).ilike("recipient", who);
        await log("person_deleted", null, { cases_wiped: wiped, kept_for_aml: keptLeft.map((k) => k.ref) });
        return reply(200, { ok: true, cases_wiped: wiped, kept_for_aml: keptLeft.map((k) => k.ref), customer_deleted: !keptLeft.length && custIds.length > 0 });
      }
    }
    return reply(400, { error: "action" });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    await db.from("audit_log").insert({ actor: "admin:" + email, action: "admin_error", detail: { action: body.action, error: msg.slice(0, 300) } });
    return reply(502, { error: "server", detail: msg.slice(0, 200) });
  }
});
