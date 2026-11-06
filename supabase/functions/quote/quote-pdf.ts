// Practice quote PDF (Accounted4Tax letterhead), built with pdf-lib. Same design as the Birsan quote (6 Nov 2026).
// deno-lint-ignore-file no-explicit-any
import * as PDFLib from "npm:pdf-lib@1.17.1";

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = PDFLib as any;
const NAVY = rgb(0x14 / 255, 0x21 / 255, 0x3d / 255), TEAL = rgb(0x0e / 255, 0x6e / 255, 0x6b / 255);
const GREY = rgb(0x4a / 255, 0x55 / 255, 0x68 / 255), LIGHT = rgb(0xf2 / 255, 0xf4 / 255, 0xf7 / 255), LINE = rgb(0xd9 / 255, 0xde / 255, 0xe5 / 255);
const WHITE = rgb(1, 1, 1), BLACK = rgb(0.08, 0.08, 0.1);
const MM = 72 / 25.4;

export type QItem = { section: "oneoff" | "yearend" | "monthly"; label: string; qty: number; price: number };
export type Quote = {
  number: string; date: string; valid_until: string; spread_months: number;
  client: { name?: string; company_name?: string; company_number?: string; address?: string; email?: string };
  items: QItem[]; notes?: string; accept_url: string;
};
export const gbp = (n: number) => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function totals(items: QItem[], months: number) {
  const sum = (s: string) => Math.round(items.filter((i) => i.section === s).reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100;
  const oneoff = sum("oneoff"), yearend = sum("yearend"), monthly_services = sum("monthly");
  const m = Math.max(1, Math.round(months || 12));
  const yearend_monthly = Math.round((yearend / m) * 100) / 100;
  const monthly_total = Math.round((yearend_monthly + monthly_services) * 100) / 100;
  return { oneoff, yearend, yearend_monthly, monthly_services, monthly_total, months: m };
}
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export async function buildQuotePdf(q: Quote): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Quote ${q.number}`); doc.setAuthor("Accounted4Tax Ltd");
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, L = 18 * MM, R = W - 18 * MM, CW = R - L;
  let page: any, y = 0;

  const wrap = (text: string, f: any, size: number, width: number) => {
    const out: string[] = [];
    for (const para of String(text).split("\n")) {
      let line = "";
      for (const w of para.split(/\s+/)) {
        const t = line ? line + " " + w : w;
        if (f.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = w; } else line = t;
      }
      out.push(line);
    }
    return out;
  };
  const newPage = () => {
    page = doc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: H - 30 * MM, width: W, height: 30 * MM, color: NAVY });
    page.drawText("Accounted4Tax", { x: L, y: H - 15 * MM, size: 20, font: bold, color: WHITE });
    page.drawText("Accountants for sole traders, contractors and limited companies", { x: L, y: H - 21.5 * MM, size: 9, font, color: WHITE });
    ["Accounted4Tax Ltd", "128 City Road, London, EC1V 2NX", "info@accounted4tax.co.uk · 07563 811938"].forEach((t, i) =>
      page.drawText(t, { x: R - font.widthOfTextAtSize(t, 8.5), y: H - 11 * MM - i * 4.6 * MM, size: 8.5, font, color: WHITE }));
    const foot = "Accounted4Tax Ltd · Registered in England and Wales, company number 16438537 · Registered office 128 City Road, London, EC1V 2NX · Not VAT registered";
    page.drawText(foot, { x: (W - font.widthOfTextAtSize(foot, 7)) / 2, y: 10 * MM, size: 7, font, color: GREY });
    y = H - 38 * MM;
  };
  const need = (h: number) => { if (y - h < 22 * MM) newPage(); };
  const text = (t: string, opt: { size?: number; f?: any; color?: any; x?: number; width?: number; gap?: number } = {}) => {
    const size = opt.size ?? 9.5, f = opt.f ?? font, lines = wrap(t, f, size, opt.width ?? CW);
    for (const ln of lines) { need(size + 4); page.drawText(ln, { x: opt.x ?? L, y: y - size, size, font: f, color: opt.color ?? BLACK }); y -= size + (opt.gap ?? 3.5); }
  };
  const heading = (t: string) => { need(30); y -= 6; text(t, { size: 11.5, f: bold, color: NAVY }); y -= 1; };
  const row = (label: string, value: string, highlight = false) => {
    const lw = CW - 60 * MM, lines = wrap(label, highlight ? bold : font, 9.5, lw - 8);
    const h = Math.max(1, lines.length) * 12.5 + 6;
    need(h);
    if (highlight) page.drawRectangle({ x: L, y: y - h, width: CW, height: h, color: LIGHT });
    lines.forEach((ln, i) => page.drawText(ln, { x: L + 4, y: y - 12 - i * 12.5 + 2, size: 9.5, font: highlight ? bold : font, color: BLACK }));
    const vf = highlight ? bold : font;
    page.drawText(value, { x: R - 4 - vf.widthOfTextAtSize(value, 9.5), y: y - 12 + 2, size: 9.5, font: vf, color: BLACK });
    page.drawLine({ start: { x: L, y: y - h }, end: { x: R, y: y - h }, thickness: 0.4, color: LINE });
    y -= h;
  };
  const bar = (label: string, value: string) => {
    need(32); y -= 4;
    page.drawRectangle({ x: L, y: y - 26, width: CW, height: 26, color: TEAL });
    page.drawText(label, { x: L + 8, y: y - 17, size: 12, font: bold, color: WHITE });
    page.drawText(value, { x: R - 8 - bold.widthOfTextAtSize(value, 14), y: y - 18, size: 14, font: bold, color: WHITE });
    y -= 30;
  };
  const lineLabel = (i: QItem) => i.qty !== 1 ? `${i.label} (${i.qty} × ${gbp(i.price)})` : i.label;

  newPage();
  page.drawText("QUOTE", { x: L, y: y - 18, size: 18, font: bold, color: NAVY }); y -= 28;
  // client box
  const c = q.client;
  const leftLines = ["Prepared for", c.name ? c.name + (c.company_name ? ", Director" : "") : "", c.company_name ?? "", c.company_number ? "Company number " + c.company_number : "", ...(c.address ? wrap(c.address, font, 9.5, 90 * MM) : [])].filter(Boolean);
  const rightLines = [["Date", fmtDate(q.date)], ["Quote reference", q.number], ["Valid until", fmtDate(q.valid_until)]];
  const boxH = Math.max(leftLines.length, rightLines.length) * 13 + 12;
  page.drawRectangle({ x: L, y: y - boxH, width: CW, height: boxH, color: LIGHT });
  leftLines.forEach((t, i) => page.drawText(t, { x: L + 8, y: y - 15 - i * 13, size: 9.5, font: i === 0 ? bold : font, color: BLACK }));
  rightLines.forEach(([k, v], i) => { page.drawText(k + ": ", { x: L + 100 * MM, y: y - 15 - i * 13, size: 9.5, font: bold, color: BLACK });
    page.drawText(v, { x: L + 100 * MM + bold.widthOfTextAtSize(k + ": ", 9.5), y: y - 15 - i * 13, size: 9.5, font, color: BLACK }); });
  y -= boxH + 6;

  const t = totals(q.items, q.spread_months);
  const by = (s: string) => q.items.filter((i) => i.section === s && i.label);
  let n = 1;
  if (by("oneoff").length) {
    heading(`${n++}. Catch-up work (one-off)`);
    by("oneoff").forEach((i) => row(lineLabel(i), gbp(i.qty * i.price)));
    row("Total catch-up work (paid once)", gbp(t.oneoff), true);
  }
  if (by("yearend").length) {
    heading(`${n++}. Year-end services`);
    by("yearend").forEach((i) => row(lineLabel(i), gbp(i.qty * i.price)));
    row("Total year-end services", gbp(t.yearend), true);
    row(`Spread over ${t.months} month${t.months === 1 ? "" : "s"}`, gbp(t.yearend_monthly) + " a month", true);
  }
  if (by("monthly").length) {
    heading(`${n++}. Monthly services`);
    by("monthly").forEach((i) => row(lineLabel(i), gbp(i.qty * i.price) + " a month"));
    row("Total monthly services", gbp(t.monthly_services) + " a month", true);
  }
  if (t.monthly_total > 0) {
    heading(`${n++}. Your monthly fee`);
    if (t.yearend) row(`Year-end services (spread over ${t.months} months)`, gbp(t.yearend_monthly));
    if (t.monthly_services) row("Monthly services", gbp(t.monthly_services));
    bar("Total monthly fee", gbp(t.monthly_total) + " a month");
  }
  if (t.oneoff > 0) bar("One-off catch-up fee", gbp(t.oneoff));

  if (q.notes?.trim()) { heading("Key information"); text(q.notes.trim()); }
  heading("Notes");
  const notes = [
    "Accounted4Tax Ltd is not VAT registered, so no VAT is added to these prices.",
    "If the work needed changes (for example more employees or transactions, or extra services), we will tell you the cost before doing any extra work.",
    t.monthly_total > 0 ? "The monthly fee is collected automatically each month by card through Stripe." : "",
    `This quote is valid until ${fmtDate(q.valid_until)}. Click "Accept this quote" to accept it and pay securely online; we will then send you our engagement letter.`,
  ].filter(Boolean);
  for (const s of notes) text("• " + s, { size: 8.5, color: GREY, gap: 3 });

  // Accept button → the private quote page (accept and pay)
  need(60); y -= 10;
  const bw = 70 * MM, bh = 11 * MM, bx = (W - bw) / 2, byy = y - bh;
  page.drawRectangle({ x: bx, y: byy, width: bw, height: bh, color: TEAL });
  const label = "Accept this quote";
  page.drawText(label, { x: bx + (bw - bold.widthOfTextAtSize(label, 12)) / 2, y: byy + bh / 2 - 4, size: 12, font: bold, color: WHITE });
  const link = doc.context.register(doc.context.obj({
    Type: "Annot", Subtype: "Link", Rect: [bx, byy, bx + bw, byy + bh], Border: [0, 0, 0],
    A: { Type: "Action", S: "URI", URI: PDFString.of(q.accept_url) },
  }));
  const annots = page.node.lookup(PDFName.of("Annots"));
  if (annots) annots.push(link); else page.node.set(PDFName.of("Annots"), doc.context.obj([link]));
  y = byy - 6;
  const hint = "Opens a secure page where you can accept and pay. You can also reply to our email or call 07563 811938.";
  page.drawText(hint, { x: (W - font.widthOfTextAtSize(hint, 8)) / 2, y: y - 8, size: 8, font, color: GREY });

  return await doc.save();
}
