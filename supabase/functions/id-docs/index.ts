// id-docs: identity documents for Option 3 (customer due diligence), server side.
//   status    (JSON)      – which documents are still needed / received
//   upload    (form data) – one document: part (photo_id | selfie | proof_address | incorporation), doc_type, file
//   complete  (JSON)      – every document received → case goes to the review queue
//   later     (JSON)      – "I will upload later": emails a private upload link; id-reminders sends reminders
// Rules (rules/id-documents.json): one document cannot be used for both photo ID and proof of address,
// and the same file cannot be uploaded twice.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendIdEmail } from "./email.ts";

const SITE = "https://accounted4tax.github.io/tax-letter-sorted";
const KIND: Record<string, string> = { photo_id: "id_photo", selfie: "id_selfie", proof_address: "id_address", incorporation: "incorporation_cert" };
const MAX = 10 * 1024 * 1024;

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
type Obj = Record<string, unknown>;

let catalog: Obj | null = null;
async function docs() {
  if (catalog) return catalog;
  const r = await fetch(`${SITE}/rules/id-documents.json`);
  if (!r.ok) throw new Error("catalog");
  catalog = await r.json();
  return catalog!;
}
function sniff(b: Uint8Array): { ext: string; mime: string } | null {
  const s = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  if (s(0, 4) === "%PDF") return { ext: "pdf", mime: "application/pdf" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && s(1, 3) === "PNG") return { ext: "png", mime: "image/png" };
  if (s(0, 4) === "RIFF" && s(8, 4) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (s(4, 4) === "ftyp" && /hei|mif|heic|heix|hevc/.test(s(8, 4))) return { ext: "heic", mime: "image/heic" };
  return null;
}
async function sha256(b: Uint8Array) {
  const h = await crypto.subtle.digest("SHA-256", b as BufferSource);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function currentFiles(caseId: string) {
  const { data } = await db.from("case_files").select("id, kind, doc_type, sha256, storage_path")
    .eq("case_id", caseId).in("kind", Object.values(KIND)).is("deleted_at", null);
  return data ?? [];
}
function partsFor(cat: Obj, letterType: string) {
  return ((cat.company_types as string[]).includes(letterType) ? cat.parts_company : cat.parts_individual) as string[];
}
async function statusOf(c: Obj) {
  const cat = await docs();
  const parts = partsFor(cat, String(c.letter_type));
  const files = await currentFiles(String(c.id));
  const out: Record<string, Obj> = {};
  for (const p of parts) {
    const f = files.find((x) => x.kind === KIND[p]);
    out[p] = { received: !!f, doc_type: f?.doc_type ?? null };
  }
  return {
    ref: c.ref, letter_type: c.letter_type, company: parts.includes("incorporation"), parts: out,
    all_received: parts.every((p) => out[p].received), completed: !!c.id_completed_at,
    authority: !!c.authority_to_act_at, later_requested: !!c.id_requested_at, appeal_deadline: c.appeal_deadline,
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

  const isForm = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
  let body: Obj = {};
  let form: FormData | null = null;
  try {
    if (isForm) { form = await req.formData(); for (const [k, v] of form.entries()) if (typeof v === "string") body[k] = v; body.action = "upload"; }
    else body = await req.json();
  } catch { return reply(400, { error: "bad_request" }); }

  const preview = !settings?.live && !!settings?.preview_code && body.preview === settings.preview_code;
  if (!settings?.live && !preview) return reply(403, { error: "closed" });
  const mustPay = !preview || !!settings?.payments_test;

  const token = String(body.case ?? "");
  if (!/^[0-9a-f]{40,80}$/.test(token)) return reply(400, { error: "bad_request" });
  const { data: c } = await db.from("cases")
    .select("id, ref, language, product, status, letter_type, details, appeal_deadline, private_token, id_requested_at, id_reminders_sent, id_completed_at, authority_to_act_at, data_deleted_at")
    .eq("private_token", token).single();
  if (!c || c.data_deleted_at) return reply(404, { error: "not_found" });
  if (c.product !== "option3") return reply(400, { error: "not_option3" });
  if (mustPay) {
    const { data: paid } = await db.from("payments").select("id").eq("case_id", c.id).eq("status", "paid").limit(1);
    if (!paid?.length) return reply(402, { error: "not_paid" });
  }

  try {
    if (body.action === "status") return reply(200, await statusOf(c));

    if (body.action === "upload") {
      if (c.id_completed_at) return reply(400, { error: "already_complete" });
      const cat = await docs();
      const part = String(body.part ?? "");
      if (!partsFor(cat, String(c.letter_type)).includes(part)) return reply(400, { error: "part" });
      const docType = part === "selfie" ? "selfie" : String(body.doc_type ?? "");
      const list = (cat[part] ?? []) as Obj[];
      const entry = list.find((x) => x.id === docType);
      if (part !== "selfie" && !entry) return reply(400, { error: "doc_type" });
      const file = form?.get("file");
      if (!(file instanceof File)) return reply(400, { error: "file" });
      if (file.size > MAX) return reply(400, { error: "file" });
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = sniff(bytes);
      if (!kind) return reply(400, { error: "file" });
      const hash = await sha256(bytes);

      const files = await currentFiles(String(c.id));
      const others = files.filter((f) => f.kind !== KIND[part]);
      // the same file for two parts
      if (others.some((f) => f.sha256 === hash)) return reply(409, { error: "same_file" });
      // one document cannot be both photo ID and proof of address (e.g. a driving licence)
      if (entry?.same_as && (part === "photo_id" || part === "proof_address")) {
        const otherPart = part === "photo_id" ? "proof_address" : "photo_id";
        const otherFile = files.find((f) => f.kind === KIND[otherPart]);
        const otherEntry = ((cat[otherPart] ?? []) as Obj[]).find((x) => x.id === otherFile?.doc_type);
        if (otherEntry?.same_as && otherEntry.same_as === entry.same_as) return reply(409, { error: "same_document" });
      }

      // replace an earlier upload for this part
      const old = files.filter((f) => f.kind === KIND[part]);
      if (old.length) {
        await db.storage.from("id-docs").remove(old.map((f) => f.storage_path.replace(/^id-docs\//, "")));
        await db.from("case_files").update({ deleted_at: new Date().toISOString() }).in("id", old.map((f) => f.id));
      }
      const path = `${c.id}/${part}-${hash.slice(0, 12)}.${kind.ext}`;
      const up = await db.storage.from("id-docs").upload(path, bytes, { contentType: kind.mime, upsert: true });
      if (up.error) throw new Error("storage:" + up.error.message);
      await db.from("case_files").insert({ case_id: c.id, kind: KIND[part], storage_path: `id-docs/${path}`, sha256: hash, doc_type: docType });
      await db.from("audit_log").insert({ actor: "client", action: "id_uploaded", case_id: c.id, detail: { part, doc_type: docType } });
      return reply(200, await statusOf(c));
    }

    if (body.action === "complete") {
      const st = await statusOf(c);
      if (!st.all_received) return reply(400, { error: "missing", status: st });
      // Option 3 is only the appeal letter, so no authority to act is needed (Eduard, 31 Oct 2026).
      // It is requested separately if the client later asks for other services.
      const now = new Date().toISOString();
      await db.from("cases").update({ id_completed_at: now, status: "in_review" }).eq("id", c.id);
      await db.from("audit_log").insert({ actor: "client", action: "id_completed", case_id: c.id });
      return reply(200, { ok: true });
    }

    if (body.action === "later") {
      if (c.id_completed_at) return reply(200, { ok: true, sent: false, completed: true });
      // first request starts the reminder clock (1, 6, 12, 24 and 48 hours)
      if (!c.id_requested_at) {
        await db.from("cases").update({ id_requested_at: new Date().toISOString(), id_reminders_sent: 0, status: "awaiting_id" }).eq("id", c.id);
      }
      const r = await sendIdEmail(db, c, { reminder: false, previewCode: settings?.live ? null : settings?.preview_code });
      return reply(200, { ok: true, sent: r.ok });
    }

    return reply(400, { error: "action" });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    await db.from("audit_log").insert({ actor: "system", action: "id_docs_error", case_id: c.id, detail: { action: body.action, error: msg.slice(0, 300) } });
    return reply(502, { error: "server" });
  }
});
