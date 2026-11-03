// Sends the "upload your ID" email (first email and reminders) through Brevo, in the client's language,
// and records it in email_log. Shared by id-docs and id-reminders (each folder has its own copy).
// The Brevo key is an Edge Function secret (BREVO_API_KEY).
// deno-lint-ignore-file no-explicit-any
const SITE = "https://accounted4tax.github.io/tax-letter-sorted";
const SENDER = { name: "Tax Letter Sorted", email: "letters@accounted4tax.co.uk" };
const COMPANY_TYPES = ["ct-late-filing", "companies-house-late-filing"];

// Built-in English, used if the website's language file can't be read (never show a raw label to a client).
const EN_DEFAULT: Record<string, string> = {
  "email.id.subject": "Upload your ID to continue your appeal ({ref})",
  "email.id.hello": "Hello {name},",
  "email.id.body": "Thank you for choosing our accountant review. Before we can act for you, the law requires us to check your identity. Please upload your photo ID, a selfie and proof of address using the button below.",
  "email.id.body_company": "Thank you for choosing our accountant review. Before we can act for the company, the law requires us to check the director's identity and the company. Please upload the director's photo ID, a selfie, proof of address and the certificate of incorporation using the button below.",
  "email.id.reminder": "Reminder: we still need your documents before we can start on your appeal.",
  "email.id.button": "Upload my documents",
  "email.id.deadline": "Your appeal deadline is {date}.",
  "email.id.footer": "Tax Letter Sorted by Accounted4Tax Ltd · letters@accounted4tax.co.uk · 07563 811938",
  "email.code.subject": "HMRC will post an authorisation code to the company ({ref})",
  "email.code.body": "Thank you, we have the documents and your confirmation. We are asking HMRC for authorisation to act for the company's Corporation Tax. HMRC will post a letter with an authorisation code to the company's registered office, usually within about 2 weeks.",
  "email.code.action": "When the letter arrives, please send us the code straight away using the button below. It is only valid for a limited time.",
  "email.code.meanwhile": "We will still prepare the appeal in the meantime, so the deadline is not missed.",
  "email.code.button": "Send the HMRC code",
};

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

export async function sendIdEmail(db: any, c: any, opts: { reminder: boolean; previewCode?: string | null }) {
  const key = Deno.env.get("BREVO_API_KEY");
  const d = c.details ?? {};
  const to = String(d.email ?? "");
  if (!key || !to) return { ok: false, error: !key ? "not_configured" : "no_email" };
  const lang = c.language === "ro" ? "ro" : "en";
  const load = async (l: string) => { try { const r = await fetch(`${SITE}/lang/${l}.json`, { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; } };
  const dict = await load(lang);
  const en = lang === "en" ? dict : await load("en");
  const t = (k: string, vars: Record<string, string> = {}) => {
    const get = (o: any) => k.split(".").reduce((x: any, p) => x?.[p], o);
    const v = get(dict) ?? get(en) ?? EN_DEFAULT[k] ?? "";
    return String(v).replace(/\{(\w+)\}/g, (m, x) => vars[x] ?? m);
  };
  const link = `${SITE}/id.html?case=${c.private_token}&lang=${lang}` + (opts.previewCode ? `&preview=${opts.previewCode}` : "");
  const company = COMPANY_TYPES.includes(String(c.letter_type));
  const name = String(d.full_name ?? "").trim() || "";
  const deadline = c.appeal_deadline
    ? new Date(c.appeal_deadline + "T00:00:00Z").toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const paras = [
    opts.reminder ? t("email.id.reminder") : "",
    t(company ? "email.id.body_company" : "email.id.body"),
    deadline ? t("email.id.deadline", { date: deadline }) : "",
  ].filter(Boolean);
  const subject = t("email.id.subject", { ref: String(c.ref) });
  const html = `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#14213D">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#14213D;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;font-size:18px;font-weight:bold">Tax Letter Sorted</div>
<div style="background:#fff;padding:22px 18px;border-radius:0 0 10px 10px;font-size:15px;line-height:1.55">
<p>${esc(t("email.id.hello", { name }))}</p>
${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
<p style="margin:26px 0"><a href="${link}" style="background:#0E6E6B;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold;display:inline-block">${esc(t("email.id.button"))}</a></p>
<p style="font-size:12px;color:#4A5568">${esc(link)}</p>
</div>
<p style="font-size:12px;color:#4A5568;text-align:center">${esc(t("email.id.footer"))}</p>
</div></body></html>`;
  const text = [t("email.id.hello", { name }), ...paras, `${t("email.id.button")}: ${link}`, t("email.id.footer")].join("\n\n");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to, name: name || undefined }], subject, htmlContent: html, textContent: text,
      tags: ["id_request"] }),
  });
  const j = await res.json().catch(() => ({}));
  await db.from("email_log").insert({
    case_id: c.id, recipient: to, email_type: "id_request",
    provider_message_id: j.messageId ?? null, status: res.ok ? "sent" : "failed",
  });
  if (!res.ok) {
    await db.from("audit_log").insert({ actor: "brevo", action: "email_failed", case_id: c.id, detail: { status: res.status, error: JSON.stringify(j).slice(0, 300) } });
    return { ok: false, error: "send_failed" };
  }
  return { ok: true };
}


