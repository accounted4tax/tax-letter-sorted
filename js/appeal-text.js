// Builds the English appeal wording that goes in the SA370 "reason" box (and appeal letters).
// One file, used by the website (confirm screen preview) and by the server (the PDF), so the
// client approves exactly the text that is sent.
// It only joins the client's own confirmed facts with fixed polite sentences; it never adds facts.

const EVIDENCE_EN = {
  discharge_letter: "a hospital discharge letter",
  doctor_letter: "a letter from my doctor",
  death_certificate: "a death certificate",
  repair_receipt: "a repair receipt or IT report",
  police_report: "a police or insurance report",
  other: "other supporting documents",
};

function fmt(iso) {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00Z");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
function list(items) {
  return items.length <= 1 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}
function sentence(s) {
  s = String(s ?? "").trim();
  return s && !/[.!?]$/.test(s) ? s + "." : s;
}

// a = {
//   letter_type, tax_year ("2024-25"), penalty_count (number),
//   story, why_late, nnf_other_text, something_else_text   (English, as confirmed)
//   date_from, date_to, filed_date, filed_asap ("yes"/"no"), evidence: []
// }
export function composeAppeal(a) {
  const pay = a.letter_type === "sa-late-payment";
  const company = a.letter_type === "ct-late-filing";
  const ch = a.letter_type === "companies-house-late-filing";
  const plural = (a.penalty_count ?? 1) > 1;
  const what = pay ? "late payment penalt" : "late filing penalt";
  const penaltyWords = what + (plural ? "ies" : "y");
  const year = /^\d{4}-\d{2}$/.test(a.tax_year ?? "")
    ? ` for the tax year ${a.tax_year.slice(0, 4)} to 20${a.tax_year.slice(5)}` : "";
  const doc = ch ? "the accounts" : company ? "the company tax return" : pay ? "the tax" : "my tax return";
  const filedVerb = pay ? "paid" : "filed";

  const p = [];
  p.push(`I would like to appeal against the ${penaltyWords}${company || ch ? "" : year}, based on the following facts.`);

  const facts = [a.story, a.something_else_text, a.nnf_other_text].map(sentence).filter(Boolean);
  if (facts.length) p.push(facts.join(" "));

  const extra = [];
  if (a.date_from && a.date_to) extra.push(`The problem lasted from ${fmt(a.date_from)} to ${fmt(a.date_to)}.`);
  else if (a.date_from) extra.push(`The problem started on ${fmt(a.date_from)}.`);
  if (a.filed_date) {
    extra.push(a.filed_asap === "yes"
      ? `I ${filedVerb} ${doc} on ${fmt(a.filed_date)}, as soon as I was able to.`
      : `I ${filedVerb} ${doc} on ${fmt(a.filed_date)}.`);
  } else if (a.filed_asap === "yes") {
    extra.push(`I ${filedVerb} ${doc} as soon as I was able to.`);
  }
  const ev = (a.evidence ?? []).filter((k) => EVIDENCE_EN[k]).map((k) => EVIDENCE_EN[k]);
  if (ev.length) extra.push(`I can provide ${list(ev)} if you need it.`);
  if (extra.length) p.push(extra.join(" "));

  if (a.why_late) p.push(`I am making this appeal after the 30-day time limit because: ${sentence(a.why_late)}`);

  p.push(`Missing the deadline was not intentional. It happened because of the circumstances described above.`);
  p.push("Thank you for considering my appeal. I look forward to a favourable decision.");
  return p.join("\n\n");
}
