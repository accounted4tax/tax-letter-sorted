// dev-test: TEMPORARY helper for testing before launch (remove on switch-on day).
// Uploads one of the fictional test-letter photos in /dev/test-letters/ through upload-letter, as the website would.
// Only works while the site is not live, and only with the cron secret.
import { createClient } from "npm:@supabase/supabase-js@2";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const SITE = "https://taxletters.accounted4tax.co.uk";

Deno.serve(async (req) => {
  const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
  const { data: settings } = await db.from("app_settings").select("live, cron_secret, preview_code").eq("id", 1).single();
  if (settings?.live) return json(403, { error: "live" });
  if (!settings?.cron_secret || req.headers.get("x-cron-secret") !== settings.cron_secret) return json(403, { error: "forbidden" });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json(400, { error: "bad_request" }); }
  // the latest appeal PDF of a test case (small letters only), to check what was built
  if (b.action === "pdf") {
    const { data: c } = await db.from("cases").select("id, admin_notes").eq("ref", String(b.ref ?? "")).single();
    if (!c || !String(c.admin_notes ?? "").startsWith("TEST")) return json(404, { error: "not_test_case" });
    const { data: f } = await db.from("case_files").select("storage_path").eq("case_id", c.id).eq("kind", "appeal_pdf").order("created_at", { ascending: false }).limit(1).single();
    if (!f) return json(404, { error: "no_pdf" });
    const dl = await db.storage.from("appeals").download(f.storage_path.replace(/^appeals\//, ""));
    if (dl.error || !dl.data) return json(500, { error: "download" });
    const bytes = new Uint8Array(await dl.data.arrayBuffer());
    if (bytes.length > 60000) return json(413, { error: "too_big", bytes: bytes.length });
    let bin = ""; for (const x of bytes) bin += String.fromCharCode(x);
    return json(200, { base64: btoa(bin) });
  }
  const name = String(b.file ?? "");
  if (!/^photo-\d{2}\.jpg$/.test(name)) return json(400, { error: "file" });
  const img = await fetch(`${SITE}/dev/test-letters/${name}`);
  if (!img.ok) return json(404, { error: "not_found" });
  const fd = new FormData();
  fd.append("files", new File([await img.arrayBuffer()], name, { type: "image/jpeg" }));
  fd.append("consent", "yes");
  fd.append("language", String(b.language ?? "en"));
  fd.append("preview", String(settings.preview_code ?? ""));
  const up = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/upload-letter`, { method: "POST", body: fd, headers: { Origin: SITE } });
  const res = await up.json().catch(() => ({}));
  if (up.ok && res.ref) await db.from("cases").update({ admin_notes: "TESTPHOTO-" + name.slice(6, 8) }).eq("ref", res.ref);
  return json(up.status, res);
});
