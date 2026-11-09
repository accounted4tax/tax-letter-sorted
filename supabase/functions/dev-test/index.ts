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
