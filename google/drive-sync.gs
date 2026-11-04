/**
 * Tax Letter Sorted – Google Drive copy (runs inside Eduard's own Google account).
 *
 * What it does, when the website sends something:
 *   - "Client register" sheet (tabs Clients, Quotes, Payments, Files log): one row per client, plus new quotes,
 *     payments and files added as new rows.
 *   - "Client files/<ref> – <name>/": 01 Onboarding (one "Case record" Google Doc, tables updated in place),
 *     02 Documents and 03 ID (the actual files).
 * Nothing is ever deleted or overwritten here: new information is added as new dated rows.
 *
 * Setup (once): paste this file into a new Apps Script project, run "setup", then deploy as a web app
 * (Execute as: Me · Who has access: Anyone). The secret shown by "setup" goes into Supabase, never into chat.
 * No API keys live in this file.
 */

const ROOT_FOLDER_NAME = 'Tax Letter Sorted';
const REGISTER_NAME = 'Client register';
const FILES_FOLDER_NAME = 'Client files';
const SUBFOLDERS = ['01 Onboarding', '02 Documents', '03 ID'];
const SECTIONS = ['Case and client', 'Service and payment', "Client's answers", 'Identity check (AML)', 'Appeal, agent and emails', 'Your notes'];
const TABS = {
  'Clients': ['Case ref', 'First contact', 'Client name', 'Business', 'Sole trader / Ltd', 'Company no.', 'Email', 'Phone', 'Address',
    'UTR', 'VAT no.', 'PAYE ref', 'AO ref', 'Letter type', 'Service', 'Status', 'ID check done', 'Drive folder', 'Last copied'],
  'Quotes': ['Date', 'Case ref', 'Client', 'Work quoted', 'One-off £', 'Monthly £', 'Months', 'Status', 'Source'],
  'Payments': ['Date', 'Case ref', 'Client', 'Product', 'Amount £', 'Stripe ref', 'Mode'],
  'Files log': ['Date copied', 'Case ref', 'Folder', 'File', 'Fingerprint (SHA-256)'],
};
const NAVY = '#14213D';

// ---------- run once by hand ----------
function setup() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('SECRET', secret);
  }
  const root = rootFolder_();
  register_();
  childFolder_(root, FILES_FOLDER_NAME);
  Logger.log('Setup done. Folder: ' + root.getName());
  Logger.log('SECRET (copy into Supabase as GDRIVE_SECRET): ' + secret);
}

// ---------- the website calls this ----------
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: 'bad_request' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || body.secret !== secret) return out_({ error: 'forbidden' });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (body.action === 'ping') return out_({ ok: true, folder: rootFolder_().getName() });
    if (body.action === 'case') return out_(syncCase_(body));
    if (body.action === 'file') return out_(saveFile_(body));
    if (body.action === 'quote') return out_(addRows_('Quotes', [body.row]));
    return out_({ error: 'action' });
  } catch (err) {
    return out_({ error: String(err && err.message || err).slice(0, 300) });
  } finally {
    lock.releaseLock();
  }
}

// body: { ref, folder_name, client_row: [...], sections: { "Service and payment": [[date, item, details], ...] },
//         quotes: [[...]], payments: [[...]] }
function syncCase_(b) {
  const folder = caseFolder_(b.ref, b.folder_name);
  const doc = caseDoc_(folder, b.ref, b.folder_name);
  let added = 0;
  Object.keys(b.sections || {}).forEach(function (name) {
    const rows = b.sections[name] || [];
    if (!rows.length) return;
    const table = sectionTable_(doc, name);
    rows.forEach(function (r) { appendRow_(table, r); added++; });
  });
  doc.saveAndClose();
  if (b.client_row) upsertClient_(b.ref, b.client_row.concat([folderPath_(b.folder_name)]));
  if ((b.quotes || []).length) addRows_('Quotes', b.quotes);
  if ((b.payments || []).length) addRows_('Payments', b.payments);
  return { ok: true, rows_added: added, folder_id: folder.getId() };
}

// body: { ref, folder_name, sub: "02 Documents" | "03 ID", name, mime, base64, sha256 }
function saveFile_(b) {
  if (SUBFOLDERS.indexOf(b.sub) < 0) return { error: 'sub' };
  const folder = childFolder_(caseFolder_(b.ref, b.folder_name), b.sub);
  const blob = Utilities.newBlob(Utilities.base64Decode(b.base64), b.mime || 'application/octet-stream', b.name);
  const f = folder.createFile(blob);
  addRows_('Files log', [[today_(), b.ref, b.sub, b.name, b.sha256 || '']]);
  return { ok: true, file_id: f.getId() };
}