// ---------- shared by the other emails ----------
async function lang(c: any) {
  const l = c.language === "ro" ? "ro" : "en";
  const load = async (x: string) => { try { const r = await fetch(`${SITE}/lang/${x}.json`, { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; } };
  const dict = await load(l);
  const en = l === "en" ? dict : await load("en");
  const t = (k: string, vars: Record<string, string> = {}) => {
    const get = (o: any) => k.split(".").reduce((x: any, p) => x?.[p], o);
    const v = get(dict) ?? get(en) ?? EN_DEFAULT[k] ?? "";
    return String(v).replace(/\{(\w+)\}/g, (m, x) => vars[x] ?? m);
  };
  return { l, t };
}
function page(hello: string, paras: string[], button: string | null, link: string | null, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#14213D">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#14213D;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;font-size:18px;font-weight:bold">Tax Letter Sorted</div>
<div style="background:#fff;padding:22px 18px;border-radius:0 0 10px 10px;font-size:15px;line-height:1.55">
<p>${esc(hello)}</p>
${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
${button && link ? `<p style="margin:26px 0"><a href="${link}" style="background:#0E6E6B;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold;display:inline-block">${esc(button)}</a></p>
<p style="font-size:12px;color:#4A5568">${esc(link)}</p>` : ""}
</div>
<p style="font-size:12px;color:#4A5568;text-align:center">${esc(footer)}</p>
</div></body></html>`;
}
async function brevo(db: any, caseId: string, to: string, name: string, subject: string, html: string, text: string, type: string, tag: string) {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key || !to) return { ok: false, error: !key ? "not_configured" : "no_email" };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to, name: name || undefined }], subject, htmlContent: html, textContent: text, tags: [tag] }),
  });
  const j = await res.json().catch(() => ({}));
  await db.from("email_log").insert({ case_id: caseId, recipient: to, email_type: type, provider_message_id: j.messageId ?? null, status: res.ok ? "sent" : "failed" });
  if (!res.ok) await db.from("audit_log").insert({ actor: "brevo", action: "email_failed", case_id: caseId, detail: { status: res.status, error: JSON.stringify(j).slice(0, 300) } });
  return { ok: res.ok };
}

// Corporation Tax (£59): HMRC posts an agent authorisation code to the company; the client sends it to us.
export async function sendCodeEmail(db: any, c: any, opts: { previewCode?: string | null }) {
  const d = c.details ?? {};
  const { l, t } = await lang(c);
  const name = String(d.full_name ?? "").trim();
  const link = `${SITE}/code.html?case=${c.private_token}&lang=${l}` + (opts.previewCode ? `&preview=${opts.previewCode}` : "");
  const paras = [t("email.code.body"), t("email.code.action"), t("email.code.meanwhile")];
  const hello = t("email.id.hello", { name });
  const html = page(hello, paras, t("email.code.button"), link, t("email.id.footer"));
  const text = [hello, ...paras, `${t("email.code.button")}: ${link}`, t("email.id.footer")].join("\n\n");
  return await brevo(db, c.id, String(d.email ?? ""), name, t("email.code.subject", { ref: String(c.ref) }), html, text, "hmrc_code_request", "hmrc_code");
}

// Short alert to Eduard (letters@)
export async function alertEduard(db: any, c: any, subject: string, lines: string[]) {
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${lines.map((x) => `<p>${esc(x)}</p>`).join("")}</div>`;
  return await brevo(db, c.id, "letters@accounted4tax.co.uk", "", subject, html, lines.join("\n"), "other", "admin_alert");
}
