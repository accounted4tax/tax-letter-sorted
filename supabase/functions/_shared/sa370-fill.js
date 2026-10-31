// Fills HMRC's SA370 appeal form (version HMRC 01/20) by writing text at fixed positions.
// The form has no fillable fields. Positions come from forms/sa370-map.json.
// Works in Deno (Supabase Edge Functions) and Node: pass in the pdf-lib module.
//
// data = {
//   tax_reference, full_name, address_lines: [], postcode, ni_number, phone, capacity,
//   tax_year_end: "2025",
//   penalties: { filing_1day: { date }, filing_3m: { amount, date }, ... payment_12m: {...} },
//   reason_tick: "ill_health" | ... | "other",
//   description: "plain English text"
// }
// Signature and the signing date are left blank on purpose: the client signs and dates by hand.

export async function fillSA370(PDFLib, templateBytes, map, data) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.05, 0.1, 0.35);           // dark blue, like blue ink
  const pages = doc.getPages();
  const H = pages[0].getHeight();
  const F = map.fields, BW = map.box_w, BH = map.box_h;
  const page = (n) => pages[n - 1];

  // one character centred in each box
  function cells(p, top, xs, text) {
    const chars = String(text ?? "").toUpperCase().replace(/\s+/g, "").split("");
    chars.slice(0, xs.length).forEach((ch, i) => {
      const size = 11, w = bold.widthOfTextAtSize(ch, size);
      page(p).drawText(ch, { x: xs[i] + (BW - w) / 2, y: H - top - BH + 4.5, size, font: bold, color: ink });
    });
  }
  // right-aligned whole pounds in the amount boxes
  function amount(p, top, value) {
    const pounds = String(Math.floor(Number(value) || 0));
    const xs = F.amount_cells.slice(-pounds.length);
    cells(p, top, xs, pounds);
  }
  function date(p, top, iso) {
    if (!iso) return;
    const [y, m, d] = String(iso).slice(0, 10).split("-");
    cells(p, top, F.date_cells, d + m + y);
  }
  function wrap(text, f, size, width) {
    const out = [];
    for (const para of String(text ?? "").split(/\n/)) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const test = line ? line + " " + word : word;
        if (f.widthOfTextAtSize(test, size) <= width) line = test;
        else { if (line) out.push(line); line = word; }
      }
      out.push(line);
    }
    return out;
  }
  function boxText(p, box, text, opts = {}) {
    const [x, top, w, h] = box, size = opts.size ?? 10, lead = opts.lead ?? size + 2.5, f = opts.font ?? font;
    const lines = Array.isArray(text) ? text : wrap(text, f, size, w - 8);
    const max = Math.floor((h - 4) / lead) || 1;
    const shown = lines.slice(0, max);
    const startY = h <= 20 ? H - top - h + 4.8 : H - top - 3 - size;
    shown.forEach((ln, i) => page(p).drawText(ln, { x: x + 4, y: startY - i * lead, size, font: f, color: ink }));
    return lines.slice(max);                     // anything that didn't fit
  }

  // ---- About you ----
  cells(1, F.tax_reference.top, F.tax_reference.cells, data.tax_reference);
  boxText(1, F.full_name.box, String(data.full_name ?? "").toUpperCase());
  const addr = (data.address_lines ?? []).filter(Boolean).map((s) => String(s).toUpperCase());
  const rows = F.address.row_tops;
  const fitted = addr.length > rows.length ? addr.slice(0, rows.length - 1).concat(addr.slice(rows.length - 1).join(", ")) : addr;
  fitted.forEach((ln, i) => boxText(1, [F.address.x, rows[i], F.address.w, F.address.row_h], ln));
  boxText(1, F.postcode.box, String(data.postcode ?? "").toUpperCase());
  if (data.ni_number) cells(1, F.ni_number.top, F.ni_number.cells, data.ni_number);

  // ---- Penalties ----
  cells(1, F.tax_year_end.top, F.tax_year_end.cells, data.tax_year_end);
  for (const [key, row] of Object.entries(F.rows)) {
    const pen = data.penalties?.[key];
    if (!pen) continue;
    if (row.x_box) {
      cells(row.page, row.x_box[1], [row.x_box[0]], "X");
    } else if (pen.amount != null) {
      amount(row.page, row.amount_top, pen.amount);
    }
    date(row.page, row.date_top, pen.date);
  }

  // ---- Reason ----
  const tick = F.reason_ticks[data.reason_tick] ?? F.reason_ticks.other;
  cells(tick[0], tick[2], [tick[1]], "X");

  let rest = boxText(2, F.description.box, data.description, { size: 9.5, lead: 11.5 });
  if (rest.length) {
    // continuation sheet, as the form itself asks ("continue on a separate sheet ... attach to the back")
    const allLines = wrap(data.description, font, 9.5, F.description.box[2] - 8);
    const fits = allLines.length - rest.length;
    // redraw the box ending with a pointer to the continuation sheet
    rest = allLines.slice(fits - 1);
    page(2).drawRectangle({ x: F.description.box[0] + 1, y: H - F.description.box[1] - F.description.box[3] + 1,
      width: F.description.box[2] - 2, height: 12.5, color: rgb(1, 1, 1) });
    page(2).drawText("(continued on the attached sheet)", { x: F.description.box[0] + 4,
      y: H - F.description.box[1] - F.description.box[3] + 4, size: 9.5, font: bold, color: ink });
    const extra = doc.addPage([595.28, 841.89]);
    const head = [
      "SA370 Appeal – continuation sheet",
      `Name: ${data.full_name ?? ""}    Tax reference: ${data.tax_reference ?? ""}    Tax year ended 5 April ${data.tax_year_end ?? ""}`,
    ];
    extra.drawText(head[0], { x: 50, y: 790, size: 14, font: bold, color: rgb(0, 0, 0) });
    extra.drawText(head[1], { x: 50, y: 770, size: 10, font, color: rgb(0, 0, 0) });
    extra.drawText("Your reason for making an appeal (continued)", { x: 50, y: 745, size: 11, font: bold, color: rgb(0, 0, 0) });
    let y = 725;
    for (const ln of rest) { extra.drawText(ln, { x: 50, y, size: 10, font, color: ink }); y -= 13.5; if (y < 60) break; }
  }

  // ---- What to do next ----
  if (data.phone) boxText(2, F.phone.box, data.phone);
  if (data.capacity) boxText(2, F.capacity.box, data.capacity);

  return await doc.save();
}

// Which SA370 row a penalty from the letter belongs to (from the reader's description).
export function sa370Row(description, letterType) {
  const d = String(description ?? "").toLowerCase();
  const pay = letterType === "sa-late-payment" || /payment|paying|paid/.test(d);
  if (pay) {
    if (/12\s*month/.test(d)) return "payment_12m";
    if (/6\s*month/.test(d)) return "payment_6m";
    return "payment_30d";
  }
  if (/12\s*month/.test(d)) return "filing_12m";
  if (/6\s*month/.test(d)) return "filing_6m";
  if (/daily|3\s*month|£?10 a day/.test(d)) return "filing_3m";
  return "filing_1day";
}
