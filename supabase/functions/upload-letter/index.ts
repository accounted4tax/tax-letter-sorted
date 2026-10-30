// upload-letter: receives the photos/PDF of an HMRC letter, stores them privately,
// opens a case and records the funnel step. Runs on Supabase (server side).
// Uses the service role key that Supabase provides to the function automatically;
// no key is ever sent to or stored in the website.
import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_FILE = 10 * 1024 * 1024;   // 10 MB per file
const MAX_TOTAL = 20 * 1024 * 1024;  // 20 MB per letter
const MAX_FILES = 10;
const LANGS = ["en", "ro", "pl", "bg", "lt", "ar", "ur"];

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

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
  const h = await crypto.subtle.digest("SHA-256", b);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
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

  let form: FormData;
  try { form = await req.formData(); } catch { return reply(400, { error: "bad_request" }); }

  const preview = String(form.get("preview") ?? "");
  if (!settings?.live && (!settings?.preview_code || preview !== settings.preview_code)) {
    return reply(403, { error: "closed" });
  }
  if (String(form.get("consent")) !== "yes") return reply(400, { error: "consent" });

  const language = LANGS.includes(String(form.get("language"))) ? String(form.get("language")) : "en";
  const visitId = String(form.get("visit_id") ?? "");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return reply(400, { error: "no_file" });
  if (files.length > MAX_FILES) return reply(400, { error: "too_many" });

  const parts: { bytes: Uint8Array; ext: string; mime: string }[] = [];
  let total = 0;
  for (const f of files) {
    if (f.size > MAX_FILE) return reply(400, { error: "too_big" });
    total += f.size;
    if (total > MAX_TOTAL) return reply(400, { error: "too_big" });
    const bytes = new Uint8Array(await f.arrayBuffer());
    const kind = sniff(bytes);
    if (!kind) return reply(400, { error: "type" });
    parts.push({ bytes, ...kind });
  }

  const letterText = String(form.get("text") ?? "").slice(0, 60000) || null;
  const deleteAfter = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const { data: c, error: caseErr } = await db.from("cases")
    .insert({ language, status: "uploaded", delete_after: deleteAfter, letter_text: letterText })
    .select("id, ref, private_token").single();
  if (caseErr || !c) return reply(500, { error: "server" });

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const path = `${c.id}/page-${String(i + 1).padStart(2, "0")}.${p.ext}`;
    const up = await db.storage.from("letters").upload(path, p.bytes, { contentType: p.mime, upsert: false });
    if (up.error) {
      await db.from("audit_log").insert({ actor: "system", action: "upload_failed", case_id: c.id, detail: { message: up.error.message } });
      return reply(500, { error: "server" });
    }
    await db.from("case_files").insert({ case_id: c.id, kind: "letter", storage_path: `letters/${path}`, sha256: await sha256(p.bytes) });
  }

  if (/^[0-9a-f-]{36}$/i.test(visitId)) {
    await db.from("funnel_events").insert({ visit_id: visitId, step: "uploaded", language, detail: `${parts.length} file(s)` });
  }
  await db.from("audit_log").insert({ actor: "system", action: "letter_uploaded", case_id: c.id, detail: { files: parts.length, preview: !settings?.live } });

  return reply(200, { ref: c.ref, case: c.private_token, files: parts.length });
});
