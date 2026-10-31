// Builds a plain English appeal letter (Corporation Tax, Companies House and other penalties
// that have no official form). Works in Deno and Node: pass in the pdf-lib module.
//
// data = {
//   from_lines: ["ACME LTD", "1 High Street", "Town", "AB1 2CD"],
//   contact: "Phone: 07000 000000 · Email: name@example.com",
//   date: "2026-10-31",
//   to_lines: ["Corporation Tax Services", "HM Revenue and Customs", "BX9 1AX"],
//   subject: "Appeal against late filing penalty",
//   ref_lines: ["Company: ACME LTD (12345678)", "Penalty notice dated: 1 October 2026"],
//   body: "the full appeal text (paragraphs separated by blank lines)",
//   signer: "Jane Smith", signer_role: "Director",
//   footer: "Prepared with Tax Letter Sorted by Accounted4Tax"
// }
// The signature space is left empty: the director signs by hand (or by e-signature on Option 3).

export async function buildLetter(PDFLib, data) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  doc.setTitle(data.subject ?? "Appeal letter");
  doc.setProducer("Tax Letter Sorted");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.09, 0.12);
  const W = 595.28, H = 841.89, L = 64, R = W - 64, width = R - L;
  let page = doc.addPage([W, H]);
  let y = H - 64;

  function wrap(text, f, size, w) {
    const out = [];
    for (const para of String(text ?? "").split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const t = line ? line + " " + word : word;
        if (f.widthOfTextAtSize(t, size) <= w) line = t; else { if (line) out.push(line); line = word; }
      }
      out.push(line);
    }
    return out;
  }
  function need(h) { if (y - h < 70) { footer(); page = doc.addPage([W, H]); y = H - 64; } }
  function line(text, opts = {}) {
    const size = opts.size ?? 11, f = opts.bold ? bold : font, lead = opts.lead ?? size * 1.45;
    for (const ln of wrap(text, f, size, opts.width ?? width)) {
      need(lead);
      if (ln) {
        const x = opts.right ? R - f.widthOfTextAtSize(ln, size) : (opts.x ?? L);
        page.drawText(ln, { x, y, size, font: f, color: ink });
      }
      y -= ln ? lead : lead * 0.5;
    }
  }
  function gap(h) { y -= h; }
  function footer() {
    if (!data.footer) return;
    const size = 8, t = data.footer;
    page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y: 36, size, font, color: rgb(0.45, 0.48, 0.55) });
  }

  // sender, top right
  for (const s of data.from_lines ?? []) line(s, { right: true, size: 10.5, lead: 14 });
  if (data.contact) line(data.contact, { right: true, size: 9.5, lead: 13 });
  gap(14);
  // recipient, left
  for (const s of data.to_lines ?? []) line(s, { size: 10.5, lead: 14 });
  gap(14);
  line(fmtDate(data.date), { size: 10.5 });
  gap(10);
  line("Dear Sir or Madam,");
  gap(6);
  line(data.subject ?? "Appeal", { bold: true });
  for (const s of data.ref_lines ?? []) line(s, { size: 10.5, lead: 14.5 });
  gap(8);
  for (const para of String(data.body ?? "").split(/\n\s*\n/)) { line(para); gap(6); }
  gap(4);
  line("Yours faithfully,");
  need(70);
  gap(46);                                   // space for the signature
  page.drawLine({ start: { x: L, y: y + 14 }, end: { x: L + 200, y: y + 14 }, thickness: 0.6, color: rgb(0.6, 0.62, 0.68) });
  line(data.signer ?? "", { bold: true });
  if (data.signer_role) line(data.signer_role);
  footer();
  return await doc.save();
}

function fmtDate(iso) {
  const d = new Date(String(iso ?? new Date().toISOString()).slice(0, 10) + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