// ---------- folders ----------
function rootFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ROOT_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const it = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  const f = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER_NAME);
  props.setProperty('ROOT_ID', f.getId());
  return f;
}
function childFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
// The client's folder is found by its case reference, so a later name change doesn't create a second folder
function caseFolder_(ref, name) {
  const files = childFolder_(rootFolder_(), FILES_FOLDER_NAME);
  const it = files.getFolders();
  while (it.hasNext()) { const f = it.next(); if (f.getName().indexOf(ref + ' ') === 0 || f.getName() === ref) return f; }
  const f = files.createFolder(name || ref);
  SUBFOLDERS.forEach(function (s) { f.createFolder(s); });
  return f;
}
function folderPath_(name) { return FILES_FOLDER_NAME + '/' + name; }

// ---------- the case record (Google Doc) ----------
function caseDoc_(folder, ref, name) {
  const onb = childFolder_(folder, SUBFOLDERS[0]);
  const it = onb.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (f.getMimeType() === MimeType.GOOGLE_DOCS && f.getName().indexOf('Case record') === 0) return DocumentApp.openById(f.getId());
  }
  const doc = DocumentApp.create('Case record – ' + (name || ref));
  DriveApp.getFileById(doc.getId()).moveTo(onb);
  const body = doc.getBody();
  body.clear();
  body.appendParagraph('Case record – ' + ref).setHeading(DocumentApp.ParagraphHeading.TITLE).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph('Each section is updated in place: new information is added as a new dated row. You can add rows yourself (right-click a row → Insert row below).')
    .editAsText().setForegroundColor('#4A5568');
  SECTIONS.forEach(function (s) { newSection_(body, s); });
  return doc;
}
function newSection_(body, name) {
  body.appendParagraph(name).setHeading(DocumentApp.ParagraphHeading.HEADING2).editAsText().setItalic(true);
  const t = body.appendTable([['Date', 'Item', 'Details']]);
  const h = t.getRow(0);
  for (let i = 0; i < 3; i++) {
    h.getCell(i).setBackgroundColor(NAVY);
    h.getCell(i).editAsText().setBold(true).setForegroundColor('#FFFFFF');
  }
  t.setColumnWidth(0, 80); t.setColumnWidth(1, 130);
  if (name === "Your notes") appendRow_(t, ['', '', '']);
  return t;
}
// Finds the table that follows the section heading (creates the section if it is missing)
function sectionTable_(doc, name) {
  const body = doc.getBody();
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH && el.asParagraph().getText().trim() === name) {
      for (let j = i + 1; j < body.getNumChildren(); j++) {
        const nx = body.getChild(j);
        if (nx.getType() === DocumentApp.ElementType.TABLE) return nx.asTable();
        if (nx.getType() === DocumentApp.ElementType.PARAGRAPH && nx.asParagraph().getHeading() !== DocumentApp.ParagraphHeading.NORMAL) break;
      }
    }
  }
  return newSection_(body, name);
}
function appendRow_(table, r) {
  const row = table.appendTableRow();
  for (let i = 0; i < 3; i++) {
    const c = row.appendTableCell(String(r[i] == null ? '' : r[i]));
    c.setBackgroundColor('#FFFFFF');
    c.editAsText().setForegroundColor('#000000').setBold(i === 1);
  }
}

// ---------- the register (Google Sheet) ----------
function register_() {
  const root = rootFolder_();
  const it = root.getFilesByName(REGISTER_NAME);
  let ss;
  if (it.hasNext()) ss = SpreadsheetApp.open(it.next());
  else {
    ss = SpreadsheetApp.create(REGISTER_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(root);
  }
  Object.keys(TABS).forEach(function (name, i) {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = i === 0 && ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0 ? ss.getSheets()[0].setName(name) : ss.insertSheet(name);
      sh.appendRow(TABS[name]);
      sh.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold').setFontColor('#FFFFFF').setBackground(NAVY);
      sh.setFrozenRows(1);
    }
  });
  return ss;
}
function addRows_(tab, rows) {
  const sh = register_().getSheetByName(tab);
  rows.forEach(function (r) { sh.appendRow(r); });
  return { ok: true, rows: rows.length };
}
// One row per client: updated in place (found by case ref); "Last copied" set to today
function upsertClient_(ref, values) {
  const sh = register_().getSheetByName('Clients');
  const row = values.concat([today_()]);
  const refs = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (x) { return String(x[0]); }) : [];
  const i = refs.indexOf(ref);
  if (i < 0) sh.appendRow(row);
  else {
    // keep anything Eduard typed: only fill cells that the website sends with a value
    const range = sh.getRange(i + 2, 1, 1, row.length), cur = range.getValues()[0];
    range.setValues([row.map(function (v, k) { return v === '' || v == null ? cur[k] : v; })]);
  }
}

function today_() { return Utilities.formatDate(new Date(), 'Europe/London', 'dd MMM yyyy'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
