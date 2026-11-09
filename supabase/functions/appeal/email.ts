// Emails the appeal PDF to the client (Brevo), in the client's language, with what to do next.
// The PDF is attached; the email log keeps the SHA-256 of the PDF sent (proof of which document went out).
// deno-lint-ignore-file no-explicit-any
const SITE = "https://taxletters.accounted4tax.co.uk";
const SENDER = { name: "Tax Letter Sorted", email: "letters@accounted4tax.co.uk" };

const EN_DEFAULT: Record<string, string> = {
  "email.appeal.subject": "Your penalty appeal is ready ({ref})",
  "email.appeal.subject_copy": "A copy of the company's penalty appeal ({ref})",
  "email.appeal.hello": "Hello {name},",
  "email.appeal.intro": "Your appeal is attached as a PDF. Please check it once more before you send it.",
  "email.appeal.intro_copy": "Attached is a copy of the appeal we have prepared for the company. Please keep it with the company's records. We'll let you know when it has been submitted and when there is a reply.",
  "email.appeal.post": "Print it, sign it and post it to: {address}. Send it by a tracked service (for example Royal Mail Signed For) and keep the tracking number.",
  "email.appeal.online_ch": "Submit it through Companies House's online appeal service: {address}",
  "email.appeal.deadline": "Your appeal deadline is {date}.",
  "email.appeal.evidence": "If you have evidence (for example a hospital letter), send copies, never originals.",
  "email.appeal.keep": "We keep this PDF for 14 days, then delete it. Please save a copy.",
  "email.appeal.footer": "Tax Letter Sorted by Accounted4Tax Ltd · letters@accounted4tax.co.uk · 07563 811938",
};

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}
async function texts(lang: string) {
  const load = async (x: string) => { try { const r = await fetch(`${SITE}/lang/${x}.json`, { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; } };
  const dict = await load(lang);
  const en = lang === "en" ? dict : await load("en");
  return (k: string, vars: Record<string, string> = {}) => {
    const get = (o: any) => k.split(".").reduce((x: any, p) => x?.[p], o);
    const v = get(dict) ?? get(en) ?? EN_DEFAULT[k] ?? "";
    return String(v).replace(/\{(\w+)\}/g, (m, x) => vars[x] ?? m);
  };
}
function b64(bytes: Uint8Array) {
  let s = ""; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

// copy = true: company appeals we submit as agent (the client gets a copy); otherwise the client sends it.
export async function sendAppealEmail(db: any, c: any, pdf: Uint8Array, sha: string, send: { how: string; to: string }, copy: boolean) {
  const key = Deno.env.get("BREVO_API_KEY");
  const d = c.details ?? {};
  const to = String(d.email ?? "");
  if (!key || !to) return { ok: false, error: !key ? "not_configured" : "no_email" };
  const lang = c.language === "ro" ? "ro" : "en";
  const t = await texts(lang);
  const name = String(d.full_name ?? "").trim();
  const deadline = c.appeal_deadline
    ? new Date(c.appeal_deadline + "T00:00:00Z").toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const paras = copy
    ? [t("email.appeal.intro_copy")]
    : [t("email.appeal.intro"),
       send.how === "online" ? t("email.appeal.online_ch", { address: send.to }) : t("email.appeal.post", { address: send.to }),
       deadline ? t("email.appeal.deadline", { date: deadline }) : "",
       t("email.appeal.evidence"),
       c.product === "option2" ? t("email.appeal.keep") : ""].filter(Boolean);
  const hello = t("email.appeal.hello", { name });
  const html = `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#14213D">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#14213D;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;font-size:18px;font-weight:bold">Tax Letter Sorted</div>
<div style="background:#fff;padding:22px 18px;border-radius:0 0 10px 10px;font-size:15px;line-height:1.55">
<p>${esc(hello)}</p>${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
</div>
<p style="font-size:12px;color:#4A5568;text-align:center">${esc(t("email.appeal.footer"))}</p>
</div></body></html>`;
  const text = [hello, ...paras, t("email.appeal.footer")].join("\n\n");
  const subject = t(copy ? "email.appeal.subject_copy" : "email.appeal.subject", { ref: String(c.ref) });
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to, name: name || undefined }], subject, htmlContent: html, textContent: text,
      attachment: [{ name: `Appeal-${c.ref}.pdf`, content: b64(pdf) }], tags: ["appeal_pdf"] }),
  });
  const j = await res.json().catch(() => ({}));
  await db.from("email_log").insert({ case_id: c.id, recipient: to, email_type: "appeal_pdf", provider_message_id: j.messageId ?? null,
    status: res.ok ? "sent" : "failed", pdf_sha256: sha });
  if (!res.ok) {
    await db.from("audit_log").insert({ actor: "brevo", action: "email_failed", case_id: c.id, detail: { status: res.status, error: JSON.stringify(j).slice(0, 300) } });
    return { ok: false, error: "send_failed" };
  }
  return { ok: true };
}
