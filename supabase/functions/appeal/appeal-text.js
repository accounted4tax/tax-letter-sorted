// COPY of js/appeal-text.js (the website uses that one). Keep both identical; Claude copies it before each deploy.
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

// What follows "because" for each reason the client chose (restates their own choice, adds no facts).
const BECAUSE = {
  bereavement: "of a bereavement: my partner or a close relative died shortly before the deadline",
  hospital: "of an unexpected stay in hospital",
  serious_illness: "of a serious illness",
  disability_mental_illness: "of a disability or mental illness that I have",
  computer_failure: "of a computer or software failure while I was dealing with my tax online",
  hmrc_online_issues: "of problems with HMRC's online services",
  fire_flood_disaster: "of a fire, flood or other disaster",
  theft_crime: "of a theft or other crime",
  postal_delay: "of postal delays that I could not have predicted",
  unaware_obligation: "I did not know about, or misunderstood, what I had to do",
  relied_on_someone: "I relied on someone else to deal with it, and they did not do so",
  ch_unforeseen_event: "of an unforeseen event at a critical time",
  ch_director_illness_death: "of the serious illness or death of a director at a critical time, when no one else could file",
  ch_system_failure: "Companies House's online filing service failed",
};

// Shorter version for the closing sentence, pointing back to the facts.
const BECAUSE_CLOSE = {
  bereavement: "of the bereavement described above",
  hospital: "of my unexpected stay in hospital",
  serious_illness: "of my serious illness",
  disability_mental_illness: "of my disability or mental illness",
  computer_failure: "of the computer or software failure described above",
  hmrc_online_issues: "of the problems with HMRC's online services described above",
  fire_flood_disaster: "of the fire, flood or other disaster described above",
  theft_crime: "of the theft or crime described above",
  postal_delay: "of the postal delays described above",
  unaware_obligation: "I did not know about, or misunderstood, what I had to do",
  relied_on_someone: "the person I relied on did not do what they were supposed to",
  ch_unforeseen_event: "of the unforeseen event described above",
  ch_director_illness_death: "of the director's illness or death described above",
  ch_system_failure: "of the Companies House system failure described above",
};

// a = {
//   letter_type, reason, tax_year ("2024-25"), penalty_count (number),
//   story, why_late, nnf_other_text, something_else_text   (English, as confirmed)
//   date_from, date_to, filed_date, filed_asap ("yes"/"no"), evidence: []
// }
export function composeAppeal(a) {
  const pay = a.letter_type === "sa-late-payment";
  const company = a.letter_type === "ct-late-filing";
  const ch = a.letter_type === "companies-house-late-filing";
  const plural = (a.penalty_count ?? 1) > 1;
  const penaltyWords = (pay ? "late payment penalt" : "late filing penalt") + (plural ? "ies" : "y");
  const year = /^\d{4}-\d{2}$/.test(a.tax_year ?? "") && !company && !ch
    ? ` for the tax year ${a.tax_year.slice(0, 4)} to 20${a.tax_year.slice(5)}` : "";
  const doc = ch ? "its accounts" : company ? "its company tax return" : pay ? "the tax" : "my tax return";
  const who = company || ch ? "The company was" : "I was";
  const act = pay ? "pay my tax" : company ? "file its company tax return" : ch ? "file its accounts" : "file my tax return";
  const filedVerb = pay ? "paid" : "filed";
  const deadline = pay ? "the payment deadline" : "the filing deadline";
  const because = BECAUSE[a.reason] || null;

  const p = [];
  if (a.reason === "never_needed_to_file") {
    p.push(`I would like to appeal against the ${penaltyWords}${year}, because I do not believe I needed to file a tax return for that year. The facts are as follows.`);
  } else if (because) {
    p.push(`I would like to appeal against the ${penaltyWords}${year}. ${who} unable to ${act} on time because ${because}. The facts are as follows.`);
  } else {
    p.push(`I would like to appeal against the ${penaltyWords}${year}, based on the following facts.`);
  }

  const facts = [a.story, a.something_else_text, a.nnf_other_text].map(sentence).filter(Boolean);
  if (facts.length) p.push(facts.join(" "));

  const extra = [];
  if (a.date_from && a.date_to) extra.push(`The problem lasted from ${fmt(a.date_from)} to ${fmt(a.date_to)}.`);
  else if (a.date_from) extra.push(`The problem started on ${fmt(a.date_from)}.`);
  const subj = company || ch ? "The company" : "I";
  if (a.filed_date) {
    extra.push(a.filed_asap === "yes"
      ? `${subj} ${filedVerb} ${doc} on ${fmt(a.filed_date)}, as soon as ${company || ch ? "it was" : "I was"} able to.`
      : `${subj} ${filedVerb} ${doc} on ${fmt(a.filed_date)}.`);
  } else if (a.filed_asap === "yes") {
    extra.push(`${subj} ${filedVerb} ${doc} as soon as ${company || ch ? "it was" : "I was"} able to.`);
  }
  const ev = (a.evidence ?? []).filter((k) => EVIDENCE_EN[k]).map((k) => EVIDENCE_EN[k]);
  if (ev.length) extra.push(`I can provide ${list(ev)} if you need it.`);
  if (extra.length) p.push(extra.join(" "));

  if (a.why_late) p.push(`I am making this appeal after the 30-day time limit because: ${sentence(a.why_late)}`);

  if (a.reason === "never_needed_to_file") {
    p.push(`Missing ${deadline} was not intentional. I did not believe I needed to file a tax return for that year.`);
  } else {
    p.push(`Missing ${deadline} was not intentional. It happened because ${BECAUSE_CLOSE[a.reason] || "of the circumstances described above"}.`);
  }
  p.push("Thank you for considering this appeal. I look forward to a favourable decision.");
  return p.join("\n\n");
}
