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
  // email deliverability check: the domain's mail records, and a test email to Eduard's own addresses only
  if (b.action === "dns") {
    const q = async (n: string, t: "TXT" | "MX" | "CNAME") => { try { return await Deno.resolveDns(n, t as any); } catch (e) { return String((e as Error).message ?? e); } };
    const d = "accounted4tax.co.uk";
    return json(200, { spf: await q(d, "TXT"), dmarc: await q("_dmarc." + d, "TXT"), mx: await q(d, "MX"),
      brevo1: await q("brevo1._domainkey." + d, "CNAME"), brevo2: await q("brevo2._domainkey." + d, "CNAME"), mail: await q("mail._domainkey." + d, "TXT") });
  }
  if (b.action === "events") {
    const to = String(b.to ?? "").toLowerCase();
    if (!["ehiosif@outlook.com", "ehiosif@gmail.com", "info@accounted4tax.co.uk"].includes(to)) return json(400, { error: "recipient_not_allowed" });
    const r = await fetch(`https://api.brevo.com/v3/smtp/statistics/events?email=${encodeURIComponent(to)}&limit=20&days=2`, { headers: { "api-key": String(Deno.env.get("BREVO_API_KEY")), accept: "application/json" } });
    return json(r.status, await r.json().catch(() => ({})));
  }
  if (b.action === "email") {
    const ALLOWED = ["ehiosif@outlook.com", "ehiosif@gmail.com", "info@accounted4tax.co.uk"];
    const to = String(b.to ?? "").toLowerCase();
    if (!ALLOWED.includes(to)) return json(400, { error: "recipient_not_allowed" });
    const key = Deno.env.get("BREVO_API_KEY");
    const html = `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#14213D"><div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#14213D;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;font-size:18px;font-weight:bold">Tax Letter Sorted</div><div style="background:#fff;padding:22px 18px;border-radius:0 0 10px 10px;font-size:15px;line-height:1.55"><p>Hello Eduard,</p><p>This is a test email from Tax Letter Sorted, to check that our emails reach the inbox and not the spam folder.</p><p>If you found this in Spam or Junk, please tell Claude.</p></div><p style="font-size:12px;color:#4A5568;text-align:center">Tax Letter Sorted by Accounted4Tax Ltd · 128 City Road, London, EC1V 2NX</p></div></body></html>`;
    const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": String(key), "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "Tax Letter Sorted", email: "letters@accounted4tax.co.uk" }, replyTo: { email: "info@accounted4tax.co.uk" }, to: [{ email: to }],
        subject: "Test – Tax Letter Sorted email check", htmlContent: html, textContent: "Hello Eduard,\n\nThis is a test email from Tax Letter Sorted, to check that our emails reach the inbox and not the spam folder.", tags: ["deliverability-test"] }) });
    return json(r.status, await r.json().catch(() => ({})));
  }
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
