/* SMARTSELL deck — premium redesign (content preserved from v1). */
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fi = require('react-icons/fi');
const QRCode = require('qrcode');
const fs = require('fs');
const { applyTheme } = require(process.env.SKILL_DIR + '/scripts/apply_theme.js');

const OUT = process.argv[2];
const ROOT = '/home/user/Combating-Loneliness/loreal-sales-track/deck/';
const SHOTS = ROOT + 'screens/';
const LOGO_BLACK = ROOT + 'brand/loreal-logo-black.png';
const LOGO_WHITE = ROOT + 'brand/loreal-logo-white.png';
const LOGO_AR = 2000 / 360;
const LIVE = 'https://smartsell-loreal.vercel.app';
const NOTES = JSON.parse(fs.readFileSync(__dirname + '/notes.json', 'utf8'));

// ---------- design system ----------
const P = {
  burg: '65172F', char: '171717', ivory: 'F7F5F1', stone: 'A9A096', green: '327B60', white: 'FFFFFF',
  burg2: '8C3A52', burg3: 'B9808F', burgL: 'EFE3E6', stoneD: '6E665E', stoneL: 'E3DED7', greenL: 'E2EEE8', char2: '3A3A3A',
};
const THEME = {
  name: 'SMARTSELL Editorial',
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  colors: { dk1: P.char, lt1: P.white, dk2: P.stoneD, lt2: P.ivory, accent1: P.burg, accent2: P.stone, accent3: P.green, accent4: P.burg2, accent5: P.burg3, accent6: P.char2, hlink: P.burg, folHlink: P.burg2 },
};
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'SMARTSELL: Turning Field Sales into a Growth and Sustainability Engine';
pres.subject = "L'Oréal Sustainability Challenge 2026, Sales Track";
pres.author = 'SMARTSELL team';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const ML = 0.7, CW = 11.933, RIGHT = ML + CW; // 12.633

// ---------- layouts ----------
const footer = (dark) => [
  { text: { text: 'SMARTSELL', options: { x: 10.9, y: 6.98, w: 1.15, h: 0.28, fontSize: 10, bold: true, color: dark ? P.burgL : P.burg, align: 'right', margin: 0, charSpacing: 1 } } },
];
const logoObj = (white, x = RIGHT - 1.25, y = 0.5, w = 1.25) => ({ image: { path: white ? LOGO_WHITE : LOGO_BLACK, x, y, w, h: w / LOGO_AR } });
const titlePH = (color) => ({ placeholder: { options: { name: 'title', type: 'title', x: ML, y: 0.82, w: 10.3, h: 1.1, fontFace: 'Aptos Display', fontSize: 30, bold: true, color, margin: 0, valign: 'top', align: 'left', lineSpacingMultiple: 0.95 }, text: '' } });
const kickerPH = (color) => ({ placeholder: { options: { name: 'kicker', type: 'body', x: ML, y: 0.5, w: 9.5, h: 0.26, fontSize: 11, bold: true, color, charSpacing: 2, margin: 0, valign: 'top' }, text: '' } });
const sourcePH = (color) => ({ placeholder: { options: { name: 'source', type: 'body', x: ML, y: 6.95, w: 10.05, h: 0.38, fontSize: 10, color, margin: 0, valign: 'top' }, text: '' } });
const num = (color) => ({ x: 12.13, y: 6.98, w: 0.5, h: 0.28, fontSize: 10, color, align: 'right' });

pres.defineSlideMaster({ title: 'LIGHT', background: { color: P.white }, margin: [0.5, 0.7, 0.6, 0.7], objects: [logoObj(false), kickerPH(P.burg), titlePH(P.char), sourcePH(P.stoneD), ...footer(false)], slideNumber: num(P.stoneD) });
pres.defineSlideMaster({ title: 'IVORY', background: { color: P.ivory }, margin: [0.5, 0.7, 0.6, 0.7], objects: [logoObj(false), kickerPH(P.burg), titlePH(P.char), sourcePH(P.stoneD), ...footer(false)], slideNumber: num(P.stoneD) });
pres.defineSlideMaster({ title: 'NIGHT', background: { color: P.char }, margin: [0.5, 0.7, 0.6, 0.7], objects: [logoObj(true), kickerPH(P.burg3), titlePH(P.white), sourcePH(P.stone), ...footer(true)], slideNumber: num(P.stone) });
pres.defineSlideMaster({ title: 'BURGUNDY', background: { color: P.burg }, objects: [], slideNumber: num(P.burgL) });

// ---------- helpers ----------
let n = 0; const nm = (s) => `${s}-${++n}`;
function slide(master, section, kicker, title, source, notesIdx) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (kicker) s.addText(kicker.toUpperCase(), { placeholder: 'kicker' });
  if (title) s.addText(title, { placeholder: 'title' });
  if (source) s.addText(source, { placeholder: 'source' });
  if (notesIdx !== undefined) s.addNotes(NOTES[notesIdx]);
  return s;
}
function t(s, text, o) { s.addText(text, { isTextBox: true, margin: 0, valign: 'top', color: P.char, fontSize: 14, objectName: nm('text'), ...o }); }
function rect(s, x, y, w, h, fill, o = {}) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm('rect'), ...o }); }
function rrect(s, x, y, w, h, fill, r = 0.06, o = {}) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: r, objectName: nm('rrect'), ...o }); }
function line(s, x, y, w, h, color = P.stoneL, width = 1, o = {}) { s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color, width, ...o }, objectName: nm('line') }); }
function dot(s, x, y, d, fill) { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm('dot') }); }
function marker(s, k, x, y, d = 0.34, fill = P.burg) { dot(s, x, y, d, fill); t(s, String(k), { x, y, w: d, h: d, fontSize: d > 0.3 ? 12 : 10, bold: true, color: P.white, align: 'center', valign: 'middle' }); }
function label(s, text, x, y, w, color = P.stoneD) { t(s, text.toUpperCase(), { x, y, w, h: 0.26, fontSize: 10.5, bold: true, color, charSpacing: 1.5 }); }
const iconCache = {};
async function icon(name, hex) {
  const k = name + hex; if (iconCache[k]) return iconCache[k];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fi[name], { color: '#' + hex, size: 256, strokeWidth: 1.75 }));
  iconCache[k] = 'image/png;base64,' + (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64');
  return iconCache[k];
}
function shot(s, file, x, y, w, ratio = 1.6, alt = 'SMARTSELL prototype screenshot', dark = false) {
  const h = w / ratio;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: P.white }, line: { color: dark ? '2E2E2E' : P.stoneL, width: 0.75 }, shadow: { type: 'outer', color: '000000', opacity: dark ? 0.35 : 0.14, blur: 10, offset: 3, angle: 90 }, objectName: nm('shot-frame') });
  s.addImage({ path: SHOTS + file, x, y, w, h, objectName: nm('screenshot'), altText: alt });
  return h;
}
function browser(s, file, x, y, w, ratio, alt) {
  const bar = 0.24, h = w / ratio;
  rrect(s, x, y, w, h + bar, '2A2A2A', 0.04, { shadow: { type: 'outer', color: '000000', opacity: 0.35, blur: 12, offset: 4, angle: 90 } });
  [0, 1, 2].forEach((i) => dot(s, x + 0.12 + i * 0.13, y + 0.08, 0.08, ['E06C5A', 'E2B04A', '5DAE6B'][i]));
  t(s, 'smartsell-loreal.vercel.app', { x: x + 0.6, y: y + 0.04, w: w - 1.2, h: 0.16, fontSize: 8, color: P.stone, align: 'center' });
  s.addImage({ path: SHOTS + file, x, y: y + bar, w, h, objectName: nm('screenshot'), altText: alt });
  return h + bar;
}
function phone(s, x, y, w, alt) {
  const ih = w * (2532 / 1170), pad = 0.09;
  rrect(s, x - pad, y - pad, w + 2 * pad, ih + 2 * pad, '0E0E0E', 0.18, { shadow: { type: 'outer', color: '000000', opacity: 0.35, blur: 12, offset: 4, angle: 90 } });
  s.addImage({ path: SHOTS + '16-mobile-count.jpg', x, y, w, h: ih, objectName: nm('phone-shot'), altText: alt });
  return ih;
}
function table(s, rows, o) {
  const head = o.headFill || P.char;
  const body = rows.map((r, ri) => r.map((c, ci) => {
    const cell = typeof c === 'object' ? c : { text: String(c) };
    return { text: cell.text, options: { bold: ri === 0 || cell.bold || (o.boldCol0 && ci === 0), color: ri === 0 ? P.white : cell.color || (o.boldCol0 && ci === 0 ? P.burg : P.char), fill: { color: ri === 0 ? head : cell.fill || (o.zebra && ri % 2 === 0 ? P.ivory : P.white) }, align: cell.align || (ci === 0 ? 'left' : o.align || 'left'), fontSize: o.fontSize || 12 } };
  }));
  s.addTable(body, { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH, border: { type: 'solid', color: P.stoneL, pt: 0.5 }, valign: 'middle', margin: [3, 6, 3, 6], objectName: nm('table') });
}

(async () => {
  // ================= 1 COVER =================
  pres.addSection({ title: 'Opening' });
  {
    const s = pres.addSlide({ masterName: 'BURGUNDY', sectionTitle: 'Opening' });
    s.addImage({ path: LOGO_WHITE, x: ML, y: 0.62, w: 1.55, h: 1.55 / LOGO_AR, objectName: 'logo' });
    line(s, 2.48, 0.57, 0, 0.38, P.burg3, 0.75);
    t(s, 'SUSTAINABILITY CHALLENGE 2026 · SALES TRACK', { x: 2.65, y: 0.64, w: 5.5, h: 0.26, fontSize: 11, bold: true, color: P.burgL, charSpacing: 2 });
    t(s, 'SMARTSELL', { x: ML, y: 1.95, w: 6.6, h: 1.25, fontFace: 'Aptos Display', fontSize: 72, bold: true, color: P.white, charSpacing: -1 });
    t(s, 'Turning field sales into a growth and sustainability engine', { x: ML, y: 3.25, w: 6.0, h: 1.0, fontFace: 'Aptos Display', fontSize: 26, color: P.white });
    t(s, 'Move from selling more inventory into the channel to moving the right inventory to the right customer, at the right place and at the right time.', { x: ML, y: 4.5, w: 5.8, h: 0.95, fontSize: 15, color: P.burgL });
    label(s, 'Live prototype', ML, 6.05, 3, P.burg3);
    t(s, [{ text: 'smartsell-loreal.vercel.app', options: { hyperlink: { url: LIVE }, color: P.white, bold: true } }], { x: ML, y: 6.33, w: 4.5, h: 0.35, fontSize: 16 });
    t(s, 'All prototype data is synthetic', { x: 4.6, y: 6.38, w: 2.6, h: 0.3, fontSize: 11, color: P.burg3 });
    // devices
    rrect(s, 7.35, 1.5, 5.45, 3.62, '1A1A1A', 0.08, { shadow: { type: 'outer', color: '000000', opacity: 0.4, blur: 16, offset: 6, angle: 90 } });
    s.addImage({ path: SHOTS + '01-rep-beat-c.jpg', x: 7.5, y: 1.65, w: 5.15, h: 5.15 / 1.6, objectName: nm('laptop-screen'), altText: "Today's beat in SMARTSELL" });
    rrect(s, 6.95, 5.12, 6.25, 0.16, '2A2A2A', 0.08);
    rect(s, 9.7, 5.12, 0.75, 0.05, '3E3E3E');
    phone(s, 11.2, 3.05, 1.5, 'Smart Count on a phone');
    s.addNotes(NOTES[0]);
  }

  // ================= 2 EXEC SUMMARY =================
  {
    const s = slide('LIGHT', 'Opening', 'Executive summary', 'Less waste and more growth come from the same move: acting on the shelf before the order', "Sources: L'Oréal Sales Track case (≈1.5%, ≈1%); financials are illustrative estimates (Appendix C). Prototype data is synthetic.", 1);
    const cols = [
      ['01', 'Problem', '≈2.5% of revenue', '≈1.5% returned, expired or damaged plus ≈1% to handle it (case). Cutting orders only swaps waste for stock-outs.', P.burg],
      ['02', 'Insight', 'Decided at the order, found at the return', 'Reps visit the shop many times in between, but nothing asks them to act. Quick commerce is widening the gap.', P.char],
      ['03', 'Solution', 'A 4-minute visit routine', "See the at-risk SKUs, get ₹ at risk and days to act, take the cheapest sanctioned fix, rebalance across the beat, order to what will sell.", P.char],
      ['04', 'Impact', '≈₹18 cr a year, base case', 'About 3× its cost over 3 years (illustrative). In our live simulation, returns fell from 1.6% to 0.9% of sell-out.', P.green],
    ];
    line(s, ML + 0.14, 2.32, CW - 0.3, 0, P.stoneL, 1.25);
    cols.forEach(([k, lab, big, body, col], i) => {
      const x = ML + i * 3.05;
      dot(s, x, 2.18, 0.28, col);
      label(s, `${k}  ${lab}`, x, 2.62, 2.8, col);
      t(s, big, { x, y: 2.95, w: 2.75, h: 1.25, fontFace: 'Aptos Display', fontSize: 24, bold: true, color: P.char, lineSpacingMultiple: 0.95 });
      t(s, body, { x, y: 4.25, w: 2.7, h: 1.2, fontSize: 13, color: P.stoneD });
    });
    rect(s, ML, 5.6, CW, 1.05, P.burg);
    label(s, 'The ask', ML + 0.35, 5.75, 2, P.burg3);
    t(s, 'A 16-week, two-city pilot against control territories with clear scale and stop criteria. We need one distributor-data extract and a willing ASM.', { x: ML + 0.35, y: 6.02, w: 11.2, h: 0.55, fontSize: 16, color: P.white });
  }

  // ================= 3 PROBLEM: SUPPLY CHAIN =================
  pres.addSection({ title: 'The problem' });
  {
    const s = slide('LIGHT', 'The problem', 'The business problem', 'Every expired unit was sold once, and paid for twice', "Sources: L'Oréal Sustainability Challenge 2026 Sales Track case, p.2 (≈1.5% \"capped\", ≈1%). L'Oréal India FY25 net sales ₹5,925 cr (PTI via The Week, 3 Oct 2025). ₹148 cr is illustrative and assumes the case percentages apply to L'Oréal India.", 2);
    rrect(s, 3.85, 1.98, 5.5, 2.12, P.burgL, 0.06);
    t(s, 'WHERE INVENTORY GETS STUCK', { x: 3.85, y: 2.06, w: 5.5, h: 0.26, fontSize: 10.5, bold: true, color: P.burg, charSpacing: 1.5, align: 'center' });
    const nodes = [['FiHome', "L'Oréal", 'Plants & depots', 'Visible in ERP', P.green, 1.75], ['FiTruck', 'Distributor', 'Weeks of stock, many batches', 'Partly visible', P.stoneD, 5.05], ['FiShoppingBag', 'Retailer', 'Shelf + back room, no POS', 'Blind spot', P.burg, 8.15], ['FiUser', 'Consumer', 'The only real sale', 'Real demand', P.green, 11.45]];
    const cy = 2.85;
    for (let i = 0; i < 4; i++) {
      const [ic, name, sub, vis, vcol, cx] = nodes[i];
      const filled = i === 0 || i === 3;
      const fill = i === 0 ? P.burg : i === 3 ? P.green : P.white;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.45, y: cy - 0.45, w: 0.9, h: 0.9, fill: { color: fill }, line: { color: filled ? fill : P.burg, width: 1.75 }, objectName: nm('node') });
      s.addImage({ data: await icon(ic, filled ? P.white : P.burg), x: cx - 0.22, y: cy - 0.22, w: 0.44, h: 0.44, objectName: nm('node-icon') });
      t(s, name, { x: cx - 1.3, y: 3.4, w: 2.6, h: 0.32, fontSize: 16, bold: true, align: 'center' });
      t(s, sub, { x: cx - 1.3, y: 3.72, w: 2.6, h: 0.28, fontSize: 12, color: P.stoneD, align: 'center' });
      t(s, vis.toUpperCase(), { x: cx - 1.3, y: 4.18, w: 2.6, h: 0.24, fontSize: 10, bold: true, color: vcol, align: 'center', charSpacing: 1.5 });
      if (i < 3) line(s, cx + 0.55, cy, nodes[i + 1][5] - cx - 1.1, 0, P.stone, 2, { endArrowType: 'triangle' });
    }
    t(s, 'Sell-in · revenue booked', { x: 2.35, y: 2.45, w: 2.1, h: 0.25, fontSize: 11, bold: true, color: P.burg, align: 'center' });
    t(s, 'Secondary sales', { x: 5.55, y: 2.45, w: 2.1, h: 0.25, fontSize: 11, bold: true, color: P.stoneD, align: 'center' });
    t(s, 'Sell-out · real demand', { x: 8.75, y: 2.45, w: 2.1, h: 0.25, fontSize: 11, bold: true, color: P.green, align: 'center' });
    line(s, 1.75, 4.75, 6.4, 0, P.burg2, 1.25, { beginArrowType: 'triangle', dashType: 'dash' });
    t(s, 'Returns: credit note → reverse logistics → destruction', { x: 2.4, y: 4.82, w: 5.1, h: 0.26, fontSize: 11.5, color: P.burg2, align: 'center' });
    const stats = [['≈1.5%', 'of revenue returned, expired or damaged', 'Case data ("capped" at ≈1.5%)', P.burg], ['≈1%', 'more to handle, reverse-ship and destroy it', 'Case data', P.burg], ['≈₹148 cr', "a year at L'Oréal India's scale", 'Illustrative: 2.5% × ₹5,925 cr FY25 net sales', P.char]];
    stats.forEach(([big, lab, src, col], i) => {
      const x = ML + i * 4.0;
      if (i) line(s, x - 0.25, 5.45, 0, 1.2, P.stoneL, 1);
      t(s, big, { x, y: 5.25, w: 3.7, h: 0.75, fontFace: 'Aptos Display', fontSize: 40, bold: true, color: col });
      t(s, lab, { x, y: 6.02, w: 3.75, h: 0.3, fontSize: 13 });
      t(s, src, { x, y: 6.36, w: 3.75, h: 0.26, fontSize: 10.5, color: P.stoneD });
    });
  }

  // ================= 4 ROOT CAUSE: FISHBONE =================
  {
    const s = slide('LIGHT', 'The problem', 'Root cause', 'Waste is a visibility and execution problem, not just a forecasting problem', 'Sources: Dabur Q2 FY25 inventory correction (Sharekhan, 30 Oct 2024; Baroda Securities, 31 Oct 2024). Out-of-stock shopper response: Gruen, Corsten & Bharadwaj, GMA/FMI/CIES 2002 (global, not India). Rep-influence ratings are our assessment.', 3);
    const spineY = 3.85;
    line(s, 0.85, spineY, 6.55, 0, P.char, 2.5, { endArrowType: 'triangle' });
    rect(s, 7.45, 3.3, 1.75, 1.1, P.burg);
    t(s, [{ text: 'Stock ages, expires and returns', options: { bold: true, breakLine: true } }, { text: '≈2.5% of revenue', options: { fontSize: 11 } }], { x: 7.57, y: 3.36, w: 1.55, h: 1.0, fontSize: 13, color: P.white, valign: 'middle' });
    const top = [['Demand forecasting', "Central forecasts can't see outlet sell-out or batch age", P.stone], ['Visibility', 'No batch-age or sell-out view at the outlet', P.stoneD], ['Product velocity', 'Quick commerce and seasons shift demand faster than norms', P.stoneD]];
    const bot = [['Distributor ordering', 'Orders sized by habit, schemes and period-end loading', P.burg], ['Retailer inventory', 'Same range for every outlet; old batches hidden at the back', P.burg], ['Field execution', 'No trigger, no sanctioned actions, sell-in-only targets', P.burg]];
    top.forEach(([h, d, col], i) => {
      const x = 0.85 + i * 2.15;
      t(s, h, { x, y: 1.98, w: 2.0, h: 0.28, fontSize: 13.5, bold: true, color: col === P.stone ? P.stoneD : P.char });
      t(s, d, { x, y: 2.27, w: 1.95, h: 0.6, fontSize: 11, color: P.stoneD });
      line(s, x + 0.35, 2.95, 0.85, spineY - 2.95, col, 2);
    });
    bot.forEach(([h, d, col], i) => {
      const x = 0.85 + i * 2.15;
      line(s, x + 0.35, spineY, 0.85, 4.75 - spineY, col, 2, { flipV: true });
      t(s, h, { x, y: 4.85, w: 2.0, h: 0.28, fontSize: 13.5, bold: true, color: P.burg });
      t(s, d, { x, y: 5.14, w: 1.95, h: 0.6, fontSize: 11, color: P.stoneD });
    });
    // legend
    [['Rep controls it', P.burg], ['Partly', P.stoneD], ['Little control', P.stone]].forEach(([lab, col], i) => { dot(s, 0.85 + i * 1.75, 5.93, 0.14, col); t(s, lab, { x: 1.05 + i * 1.75, y: 5.86, w: 1.5, h: 0.28, fontSize: 11, color: P.stoneD }); });
    // why order less fails
    line(s, 9.62, 1.98, 0, 3.95, P.stoneL, 1);
    label(s, 'Why "just order less" fails', 9.85, 1.98, 2.8, P.burg);
    t(s, '30 → 21 days', { x: 9.85, y: 2.35, w: 2.8, h: 0.55, fontSize: 30, bold: true, color: P.burg });
    t(s, 'Dabur halted primary sales for 7–8 days to cut distributor stock, and guided to a revenue decline (Q2 FY25).', { x: 9.85, y: 2.92, w: 2.75, h: 0.95, fontSize: 12, color: P.stoneD });
    t(s, '≈1 in 3', { x: 9.85, y: 4.0, w: 2.8, h: 0.55, fontSize: 30, bold: true, color: P.burg });
    t(s, "shoppers facing a stock-out switch brand or don't buy at all (global study).", { x: 9.85, y: 4.57, w: 2.75, h: 0.75, fontSize: 12, color: P.stoneD });
    label(s, 'Key insight', ML, 6.25, 2, P.burg);
    t(s, 'Waste is decided when the order is taken and discovered when the return arrives. Nothing in today\'s visit asks the rep to look, tells them what they may do, or rewards them for doing it.', { x: 2.2, y: 6.2, w: 10.4, h: 0.62, fontSize: 14.5, bold: true, color: P.char });
  }

  // ================= 5 ARCHITECTURE =================
  pres.addSection({ title: 'The solution' });
  {
    const s = slide('IVORY', 'The solution', 'Our strategic solution', 'SMARTSELL turns every visit into early detection and the right action', "Design principle: a layer on L'Oréal's existing SFA/DMS, not a replacement. Rules-based and explainable; machine learning only where it earns its place (phase 3).", 4);
    label(s, 'Inputs', ML, 2.05, 2);
    ['Distributor DMS: stock and invoices', 'Rep Smart Count + barcode and batch scan', '12 simple field signals', 'Online / quick-commerce trend'].forEach((x, i) => {
      t(s, x, { x: ML, y: 2.45 + i * 0.72, w: 2.05, h: 0.6, fontSize: 13 });
      if (i < 3) line(s, ML, 3.07 + i * 0.72, 2.0, 0, P.stoneL, 0.75);
    });
    const mods = [['01', 'Stock Intelligence', 'Pre-visit brief, Smart Count, batch and expiry capture, stock-flow sell-out', P.burg], ['02', 'Risk Engine', 'FEFO projected waste, ₹ at risk, days to act, stock-out and channel-shift detection', P.burg2], ['03', 'Action Engine', '8-step intervention ladder, transfer matching, order guardrail, approvals', '7A2C44'], ['04', 'Manager Intelligence', 'Territory risk, approvals, repeat offenders, scorecards, outcomes vs business-as-usual', P.char]];
    line(s, 2.8, 3.75, 0.3, 0, P.char, 1.5, { endArrowType: 'triangle' });
    mods.forEach(([k, name, d, col], i) => {
      const x = 3.2 + i * 1.82;
      rect(s, x, 2.05, 1.66, 3.4, col);
      t(s, k, { x: x + 0.18, y: 2.22, w: 1.3, h: 0.3, fontSize: 12, bold: true, color: P.burg3 });
      t(s, name, { x: x + 0.18, y: 2.6, w: 1.35, h: 0.75, fontFace: 'Aptos Display', fontSize: 17, bold: true, color: P.white, lineSpacingMultiple: 0.95 });
      t(s, d, { x: x + 0.18, y: 3.45, w: 1.33, h: 1.9, fontSize: 11.5, color: 'F1E6E9' });
      if (i < 3) line(s, x + 1.66, 3.75, 0.16, 0, P.char, 1.5, { endArrowType: 'triangle' });
    });
    line(s, 10.48, 3.75, 0.3, 0, P.char, 1.5, { endArrowType: 'triangle' });
    label(s, 'Who acts on it', 10.9, 2.05, 1.8);
    [['Field rep', "today's actions"], ['ASM', 'approvals, scorecard'], ['Distributor', 'transfer tasks'], ['Q-comm KAM', 'channel-shift flags']].forEach(([u, g], i) => {
      t(s, [{ text: u, options: { bold: true, breakLine: true } }, { text: g, options: { color: P.stoneD, fontSize: 11.5 } }], { x: 10.9, y: 2.45 + i * 0.72, w: 1.75, h: 0.62, fontSize: 13 });
      if (i < 3) line(s, 10.9, 3.07 + i * 0.72, 1.72, 0, P.stoneL, 0.75);
    });
    label(s, 'Why it is the right answer', ML, 5.82, 4, P.green);
    t(s, ['Directly answers the case', 'Empowers the existing salesforce', 'Balances growth and sustainability', 'Measurable', 'Demonstrable today'].map((x, i, a) => ({ text: `✓ ${x}${i < a.length - 1 ? '   ' : ''}`, options: { color: P.char } })), { x: ML, y: 6.12, w: CW, h: 0.35, fontSize: 12, bold: true });
  }

  // ================= 6 WORKFLOW TIMELINE =================
  {
    const s = slide('LIGHT', 'The solution', 'How SMARTSELL works', 'A closed loop the rep runs in about four extra minutes per flagged outlet', 'Design target of ≤4 extra minutes is an assumption and a pilot stop criterion. Segment lengths are indicative. Case question A: "At which points during a retailer/distributor visit can slow-moving or ageing stock be spotted?"', 5);
    const loop = ['Capture', 'Detect', 'Recommend', 'Execute', 'Measure', 'Learn'];
    label(s, 'The loop', ML, 2.02, 1.2);
    t(s, loop.map((w, i) => ({ text: w + (i < 5 ? '   →   ' : ''), options: { color: i === 5 ? P.green : P.burg, bold: true } })), { x: 1.95, y: 1.97, w: 10.6, h: 0.32, fontSize: 15 });
    const st = [['Pre-visit brief', '30 s', 'Phone shows the 5–10 SKUs predicted at risk', 1.6], ['Shelf walk', '60–90 s', 'Dust, faded packs, same facings as last time', 2.55], ['Back room', '60 s', 'Unopened cartons, oldest batch codes', 2.15], ['Retailer chat', '60 s', '"What aren\'t customers asking for?"', 2.15], ['Order moment', '30 s', 'Guardrail: suggested vs asked quantity', 1.75], ['Day-end sync', 'auto', 'Escalations to ASM, distributor, KAM', 1.733]];
    const fills = [P.burg, P.burg2, '7A2C44', P.burg2, P.burg, P.stone];
    let x = ML;
    st.forEach(([name, time, d, w], i) => {
      t(s, String(i + 1).padStart(2, '0'), { x, y: 2.85, w: 0.6, h: 0.36, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: P.stone });
      t(s, name, { x, y: 3.22, w: w - 0.12, h: 0.32, fontSize: 15, bold: true });
      rect(s, x, 3.65, w - 0.04, 0.62, fills[i]);
      t(s, time, { x: x + 0.12, y: 3.65, w: w - 0.25, h: 0.62, fontSize: 15, bold: true, color: P.white, valign: 'middle' });
      t(s, d, { x, y: 4.42, w: w - 0.2, h: 0.85, fontSize: 12, color: P.stoneD });
      x += w;
    });
    const met = [['≤4 min', 'extra at a flagged outlet (design target)'], ['0 min', 'extra at healthy outlets'], ['5–10', 'SKUs counted, not the whole shop']];
    met.forEach(([b, l], i) => {
      const xx = ML + i * 4.0;
      if (i) line(s, xx - 0.25, 5.6, 0, 0.95, P.stoneL, 1);
      t(s, b, { x: xx, y: 5.45, w: 3.5, h: 0.65, fontFace: 'Aptos Display', fontSize: 34, bold: true, color: i === 1 ? P.green : P.char });
      t(s, l, { x: xx, y: 6.12, w: 3.5, h: 0.3, fontSize: 13, color: P.stoneD });
    });
  }

  // ================= 7 SIGNALS: SHELF + MATRIX =================
  pres.addSection({ title: 'Detection and action' });
  {
    const s = slide('LIGHT', 'Detection and action', 'Early detection', 'Twelve simple signals, routed to the person who can fix them', 'Case question A: "What simple signals (e.g., shelf dust, unsold cartons, retailer feedback) should be flagged, and to whom?" Signals adjust the sales estimate; only batch data can trigger near-expiry.', 6);
    // shelf illustration
    const sx = ML, sy = 1.98, sw = 5.35, sh = 3.05;
    rect(s, sx, sy, sw, sh, P.ivory);
    [sy + 1.0, sy + 2.0, sy + 3.0].forEach((yy) => rect(s, sx, yy, sw, 0.05, P.char2));
    const prod = (x, base, w, h, fill, outline = P.stoneL) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: base - h, w, h, fill: { color: fill }, line: { color: outline, width: 0.75 }, rectRadius: 0.03, objectName: nm('product') });
    // top shelf: bottles, one dusty, old MRP tag, empty slot
    let bx = sx + 0.25;
    [[0.32, 0.72, P.white], [0.32, 0.72, P.white], [0.32, 0.72, P.stoneL], [0.32, 0.72, P.stoneL], [0.32, 0.62, P.burgL], [0.32, 0.62, P.burgL]].forEach(([w, h, f]) => { prod(bx, sy + 1.0, w, h, f); bx += 0.38; });
    for (let i = 0; i < 9; i++) dot(s, sx + 1.02 + (i % 3) * 0.12 + (i > 5 ? 0.05 : 0), sy + 0.42 + Math.floor(i / 3) * 0.12, 0.04, P.stone);
    rect(s, sx + 2.75, sy + 0.8, 0.42, 0.16, 'F2D9A6');
    rrect(s, sx + 3.45, sy + 0.3, 0.75, 0.7, P.white, 0.03, { line: { color: P.stone, width: 0.75, dashType: 'dash' } });
    // middle shelf: tubes + behind-counter + tester slot + damaged
    bx = sx + 0.25;
    [[0.22, 0.6, P.white], [0.22, 0.6, P.white], [0.22, 0.6, P.white], [0.22, 0.6, P.white]].forEach(([w, h, f]) => { prod(bx, sy + 2.0, w, h, f); bx += 0.27; });
    prod(sx + 1.55, sy + 2.0, 0.42, 0.5, P.burg3);
    prod(sx + 2.15, sy + 2.0, 0.42, 0.5, P.burg3);
    rrect(s, sx + 2.85, sy + 1.55, 0.5, 0.45, P.white, 0.03, { line: { color: P.stone, width: 0.75, dashType: 'dash' } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx + 3.65, y: sy + 1.45, w: 0.38, h: 0.55, fill: { color: P.stoneL }, line: { color: P.stoneL, width: 0.75 }, rectRadius: 0.03, rotate: 8, objectName: nm('damaged') });
    s.addImage({ data: await icon('FiSmartphone', P.char), x: sx + 4.45, y: sy + 1.42, w: 0.48, h: 0.48, objectName: nm('qcomm-icon') });
    // bottom shelf: cartons (back room) + competitor scheme + return box
    [0, 1, 2].forEach((i) => { rect(s, sx + 0.25 + i * 0.68, sy + 2.42, 0.62, 0.58, 'C9B79C'); line(s, sx + 0.25 + i * 0.68, sy + 2.7, 0.62, 0, '9C8A70', 1); });
    rect(s, sx + 2.4, sy + 2.5, 0.7, 0.5, P.char2);
    t(s, '-30%', { x: sx + 2.4, y: sy + 2.5, w: 0.7, h: 0.5, fontSize: 10, bold: true, color: P.white, align: 'center', valign: 'middle' });
    rect(s, sx + 3.45, sy + 2.45, 0.8, 0.55, P.burgL);
    t(s, 'RETURN', { x: sx + 3.45, y: sy + 2.45, w: 0.8, h: 0.55, fontSize: 9, bold: true, color: P.burg, align: 'center', valign: 'middle' });
    // markers
    const mk = [[1, sx + 1.05, sy + 0.05], [3, sx + 0.25, sy + 0.05], [5, sx + 2.8, sy + 0.45], [6, sx + 3.65, sy + 0.12], [4, sx + 0.55, sy + 1.1], [8, sx + 1.75, sy + 1.12], [7, sx + 2.95, sy + 1.12], [10, sx + 3.75, sy + 1.05], [12, sx + 4.55, sy + 1.05], [2, sx + 0.85, sy + 2.08], [9, sx + 3.75, sy + 2.08], [11, sx + 2.6, sy + 2.1]];
    mk.forEach(([k, x, y]) => marker(s, k, x, y, 0.3));
    const sig = ['Dust / faded packs', 'Unopened outer cartons', 'Same count as last visit', 'Old batch hidden at back', 'Old MRP / old pack design', 'Behind the counter / off-shelf', 'No or damaged tester', '"Customers don\'t ask for it"', 'Retailer wants to return', 'Dented, leaking, heat-damaged', 'Competitor running a heavy scheme', 'Shoppers buy it on quick commerce'];
    sig.forEach((x, i) => {
      const col = i < 6 ? 0 : 1, row = i % 6;
      t(s, [{ text: `${i + 1}  `, options: { bold: true, color: P.burg } }, { text: x }], { x: ML + col * 2.72, y: 5.15 + row * 0.27, w: 2.72, h: 0.26, fontSize: 10.5 });
    });
    // responsibility matrix
    const D = '●', O = '○';
    const rows = [
      ['Flag / action', 'Rep', 'Distributor', 'ASM', 'Brand', 'Q-comm KAM'],
      ['Rotate shelf, eye level, pause this SKU\'s re-order, verify count', D, '', '', '', ''],
      ['Transfer between outlets', O, D, D, '', ''],
      ['Sampling, schemes, end-of-life (budget)', O, '', D, O, ''],
      ['Godown FEFO and monthly ageing review', '', D, O, '', ''],
      ['Same SKU slow in 3+ outlets: range or shade issue', '', '', O, D, ''],
      ['Demand moving to quick commerce', O, '', '', '', D],
    ].map((r, ri) => r.map((c, ci) => (ri > 0 && ci > 0 ? { text: c, align: 'center', color: c === D ? P.burg : P.stoneD } : c)));
    table(s, rows, { x: 6.3, y: 1.98, w: 6.33, colW: [2.5, 0.55, 0.98, 0.58, 0.67, 1.05], rowH: 0.46, fontSize: 10.5, align: 'center' });
    t(s, [{ text: '●', options: { color: P.burg, bold: true } }, { text: ' owns or approves     ' }, { text: '○', options: { color: P.stoneD, bold: true } }, { text: ' proposes or is informed' }], { x: 6.3, y: 5.72, w: 6.3, h: 0.28, fontSize: 11, color: P.stoneD });
    t(s, 'Transfers above ₹10,000, any scheme, sampling budget and end-of-life need ASM approval.', { x: 6.3, y: 6.05, w: 6.3, h: 0.5, fontSize: 12, color: P.char });
  }

  // ================= 8 RISK SIMULATOR =================
  {
    const s = slide('IVORY', 'Detection and action', 'Inventory risk engine', 'Rupees at risk and days to act, not a black-box score', 'Parameters are assumptions to calibrate in the pilot: 30-day sellable buffer at outlets, 120 days at distributors; 30-day cover norm; reorder at ≤14 days. Example uses synthetic data from the live prototype.', 7);
    t(s, 'Shree Beauty · Lumea shampoo 340 ml · 120 units · 20 a month · expiry in 105 days', { x: ML, y: 1.98, w: 8.1, h: 0.3, fontSize: 12.5, color: P.stoneD });
    [['₹14,700', 'at risk today', P.burg], ['75 days', 'left to act', P.char], ['70 units', 'projected unsold', P.char]].forEach(([b, l, col], i) => {
      const x = ML + i * 2.75;
      t(s, b, { x, y: 2.35, w: 2.6, h: 0.8, fontFace: 'Aptos Display', fontSize: 40, bold: true, color: col });
      t(s, l, { x, y: 3.12, w: 2.5, h: 0.3, fontSize: 13, color: P.stoneD });
    });
    // FEFO bar today
    const bx = ML, bw = 7.9, by = 3.85;
    label(s, 'Today', bx, by - 0.3, 2, P.char);
    rect(s, bx, by, bw * 50 / 120, 0.5, P.green);
    rect(s, bx + bw * 50 / 120, by, bw * 70 / 120, 0.5, P.burg);
    t(s, '50 sell before the buffer date', { x: bx + 0.12, y: by, w: 3.2, h: 0.5, fontSize: 12, bold: true, color: P.white, valign: 'middle' });
    t(s, '70 projected unsold → ₹14,700', { x: bx + bw * 50 / 120 + 0.12, y: by, w: 4.3, h: 0.5, fontSize: 12, bold: true, color: P.white, valign: 'middle' });
    t(s, 'Today 2 Nov 2026   →   sell-by buffer 16 Jan 2027 (75 days)   →   expiry 15 Feb 2027', { x: bx, y: by + 0.56, w: bw, h: 0.26, fontSize: 11, color: P.stoneD });
    // caught earlier
    label(s, 'If the same shelf had been caught 150 days earlier', bx, by + 1.05, 6, P.green);
    rect(s, bx, by + 1.35, bw, 0.5, P.green);
    t(s, 'All 120 sell in time  →  ₹0 at risk, every option still open', { x: bx + 0.12, y: by + 1.35, w: 7.0, h: 0.5, fontSize: 12, bold: true, color: P.white, valign: 'middle' });
    shot(s, '06-what-if.jpg', 9.2, 5.05, 3.43, 2000 / 848, 'What-if lab in the live prototype');
    t(s, 'Live what-if lab: drag stock, sales and expiry', { x: 9.2, y: 6.5, w: 3.43, h: 0.26, fontSize: 10.5, color: P.stoneD });
    // method column
    line(s, 9.0, 1.98, 0, 2.85, P.stoneL, 1);
    label(s, 'How each SKU is scored', 9.2, 1.98, 3.4);
    [['Velocity', 'monthly sell-out ÷ 30 (stock-flow)'], ['FEFO projection', 'oldest batch first, until expiry − buffer'], ['₹ at risk', 'projected unsold × unit value'], ['Priority', '₹ at stake × urgency × data confidence']].forEach(([h, d], i) => {
      t(s, [{ text: `${i + 1}  ${h}`, options: { bold: true, breakLine: true } }, { text: d, options: { color: P.stoneD, fontSize: 11 } }], { x: 9.2, y: 2.32 + i * 0.62, w: 3.4, h: 0.58, fontSize: 12.5 });
    });
  }

  // ================= 9 DECISION TREE + LADDER =================
  {
    const s = slide('LIGHT', 'Detection and action', 'Next best action engine', 'Cheapest fix first: near‑expiry needs speed, slow‑moving needs diagnosis', 'Case question B: "What specific on-ground actions would you use to move slow SKUs? What can we do differently for a near-expiry SKU versus a slow-moving one?" Costs and uplifts are assumptions to validate in the pilot.', 8);
    const box = (x, y, w, h, text, fill, color = P.white, size = 12.5) => { rect(s, x, y, w, h, fill); t(s, text, { x: x + 0.12, y, w: w - 0.24, h, fontSize: size, bold: true, color, valign: 'middle' }); };
    box(ML, 3.05, 1.45, 0.75, 'Flagged SKU', P.char);
    rrect(s, 2.6, 2.95, 2.25, 0.95, P.white, 0.06, { line: { color: P.char, width: 1.25 } });
    t(s, 'Will all of it sell before its buffer date?', { x: 2.72, y: 2.95, w: 2.0, h: 0.95, fontSize: 12.5, bold: true, valign: 'middle' });
    line(s, 2.15, 3.42, 0.45, 0, P.char, 1.25, { endArrowType: 'triangle' });
    rrect(s, 5.55, 2.0, 2.05, 0.8, P.white, 0.06, { line: { color: P.burg, width: 1.25 } });
    t(s, '≤ 90 days left to act?', { x: 5.67, y: 2.0, w: 1.85, h: 0.8, fontSize: 12.5, bold: true, color: P.burg, valign: 'middle' });
    rrect(s, 5.55, 4.05, 2.05, 0.8, P.white, 0.06, { line: { color: P.stoneD, width: 1.25 } });
    t(s, 'How much cover is left?', { x: 5.67, y: 4.05, w: 1.85, h: 0.8, fontSize: 12.5, bold: true, color: P.stoneD, valign: 'middle' });
    line(s, 4.85, 3.2, 0.7, -0.8, P.burg, 1.25, { endArrowType: 'triangle' });
    t(s, 'No', { x: 4.95, y: 2.55, w: 0.4, h: 0.25, fontSize: 11, bold: true, color: P.burg });
    line(s, 4.85, 3.65, 0.7, 0.8, P.stoneD, 1.25, { endArrowType: 'triangle' });
    t(s, 'Yes', { x: 4.95, y: 4.05, w: 0.4, h: 0.25, fontSize: 11, bold: true, color: P.stoneD });
    const leaves = [
      [1.95, 'Near-expiry (≤90 days to act)', 'Where can it sell before it\'s too late?', 'Speed: pause re-order, transfer to the fastest outlets, approved bundle, end-of-life if <30 days', P.burg, 'Yes', 2.25],
      [2.88, 'Ageing risk (>90 days to act)', 'Fix demand while options are cheap', 'Visibility, sampling, cap re-orders, rebalance surplus', P.burg2, 'No', 2.55],
      [3.85, 'Slow / overstock (>2× norm)', 'Why isn\'t it selling here?', 'Diagnose first, no discount: placement, tester, range fix, then rebalance', P.stoneD, '> 60 d', 4.3],
      [4.78, 'Stock-out risk (≤14 days)', 'Protect the sale', 'Source from surplus outlets first, then replenish to demand', P.green, '≤ 14 d', 4.6],
    ];
    leaves.forEach(([y, h, q, a, col, lab, fromY]) => {
      line(s, 7.6, fromY, 0.55, y + 0.4 - fromY, col, 1.25, { endArrowType: 'triangle' });
      t(s, [{ text: h, options: { bold: true, color: col, breakLine: true } }, { text: q, options: { italic: true, color: P.stoneD, fontSize: 11, breakLine: true } }, { text: a, options: { fontSize: 11.5 } }], { x: 8.25, y: y - 0.02, w: 4.38, h: 0.9, fontSize: 13 });
    });
    // ladder
    label(s, 'The 8-step ladder · cheapest, least brand-risky first', ML, 5.72, 6, P.char);
    const lad = [['L0', 'Verify / diagnose', '₹0'], ['L1', 'Rotate & re-place', '₹0'], ['L2', 'Pause re-order', '₹0'], ['L3', 'Rebalance', '~3% logistics'], ['L4', 'Activate demand', 'Budget'], ['L5', 'Approved bundle', 'Bundle cost'], ['L6', 'Approved scheme', 'Trade spend'], ['L7', 'End-of-life', '~50% margin'], ['L8', 'Return', 'Full loss']];
    const lf = [P.green, P.green, P.green, '5E8F7A', P.stone, P.stone, P.burg3, P.burg2, P.burg];
    lad.forEach(([k, a, c], i) => {
      const x = ML + i * 1.326, w = 1.3;
      rect(s, x, 6.02, w, 0.5, lf[i]);
      t(s, [{ text: `${k}  `, options: { bold: true } }, { text: a }], { x: x + 0.08, y: 6.02, w: w - 0.12, h: 0.5, fontSize: 10.5, color: i >= 4 && i <= 5 ? P.char : P.white, valign: 'middle' });
      t(s, c, { x, y: 6.55, w, h: 0.22, fontSize: 10, color: P.stoneD });
    });
    t(s, 'L6: last resort, never Luxe or Derma', { x: ML + 6 * 1.326 - 0.6, y: 5.72, w: 3.0, h: 0.25, fontSize: 10.5, bold: true, color: P.burg, align: 'right' });
  }

  // ================= 10 BEFORE / AFTER =================
  {
    const s = slide('LIGHT', 'Detection and action', 'In the field', 'Four outlets, four different right answers', "All four examples are seeded scenarios in the live prototype (synthetic data). Transfers are capped at what the recipient can sell before the batch's buffer date, so waste is never pushed downstream.", 9);
    ['Outlet', 'Before', 'What SMARTSELL recommends', 'After'].forEach((h, i) => label(s, h, [ML, 3.15, 7.15, 10.55][i], 1.98, 3));
    const ex = [
      ['Shree Beauty', 'Andheri · near-expiry', P.burg, '₹14,700', 'at risk: ≈70 of 120 shampoo units won\'t sell in time', 'Pause re-order (retailer asked for 24 more) and transfer 66 units to Glow Chemist, 8 days from running out', '₹840', 'at risk; a stock-out avoided'],
      ['Sai Kirana', 'Malad · slow-moving', P.stoneD, '240 days', 'of cover: premium Vitamin C serum, healthy shelf life', 'Diagnose: wrong outlet profile. Move to the counter, cap re-orders, move 18 units to CarePoint Chemist', '₹0 discount', 'cash freed; sells where it fits'],
      ['Powai Wellness Chemist', 'Powai · stock-out risk', P.green, '6 days', 'of cover: face wash at 60 a month; retailer asked for only 24', 'Replenish 60 units, sized to demand plus lead time (no surplus nearby to transfer)', 'Shelf full', 'lost sales protected'],
      ['Galleria counter', 'Powai · Luxe guardrail', P.burg2, '25% off', 'discount requested on a slow luxury fragrance', 'Blocked by the brand guardrail; manager redirects to a beauty-advisor day and sample vials', 'No price cut', 'brand equity protected'],
    ];
    ex.forEach(([o, sub, col, b, bctx, act, a, actx], i) => {
      const y = 2.32 + i * 1.12;
      if (i % 2 === 0) rect(s, ML - 0.12, y - 0.08, CW + 0.24, 1.04, P.ivory);
      t(s, o, { x: ML, y: y + 0.03, w: 2.35, h: 0.5, fontSize: 14, bold: true });
      t(s, sub.toUpperCase(), { x: ML, y: y + 0.6, w: 2.35, h: 0.25, fontSize: 9.5, bold: true, color: col, charSpacing: 1 });
      t(s, b, { x: 3.15, y: y, w: 3.0, h: 0.5, fontFace: 'Aptos Display', fontSize: 24, bold: true, color: P.stoneD });
      t(s, bctx, { x: 3.15, y: y + 0.5, w: 3.4, h: 0.42, fontSize: 11, color: P.stoneD });
      line(s, 6.6, y + 0.42, 0.4, 0, P.char, 1.5, { endArrowType: 'triangle' });
      t(s, act, { x: 7.15, y: y + 0.02, w: 3.15, h: 0.9, fontSize: 12, valign: 'middle' });
      t(s, a, { x: 10.55, y: y, w: 2.1, h: 0.5, fontFace: 'Aptos Display', fontSize: 22, bold: true, color: P.green });
      t(s, actx, { x: 10.55, y: y + 0.5, w: 2.08, h: 0.42, fontSize: 11, color: P.stoneD });
    });
  }

  // ================= 11 QUICK COMMERCE =================
  {
    const s = slide('LIGHT', 'Detection and action', 'Quick commerce', 'Quick commerce becomes a planning signal, not a source of waste', 'Sources: NielsenIQ India FMCG Snapshot Q4 2025 (Mar 2026); Business Standard, 25 Oct 2026; Dabur Q2 FY25 brokerage notes (Oct 2024); AICPDF via Storyboard18 (Nov 2024), allegation. Diagram is conceptual. Online growth figures in the prototype are synthetic.', 10);
    label(s, 'What changes', ML, 1.98, 3, P.char);
    // demand box
    rect(s, ML, 3.0, 1.75, 0.9, P.char);
    t(s, 'Consumer demand', { x: ML + 0.12, y: 3.0, w: 1.55, h: 0.9, fontSize: 13, bold: true, color: P.white, valign: 'middle' });
    rect(s, 3.75, 2.3, 2.75, 0.9, P.green);
    t(s, [{ text: 'Quick commerce', options: { bold: true, breakLine: true } }, { text: 'dark stores hold days of stock', options: { fontSize: 11 } }], { x: 3.87, y: 2.3, w: 2.55, h: 0.9, fontSize: 13, color: P.white, valign: 'middle' });
    rect(s, 3.75, 3.75, 2.75, 0.9, P.stoneL);
    t(s, [{ text: 'General-trade outlets', options: { bold: true, breakLine: true } }, { text: 'shelf sell-out falling', options: { fontSize: 11, color: P.stoneD } }], { x: 3.87, y: 3.75, w: 2.55, h: 0.9, fontSize: 13, valign: 'middle' });
    line(s, 2.5, 3.25, 1.2, -0.5, P.green, 7, { endArrowType: 'triangle' });
    t(s, 'growing', { x: 2.55, y: 2.55, w: 0.9, h: 0.24, fontSize: 10.5, bold: true, color: P.green });
    line(s, 2.5, 3.65, 1.2, 0.5, P.stone, 1.75, { endArrowType: 'triangle' });
    t(s, 'falling', { x: 2.6, y: 4.08, w: 0.9, h: 0.24, fontSize: 10.5, bold: true, color: P.stoneD });
    rect(s, ML, 4.95, 1.75, 0.7, P.white, { line: { color: P.burg, width: 1.25 } });
    t(s, 'Supply on old norms', { x: ML + 0.12, y: 4.95, w: 1.55, h: 0.7, fontSize: 12, bold: true, color: P.burg, valign: 'middle' });
    line(s, 2.5, 5.2, 1.2, -0.7, P.burg, 5, { endArrowType: 'triangle' });
    rect(s, 3.75, 5.1, 2.75, 0.6, P.burgL);
    t(s, 'Stock ages → returns', { x: 3.87, y: 5.1, w: 2.55, h: 0.6, fontSize: 12.5, bold: true, color: P.burg, valign: 'middle' });
    line(s, 5.12, 4.65, 0, 0.45, P.burg, 1.5, { endArrowType: 'triangle' });
    // approach
    line(s, 7.0, 1.98, 0, 3.75, P.stoneL, 1);
    label(s, 'Our approach', 7.25, 1.98, 3, P.char);
    [['Detect', 'Outlet sell-out −20%+ in 3 months while the brand grows 20%+ online, or the rep\'s signal'], ['Resize', 'Order guardrail uses a 21-day cover norm, not 30: stop loading general trade'], ['Hand off', 'Flag to the quick-commerce KAM and demand planning: move allocation online'], ['Route', 'Fresh stock follows demand online; ageing stock is rebalanced within general trade, never dumped']].forEach(([h, d], i) => {
      const y = 2.35 + i * 0.78;
      t(s, String(i + 1).padStart(2, '0'), { x: 7.25, y, w: 0.55, h: 0.4, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: P.green });
      t(s, [{ text: h, options: { bold: true, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: P.stoneD } }], { x: 7.85, y, w: 4.75, h: 0.72, fontSize: 14 });
    });
    t(s, 'In the app: 5 SKU-outlets flagged as shifting online; ₹23,160 of general-trade loading avoided against retailer asks (synthetic).', { x: 7.25, y: 5.38, w: 5.35, h: 0.42, fontSize: 11.5, italic: true, color: P.stoneD });
    // evidence strip
    const ev = [['≈18%', "of FMCG sales in India's top-8 metros are online; >¾ of that is quick commerce", 'NielsenIQ, Q4 2025'], ['Priority', "L'Oréal named quick commerce a focus for India growth", 'Business Standard, Oct 2026'], ['30 → 21 days', 'distributor stock cut at Dabur after demand moved channels', 'Brokerage notes, Oct 2024'], ['Dumping', 'distributors allege near-expiry stock is offloaded on quick commerce at deep discounts', 'AICPDF, Nov 2024']];
    ev.forEach(([b, d, src], i) => {
      const x = ML + i * 3.0;
      t(s, b, { x, y: 5.88, w: 2.85, h: 0.32, fontSize: 16, bold: true, color: P.green });
      t(s, [{ text: d + '  ' }, { text: src, options: { color: P.stoneD, italic: true } }], { x, y: 6.2, w: 2.85, h: 0.66, fontSize: 10, color: P.char });
    });
  }

  // ================= 12 PRODUCT LAUNCH =================
  pres.addSection({ title: 'The product' });
  {
    const s = slide('NIGHT', 'The product', 'The product experience', "A working product, not a concept: the rep's visit end to end", "Genuine screenshots of the live prototype (synthetic data; fictional brands Lumea, Verdé, Chroma, DermaPure, Salon Pro, Maison Éclat). Not connected to any L'Oréal system.", 11);
    const hx = ML, hy = 1.95, hw = 5.95;
    const hh = browser(s, '07-recommendations-c.jpg', hx, hy, hw, 1.6, 'Recommended actions for Shree Beauty');
    const img = { x: hx, y: hy + 0.24, w: hw, h: hw / 1.6 };
    const at = (fx, fy) => [img.x + fx * img.w, img.y + fy * img.h];
    [[1, 0.6, 0.255], [2, 0.03, 0.32], [3, 0.03, 0.66], [4, 0.36, 0.86]].forEach(([k, fx, fy]) => { const [x, y] = at(fx, fy); marker(s, k, x, y, 0.32, P.burg); });
    const ann = [['Plain-English risk', '₹14,700 at risk · 75 days to act'], ['Cheapest step first', 'Pause re-order, ₹0'], ['Matched transfer', '66 units to a store about to run out'], ['Human decision', 'Accept, modify or reject with a reason']];
    ann.forEach(([h, d], i) => {
      const x = ML + (i % 2) * 3.05, y = hy + hh + 0.14 + Math.floor(i / 2) * 0.36;
      marker(s, i + 1, x, y + 0.02, 0.24, P.burg);
      t(s, [{ text: h + '  ', options: { bold: true, color: P.white } }, { text: d, options: { color: P.stone } }], { x: x + 0.33, y, w: 2.7, h: 0.3, fontSize: 10.5 });
    });
    phone(s, 7.3, 2.05, 1.62, 'Smart Count with barcode scan on a phone');
    t(s, 'Smart Count on a phone', { x: 7.15, y: 5.72, w: 1.95, h: 0.26, fontSize: 11, bold: true, color: P.white, align: 'center' });
    shot(s, '09-order-guardrail-c.jpg', 10.0, 1.95, 2.63, 1.6, 'Order guardrail', true);
    t(s, 'Order guardrail', { x: 10.0, y: 3.63, w: 2.63, h: 0.26, fontSize: 11, bold: true, color: P.white });
    shot(s, '11-manager-c.jpg', 10.0, 4.0, 2.63, 1.6, 'Manager territory overview', true);
    t(s, 'Manager view: risk, approvals, channel shift', { x: 10.0, y: 5.68, w: 2.63, h: 0.26, fontSize: 11, bold: true, color: P.white });
    const qr = await QRCode.toBuffer(LIVE, { margin: 1, width: 600, color: { dark: '#171717', light: '#FFFFFF' } });
    s.addImage({ data: 'image/png;base64,' + qr.toString('base64'), x: 7.3, y: 6.08, w: 0.78, h: 0.78, objectName: 'qr', altText: 'QR code to the live prototype' });
    t(s, [{ text: 'Try it live', options: { bold: true, color: P.burg3, breakLine: true } }, { text: 'smartsell-loreal.vercel.app', options: { hyperlink: { url: LIVE }, color: P.white, bold: true, breakLine: true } }, { text: '5-minute judge guide built in', options: { color: P.stone, fontSize: 10 } }], { x: 8.2, y: 6.1, w: 4.4, h: 0.78, fontSize: 11.5 });
  }

  // ================= 13 SIMULATION RESULTS =================
  {
    const s = slide('LIGHT', 'The product', 'The loop closes', 'In simulation, the same stock produces half the returns and far fewer empty shelves', "Illustrative simulation in the prototype: synthetic Mumbai network (18 outlets, 3 distributors, 24 SKUs), 13 weeks, same starting stock, only the hero transfer accepted. Not a forecast of L'Oréal results.", 12);
    s.addChart(pres.charts.BAR, [
      { name: 'With SMARTSELL', labels: ['Returned / expired stock', 'Sales lost to stock-outs'], values: [16416, 1526] },
      { name: 'Business-as-usual', labels: ['Returned / expired stock', 'Sales lost to stock-outs'], values: [30276, 37900] },
    ], {
      x: ML - 0.1, y: 2.0, w: 7.2, h: 4.0, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60, chartColors: [P.burg, P.stoneL],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '₹#,##0', dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: P.char, dataLabelFontFace: '+mn-lt',
      showLegend: true, legendPos: 't', legendFontSize: 13, legendFontFace: '+mn-lt', legendColor: P.char,
      catAxisLabelColor: P.stoneD, catAxisLabelFontSize: 13, catAxisLabelFontFace: '+mn-lt', catAxisLineShow: true, catAxisLineColor: P.stone, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, objectName: 'outcome-chart',
    });
    t(s, 'After one quarter, ₹, synthetic territory', { x: ML, y: 6.08, w: 6.5, h: 0.26, fontSize: 11, color: P.stoneD });
    const m = [['0.9%', 'vs 1.6%', 'returns as % of sell-out (case cap ≈1.5%)', P.green], ['₹1,526', 'vs ₹37,900', 'sales lost to empty shelves', P.green], ['₹13,860', '', 'expiry risk rescued by one transfer', P.burg], ['66 units', '', 'saved from reverse logistics and destruction', P.burg]];
    m.forEach(([b, vs, l, col], i) => {
      const y = 2.0 + i * 1.02;
      if (i) line(s, 8.15, y - 0.08, 4.45, 0, P.stoneL, 1);
      t(s, [{ text: b, options: { fontFace: 'Aptos Display', fontSize: 32, bold: true, color: col } }, { text: vs ? `  ${vs}` : '', options: { fontSize: 14, color: P.stoneD } }], { x: 8.15, y, w: 4.5, h: 0.58 });
      t(s, l, { x: 8.15, y: y + 0.58, w: 4.45, h: 0.3, fontSize: 12.5, color: P.stoneD });
    });
    t(s, 'Fast-forward runs two worlds from the same stock: SMARTSELL (guardrail orders, transfers, interventions) vs business-as-usual ("same as last time" re-orders, retailer asks, no rebalancing).', { x: 8.15, y: 6.12, w: 4.48, h: 0.75, fontSize: 10.5, color: P.stoneD });
  }

  // ================= 14 FINANCIAL WATERFALL =================
  pres.addSection({ title: 'Impact and roll-out' });
  {
    const s = slide('LIGHT', 'Impact and roll-out', 'Business impact', 'Base case: ≈₹18 cr a year net, with honest bounds', "Illustrative model (model/financial_model.py). Sourced inputs: case ≈1.5% and ≈1%; L'Oréal India FY25 net sales ≈₹5,925 cr (rounded to ₹5,900 cr). All other inputs are assumptions: see Appendix C. Excludes quick-commerce loading avoided (not modelled).", 13);
    t(s, [{ text: '₹ cr per year, steady state.  ', options: { color: P.stoneD } }, { text: 'Pool ₹147.5 cr (2.5% × ₹5,900 cr) → ≈36% addressable by field sales → 25% of that prevented', options: { bold: true } }], { x: ML, y: 1.98, w: 7.0, h: 0.5, fontSize: 12 });
    const cats = ['Expiry loss avoided', 'Handling avoided', 'Less: cost to recover', 'Contribution from fewer stock-outs', 'Net benefit'];
    s.addChart(pres.charts.BAR, [
      { name: 'base', labels: cats, values: [0, 8.0, 11.3, 11.3, 0] },
      { name: 'Benefit', labels: cats, values: [8.0, 5.3, 0, 6.9, 0] },
      { name: 'Cost', labels: cats, values: [0, 0, 2.0, 0, 0] },
      { name: 'Net', labels: cats, values: [0, 0, 0, 0, 18.2] },
    ], {
      x: ML - 0.1, y: 2.5, w: 7.6, h: 4.35, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 45, chartColors: [P.white, P.green, P.burg2, P.burg],
      showValue: true, dataLabelPosition: 'inEnd', dataLabelFormatCode: '0.0;;;', dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: P.white, dataLabelFontFace: '+mn-lt',
      showLegend: false, catAxisLabelColor: P.stoneD, catAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt', catAxisLineShow: true, catAxisLineColor: P.stone,
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 20, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, objectName: 'waterfall-chart',
    });
    // right
    t(s, '₹18.2 cr', { x: 8.0, y: 1.95, w: 4.3, h: 0.95, fontFace: 'Aptos Display', fontSize: 50, bold: true, color: P.burg });
    t(s, 'net benefit a year, base case (illustrative)', { x: 8.0, y: 2.88, w: 4.3, h: 0.3, fontSize: 13, color: P.stoneD });
    const rows = [['', 'Conservative', 'Base', 'Optimistic'], ['Addressable share', '25%', { text: '36%', bold: true, fill: P.burgL }, '46%'], ['Waste prevented', '15%', { text: '25%', bold: true, fill: P.burgL }, '35%'], ['Net benefit/yr', '₹7.3 cr', { text: '₹18.2 cr', bold: true, fill: P.burgL }, '₹32.8 cr'], ['3-year cost', '₹18.0 cr', { text: '₹15.0 cr', bold: true, fill: P.burgL }, '₹12.0 cr'], ['3-year ROI', '≈1%', { text: '≈204%', bold: true, fill: P.burgL }, '≈584%'], ['Units saved/yr', '≈1.3 lakh', { text: '≈3.2 lakh', bold: true, fill: P.burgL }, '≈5.6 lakh']];
    table(s, rows, { x: 8.0, y: 3.3, w: 4.63, colW: [1.38, 1.22, 0.98, 1.05], rowH: 0.36, fontSize: 11, align: 'center' });
    t(s, 'Pays back in year 2 (year-1 ROI ≈ −9%). The conservative case only breaks even, hence a pilot with stop criteria. Waste reduction alone ≈₹11.3 cr a year.', { x: 8.0, y: 6.12, w: 4.63, h: 0.75, fontSize: 11, color: P.char });
  }

  // ================= 15 ROADMAP =================
  {
    const s = slide('LIGHT', 'Impact and roll-out', 'Implementation roadmap', 'A 16-week pilot that proves it, or stops it', "Pilot design and budget are proposals to agree with L'Oréal (≈₹50 lakh: build ₹20 L, data ₹10 L, training ₹5 L, intervention budget ₹10 L, measurement ₹5 L). Returns are a lagging metric, so they are re-measured at +6 months.", 14);
    const ax0 = 2.1, axW = 10.5, perM = axW / 18;
    const X = (m) => ax0 + m * perM;
    const phases = [['Pilot', 0, 3.7, 'Two cities, test vs control; shadow scorecard', P.burg], ['Validate', 4, 7, 'Returns at +6 months; calibrate parameters', P.burg2], ['Optimise', 5, 9, 'Integrate into existing SFA; paid scorecard; top-10 metros', P.burg3], ['Scale', 10, 18, 'All territories; salon and derma variants; ML where proven', P.char]];
    phases.forEach(([nmP, a, b, d, col], i) => {
      const y = 2.15 + i * 0.6;
      t(s, nmP, { x: ML, y, w: 1.3, h: 0.42, fontSize: 15, bold: true, valign: 'middle' });
      rect(s, X(a), y, (b - a) * perM, 0.42, col);
      if (nmP === 'Scale') t(s, d, { x: X(a) + 0.12, y, w: (b - a) * perM - 0.2, h: 0.42, fontSize: 11.5, color: P.white, valign: 'middle' });
      else t(s, d, { x: X(b) + 0.12, y, w: 4.6, h: 0.42, fontSize: 11.5, color: P.stoneD, valign: 'middle' });
    });
    line(s, ax0, 4.62, axW, 0, P.stone, 1);
    [0, 3, 6, 9, 12, 15, 18].forEach((m) => { line(s, X(m), 4.58, 0, 0.08, P.stone, 1); t(s, m === 18 ? 'M18+' : `M${m}`, { x: X(m) - 0.3, y: 4.68, w: 0.6, h: 0.22, fontSize: 10, color: P.stoneD, align: 'center' }); });
    // decision gate
    line(s, X(3.7), 1.98, 0, 2.62, P.green, 1.5, { dashType: 'dash' });
    s.addShape(pres.shapes.DIAMOND, { x: X(3.7) - 0.17, y: 1.86, w: 0.34, h: 0.34, fill: { color: P.green }, line: { color: P.green, width: 0 }, objectName: 'gate' });
    t(s, 'Decision gate · week 16', { x: X(3.7) + 0.25, y: 1.88, w: 2.4, h: 0.28, fontSize: 11, bold: true, color: P.green });
    // gate criteria
    rect(s, ML, 5.1, 5.0, 1.72, P.ivory);
    t(s, [{ text: 'Scale if  ', options: { bold: true, color: P.green } }, { text: 'at-risk ₹ down ≥20% vs control, stock-outs down ≥15%, secondary growth ≥ control, ≥70% of actions completed, ≤4 extra minutes per visit', options: { breakLine: true } }, { text: 'Stop if  ', options: { bold: true, color: P.burg } }, { text: 'at-risk ₹ improves <10%, or growth falls more than 2 points below control' }], { x: ML + 0.2, y: 5.18, w: 4.6, h: 1.58, fontSize: 11.5, paraSpaceAfter: 6, valign: 'middle' });
    const pd = [['Geography', 'Mumbai (quick-commerce heavy) + one tier-2 city, e.g. Nagpur or Indore'], ['Coverage', '4 test + 4 control distributors; ~600 outlets; ~12 reps'], ['SKUs', '40 focus SKUs: top 20 by past returns + top 20 by velocity'], ['Training', '1-day workshop, 2 ride-along days per rep, weekly ASM huddle'], ['Technology', 'Prototype hardened into a PWA on a weekly DMS extract, or configured in the existing SFA'], ['Measurement', 'Test vs control; weekly leading KPIs; returns at +6 months']];
    pd.forEach(([h, d], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      t(s, [{ text: h, options: { bold: true, breakLine: true } }, { text: d, options: { color: P.stoneD, fontSize: 10.5 } }], { x: 6.0 + col * 3.33, y: 5.05 + row * 0.6, w: 3.25, h: 0.58, fontSize: 11.5 });
    });
  }

  // ================= 16 KPI SCORECARD =================
  {
    const s = slide('IVORY', 'Impact and roll-out', 'KPI and governance framework', 'One scorecard for growth and waste, owned by the sales line', "Targets are pilot proposals measured against control territories. Scorecard weights are assumptions to agree with L'Oréal sales leadership.", 15);
    const q = [
      ['Growth', P.char, [['Incremental contribution & ROI', '(Test − control growth) × margin − costs', '≥ control'], ['Sell-through', 'Units sold ÷ (opening + receipts)', '+10% on flagged SKUs']]],
      ['Waste', P.burg, [['Expiry & return rate', '₹ returned ÷ ₹ secondary sales', '−15% at +6 mo'], ['At-risk inventory value', 'Σ projected unsold × unit value', '−25%'], ['Inventory recovered', '₹ of at-risk stock sold via transfer, bundle or activation', 'Tracked']]],
      ['Availability', P.stoneD, [['Stock-out rate', 'Must-stock SKUs at zero ÷ checked', '−20%'], ['Days of inventory', 'Stock ÷ daily sell-out', 'Within norm ±20%']]],
      ['Execution', P.green, [['Intervention completion', 'Actions done ÷ accepted', '≥70%'], ['Visit time added', 'Extra minutes at flagged outlets', '≤4 min']]],
    ];
    q.forEach(([name, col, kpis], i) => {
      const x = ML + (i % 2) * 6.07, y = 1.98 + Math.floor(i / 2) * 1.98, w = 5.87, h = 1.85;
      rect(s, x, y, w, h, P.white);
      label(s, name, x + 0.25, y + 0.2, 2, col);
      kpis.forEach(([k, f, tg], j) => {
        const yy = y + 0.52 + j * 0.43;
        t(s, [{ text: k, options: { bold: true } }, { text: `   ${f}`, options: { color: P.stoneD, fontSize: 10.5 } }], { x: x + 0.25, y: yy, w: 4.0, h: 0.4, fontSize: 12.5, valign: 'middle' });
        t(s, tg, { x: x + 4.15, y: yy, w: 1.5, h: 0.4, fontSize: 13, bold: true, color: col, align: 'right', valign: 'middle' });
      });
    });
    label(s, 'Healthy Sales Scorecard · rep incentive', ML, 6.02, 5, P.char);
    let x = ML;
    [['Secondary sales vs target', 50, P.char], ['Sell-through health', 20, P.burg], ['Availability', 15, P.stoneD], ['Execution', 15, P.green]].forEach(([l, w, col]) => {
      const ww = 6.3 * w / 100;
      rect(s, x, 6.32, ww - 0.03, 0.42, col);
      t(s, `${w}%  ${w >= 20 ? l : ''}`, { x: x + 0.08, y: 6.32, w: ww - 0.12, h: 0.42, fontSize: 11, bold: true, color: P.white, valign: 'middle' });
      x += ww;
    });
    t(s, 'Availability 15% · Execution 15%', { x: ML + 3.0, y: 6.76, w: 3.3, h: 0.2, fontSize: 9.5, color: P.stoneD, align: 'right' });
    label(s, 'Governance cadence', 7.35, 6.02, 3, P.char);
    t(s, [{ text: 'Daily ', options: { bold: true, color: P.burg } }, { text: 'rep actions · ' }, { text: 'Weekly ', options: { bold: true, color: P.burg } }, { text: 'ASM approvals, coaching · ' }, { text: 'Monthly ', options: { bold: true, color: P.burg } }, { text: 'distributor ageing, brand readout · ' }, { text: 'Quarterly ', options: { bold: true, color: P.burg } }, { text: 'leadership scorecard, returns and scheme policy' }], { x: 7.35, y: 6.3, w: 5.28, h: 0.62, fontSize: 11 });
  }

  // ================= 17 CLOSING =================
  {
    const s = pres.addSlide({ masterName: 'BURGUNDY', sectionTitle: 'Impact and roll-out' });
    s.addImage({ path: LOGO_WHITE, x: ML, y: 0.62, w: 1.55, h: 1.55 / LOGO_AR, objectName: 'logo' });
    line(s, 2.48, 0.57, 0, 0.38, P.burg3, 0.75);
    t(s, 'SUSTAINABILITY CHALLENGE 2026 · SALES TRACK', { x: 2.65, y: 0.64, w: 5.5, h: 0.26, fontSize: 11, bold: true, color: P.burgL, charSpacing: 2 });
    t(s, 'From order collection to intelligent demand and inventory management', { x: ML, y: 1.45, w: 10.5, h: 1.7, fontFace: 'Aptos Display', fontSize: 40, bold: true, color: P.white, lineSpacingMultiple: 0.95 });
    [['Selling more into the channel', 'Moving the right stock to the right shelf'], ['Finding waste at the return', 'Catching it while the fix is cheap'], ['Discount as the default', 'Discount as the guarded last resort'], ['Quick commerce as a threat', 'Quick commerce as a planning signal']].forEach(([a, b], i) => {
      const y = 3.4 + i * 0.52;
      t(s, a, { x: ML, y, w: 4.4, h: 0.42, fontSize: 15, color: P.burg3, valign: 'middle' });
      line(s, 5.2, y + 0.21, 0.55, 0, P.burgL, 1.25, { endArrowType: 'triangle' });
      t(s, b, { x: 6.0, y, w: 6.0, h: 0.42, fontSize: 17, bold: true, color: P.white, valign: 'middle' });
    });
    t(s, "Every unit that sells instead of expiring is waste avoided at the top of the hierarchy, before any recycling, in line with L'Oréal for the Future.", { x: ML, y: 5.6, w: 9.6, h: 0.55, fontSize: 13.5, italic: true, color: P.burgL });
    t(s, [{ text: 'Our ask: one distributor-data extract, two territories, 16 weeks.', options: { bold: true, color: P.white, breakLine: true } }, { text: 'Try it: smartsell-loreal.vercel.app', options: { hyperlink: { url: LIVE }, color: P.burgL } }], { x: ML, y: 6.25, w: 9.5, h: 0.65, fontSize: 16 });
    const qr = await QRCode.toBuffer(LIVE, { margin: 1, width: 600, color: { dark: '#65172F', light: '#FFFFFF' } });
    s.addImage({ data: 'image/png;base64,' + qr.toString('base64'), x: 11.6, y: 5.65, w: 1.03, h: 1.03, objectName: 'qr', altText: 'QR code to the live prototype' });
    s.addNotes(NOTES[16]);
  }

  // ================= APPENDIX =================
  pres.addSection({ title: 'Appendix' });
  {
    const s = slide('NIGHT', 'Appendix', 'Appendix', 'Evidence, methodology and Q&A', null, 17);
    const items = [['A', 'Sources and data integrity'], ['B', 'Risk methodology and parameters'], ['C', 'Financial model assumptions and sensitivity'], ['D', 'The five playbooks'], ['E', 'Five biggest risks and how we address them'], ['F', 'Likely judge questions'], ['G', 'Solution options we considered']];
    items.forEach(([k, v], i) => {
      const y = 2.45 + i * 0.55;
      t(s, k, { x: ML, y, w: 0.5, h: 0.45, fontFace: 'Aptos Display', fontSize: 22, bold: true, color: P.burg3 });
      t(s, v, { x: ML + 0.6, y: y + 0.04, w: 8, h: 0.4, fontSize: 18, color: P.white });
    });
  }
  // A sources
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix A · Sources and data integrity', 'What is fact, what is research, what is our estimate', 'Full source register with URLs: research folder, sources.md. Some claims were verified from search summaries of the named pages; re-open before external use. Global data is labelled as such.', 18);
    const leg = [['Case fact', "From the L'Oréal brief: ≈1.5% returns/expired/damaged; ≈1% handling; field teams see distributor and retailer inventory", P.burg], ['Research finding', 'Public, dated sources (right). India unless marked global', P.char], ['Estimate', 'Our modelled numbers: financial scenarios, addressable shares, uplifts', P.stoneD], ['Synthetic', 'All prototype data: fictional brands, outlets, people, online growth rates', P.green]];
    leg.forEach(([h, d, col], i) => {
      const y = 2.0 + i * 0.7;
      dot(s, ML, y + 0.06, 0.16, col);
      t(s, [{ text: h, options: { bold: true, color: col, breakLine: true } }, { text: d, options: { fontSize: 11, color: P.stoneD } }], { x: ML + 0.3, y, w: 4.75, h: 0.66, fontSize: 13 });
    });
    t(s, [{ text: 'Not publicly available (we did not invent these): ', options: { bold: true } }, { text: 'L\'Oréal India channel mix, distributor and outlet counts, field-force size, SFA/DMS stack, return-policy terms, or what "capped at ≈1.5%" means. These are pilot set-up questions.' }], { x: ML, y: 4.95, w: 5.0, h: 1.2, fontSize: 12 });
    const src = [['Claim', 'Source, date'], ["L'Oréal India FY24 revenue ₹5,576 cr; FY25 net sales ₹5,925 cr, profit ₹597.5 cr", 'Indiaretailing, 27 Nov 2024; PTI/The Week, 3 Oct 2025'], ['India +14% LFL (H1 2025), +17% (H1 2026); SAPMENA-SSA +10.9% (2025)', "L'Oréal half-year results; 2025 URD"], ['Quick commerce a focus; CeraVe and La Roche-Posay expanding', 'Business Standard, 25 Oct 2026'], ['E-com 18% of FMCG in top-8 metros; q-comm >¾ of e-com; kirana volume +1.1%', 'NielsenIQ Q4 2025 snapshot, Mar 2026'], ['Dabur cut distributor stock 30 → 21 days; halted primary 7–8 days', 'Sharekhan 30 Oct 2024; Baroda Securities 31 Oct 2024'], ['AICPDF alleges near-expiry dumping via quick commerce', 'Storyboard18, Nov 2024 (allegation)'], ['HUL Shikhar: 1.4 m retailers; dormancy challenges', 'Unilever 2023; WARC'], ['Cosmetics labels must carry use-before / expiry date', 'CDSCO Cosmetics Rules 2020 (amended 2025)'], ['Packaging 33% recycled, 44% recycled or bio-based (2025)', "L'Oréal 2025 URD"], ["Out-of-stock: ≈8% average; ≈1 in 3 shoppers switch or don't buy", 'Gruen, Corsten & Bharadwaj 2002 (global)']];
    table(s, src, { x: 6.0, y: 1.98, w: 6.63, colW: [3.9, 2.73], rowH: 0.43, fontSize: 10.5, zebra: true });
  }
  // B methodology
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix B · Risk methodology', 'Every flag can be traced to five inputs and four parameters', 'Reference implementation: model/risk_engine_reference.py (Python) and lib/engine.ts (prototype). Unit tests check the worked examples.', 19);
    const rows = [['Parameter', 'Outlet', 'Distributor', 'Why'], ['Minimum sellable buffer', '30 days', '120 days', 'Shoppers and retailers avoid packs close to expiry; distributor stock still has to reach a shelf'], ['Target days of cover', '30', '21', 'Distributor norm in line with publicly corrected FMCG levels'], ['Reorder point', '≤14 days', '≤12 days', 'Lead time 7 days + safety stock'], ['Overstock', '>2× norm', '>2× norm', 'Cash tied up even when it sells in time'], ['Channel-shift cover norm', '21 days', '—', 'Outlet −20% in 3 months while online grows +20%'], ['Confidence', 'Scan/DMS 1.0 · count 0.85 · verbal 0.5', '', 'Recency: ≤7 d ×1.0, ≤30 d ×0.8, older ×0.5; Low locks costly actions']];
    table(s, rows, { x: ML, y: 1.98, w: CW, colW: [2.6, 2.5, 1.4, 5.433], rowH: 0.5, fontSize: 12, zebra: true, boldCol0: true });
    label(s, 'Limitations we state openly', ML, 5.75, 4, P.burg);
    t(s, "Velocity is assumed constant over the window (a trend factor and ML forecasts come later); stock-flow sell-out is noisy, so anomalies are flagged and confidence-weighted; buffers and norms are assumptions to calibrate against L'Oréal's return terms; the engine recommends and people decide.", { x: ML, y: 6.05, w: CW, h: 0.8, fontSize: 13 });
  }
  // C financial
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix C · Financial model', 'Assumptions behind the ₹18 cr base case, and what moves it most', 'Model: model/financial_model.py; outputs in model/scenarios.csv. Double-counting rules: transferred units counted once (as avoided credit notes, never also as extra sales); stock-out benefit at contribution margin; distributor working capital excluded.', 20);
    const B = (x) => ({ text: x, bold: true, fill: P.burgL, align: 'center' });
    const c = (x) => ({ text: x, align: 'center' });
    const g = (x) => ({ text: x, color: P.stoneD });
    const rows = [['Input', 'Conservative', 'Base', 'Optimistic', 'Basis'], ['Revenue base', c('₹5,900 cr'), B('₹5,900 cr'), c('₹5,900 cr'), g("L'Oréal India FY25 net sales, rounded (sourced)")], ['Waste pool', c('1.5% + 1%'), B('1.5% + 1%'), c('1.5% + 1%'), g('Case (sourced)')], ['Field-covered share', c('50%'), B('60%'), c('70%'), g('Assumption')], ['Sales-influenceable share', c('50%'), B('60%'), c('65%'), g('Assumption; validate with return reason codes')], ['Waste prevented', c('15%'), B('25%'), c('35%'), g('Assumption; pilot measures it')], ['Cost to recover stock', c('35%'), B('25%'), c('20%'), g('Of loss avoided')], ['Stock-out reduction', c('10%'), B('20%'), c('30%'), g('On an 8% OOS base, 35% brand loss (global study)')], ['Contribution margin', c('35%'), B('35%'), c('35%'), g('Assumption')], ['Build + year-1 run', c('₹12.0 cr'), B('₹10.0 cr'), c('₹8.0 cr'), g('Assumption; lower if configured in existing SFA')]];
    table(s, rows, { x: ML, y: 1.98, w: 7.75, colW: [1.8, 1.27, 0.95, 1.08, 2.65], rowH: 0.42, fontSize: 11, zebra: false });
    s.addChart(pres.charts.BAR, [
      { name: 'Low', labels: ['Waste prevented 15–35%', 'Stock-out reduction 10–30%', 'Baseline OOS 5–12%', 'Field-covered share 50–70%', 'Contribution margin 25–45%'], values: [13.7, 14.8, 15.6, 15.2, 16.2] },
      { name: 'High', labels: ['Waste prevented 15–35%', 'Stock-out reduction 10–30%', 'Baseline OOS 5–12%', 'Field-covered share 50–70%', 'Contribution margin 25–45%'], values: [22.7, 21.7, 21.7, 21.3, 20.2] },
    ], {
      x: 8.6, y: 1.95, w: 4.1, h: 4.85, barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 50, chartColors: [P.stoneL, P.burg],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 11, dataLabelColor: P.char, dataLabelFontFace: '+mn-lt',
      showLegend: true, legendPos: 'b', legendFontSize: 11, legendFontFace: '+mn-lt', catAxisLabelFontSize: 10.5, catAxisLabelColor: P.stoneD, catAxisLabelFontFace: '+mn-lt',
      valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, valAxisMinVal: 0,
      showTitle: true, title: 'Net benefit ₹ cr/yr (base 18.2)', titleFontSize: 12, titleColor: P.char, titleFontFace: '+mn-lt', objectName: 'sensitivity-chart',
    });
  }
  // D playbooks
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix D · The five playbooks', 'Each risk state gets its own sequence, cost and guardrail', 'Approval thresholds: transfers above ₹10,000 or across distributors, any scheme, sampling budget and end-of-life need ASM approval. Luxe and Derma: no price schemes; Luxe: no bundles.', 21);
    const rows = [['Playbook', 'Sequence', 'Main risk', 'Guardrail'], ['Near-expiry', 'Verify batch → pause re-order → transfer projected-unsold units to the fastest outlets → approved bundle → controlled end-of-life if <30 days', 'Pushing short-dated stock onto retailers who return it', "Transfer capped at recipient's sell-through capacity"], ['Slow-moving (healthy shelf life)', 'Diagnose (reason code) → visibility → tester or sampling → cap re-orders → range correction → rebalance if no change in 2 visits', 'Acting on the wrong diagnosis', 'Re-measure velocity at the next 2 visits'], ['Overstocked node', 'SKU-level cover review → guardrail on over-covered SKUs only → rebalance → reset norms by SKU class', 'Revenue cliff from blanket cuts', 'Fast SKUs keep ordering'], ['Stock-out risk', 'Source from surplus outlets first → replenish to cover + lead time → raise beat frequency', 'Over-correcting into excess', 'Capped at target cover'], ['Poor visibility / channel shift', 'Benchmark peers → placement and testers → or, if demand moved online, resize orders and hand off to quick-commerce KAM', 'Blaming the product for an execution or channel issue', 'Never dump ageing stock on quick commerce']];
    table(s, rows, { x: ML, y: 1.98, w: CW, colW: [2.1, 5.2, 2.4, 2.233], rowH: [0.4, 0.82, 0.82, 0.72, 0.62, 0.82], fontSize: 11.5, zebra: true, boldCol0: true });
  }
  // E risks
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix E · Risks and objections', 'The five biggest risks to SMARTSELL, and how we address them', 'Each mitigation is built into the prototype or the pilot design.', 22);
    ['Risk', 'Why it might happen', 'How we address it'].forEach((h, i) => label(s, h, [1.45, 4.6, 8.0][i], 1.98, 3));
    const r = [["Reps won't adopt it", 'Extra time, "another app", incentives still pay for sell-in', 'Count flagged SKUs only (≤4 min is a stop criterion); embed in existing SFA; Healthy Sales Scorecard; credit for ₹ rescued'], ['Data is poor', 'No POS in general trade, missing batches, stale counts', 'Stock-flow sell-out; confidence weighting; "verify first" locks costly actions; DMS as the base layer'], ['Unintended consequences', 'Discount habit, brand dilution, channel conflict, under-ordering', 'Discount is step 6 of 8; no schemes for Luxe/Derma; transfers within authorised network; growth guardrail KPI vs control'], ["L'Oréal already has systems", 'SFA/DMS and central demand sensing exist', 'SMARTSELL is a logic and workflow layer the current SFA can host; it feeds outlet signals into demand planning'], ['Benefits are overstated', 'Estimates mistaken for results', 'Only case % are sourced; three scenarios with a break-even conservative case; pilot with stop criteria']];
    r.forEach(([a, b, c2], i) => {
      const y = 2.35 + i * 0.88;
      if (i) line(s, ML, y - 0.1, CW, 0, P.stoneL, 0.75);
      t(s, String(i + 1), { x: ML, y, w: 0.6, h: 0.6, fontFace: 'Aptos Display', fontSize: 30, bold: true, color: P.burg3 });
      t(s, a, { x: 1.45, y: y + 0.05, w: 3.0, h: 0.65, fontSize: 14, bold: true, color: P.burg });
      t(s, b, { x: 4.6, y: y + 0.05, w: 3.2, h: 0.7, fontSize: 12, color: P.stoneD });
      t(s, c2, { x: 8.0, y: y + 0.05, w: 4.63, h: 0.72, fontSize: 12 });
    });
  }
  // F Q&A
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix F · Likely judge questions', 'Short answers to the questions we expect', 'Full answers: research folder, 12-judge-qa.md, and deck/presenter-pack.md.', 23);
    const qa = [['We already have an SFA and DMS. Why this?', 'They capture orders and stock. SMARTSELL adds the decision layer: batch-level risk at the outlet, sanctioned actions, and verified outcomes. Your SFA can host it.'], ['Where is the AI?', 'Deliberately rules-first so it can be audited. ML comes in phase 3 for sparse-SKU forecasts and learning which action works where.'], ["Reps visit 20 outlets a day. They won't count.", 'They count only flagged SKUs at flagged outlets. Batch dates are printed by law, so reading one takes seconds. ≤4 minutes is a stop criterion.'], ["Doesn't a transfer just move the problem?", 'Only if you send too much. Quantity is capped at what the recipient can sell before its own buffer date.'], ['What about quick commerce?', 'We detect demand moving online, tighten general-trade orders there and hand off to the quick-commerce KAM. We never dump short-dated stock online.'], ['Is the ₹18 cr real?', "No. It's an illustrative base case built only on the case percentages and labelled assumptions. The pilot measures the real number."]];
    qa.forEach(([q2, a], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = ML + col * 6.12, y = 2.0 + row * 1.6;
      if (row) line(s, x, y - 0.15, 5.8, 0, P.stoneL, 0.75);
      t(s, q2, { x, y, w: 5.8, h: 0.35, fontSize: 14, bold: true, color: P.burg });
      t(s, a, { x, y: y + 0.4, w: 5.8, h: 0.95, fontSize: 12.5 });
    });
  }
  // G options
  {
    const s = slide('LIGHT', 'Appendix', 'Appendix G · Options considered', 'Why a hybrid beats tech‑only or process‑only', 'Weights and scores are our judgement (1–5). Weighted: tech-led 0.25·4+0.20·2+0.20·2+0.15·3+0.10·4+0.10·4 = 3.05, and so on. Judges are welcome to re-weight.', 24);
    const H = (x) => ({ text: x, bold: true, color: P.burg, fill: P.burgL, align: 'center' });
    const c = (x) => ({ text: x, align: 'center' });
    const rows = [['Criterion (weight)', 'Tech-led AI platform', 'Process-led playbook', 'Hybrid: SMARTSELL', 'Policy-led returns'], ['Business impact (25%)', c('4'), c('3'), H('5'), c('2')], ['Feasibility in 6–12 months (20%)', c('2'), c('5'), H('4'), c('4')], ['Answers the case brief (20%)', c('2'), c('4'), H('5'), c('2')], ['Differentiation (15%)', c('3'), c('2'), H('5'), c('1')], ['Scalability (10%)', c('4'), c('2'), H('4'), c('5')], ['Judge demo appeal (10%)', c('4'), c('1'), H('5'), c('1')], [{ text: 'Weighted score', bold: true }, { text: '3.05', bold: true, align: 'center' }, { text: '3.15', bold: true, align: 'center' }, { text: '4.70', bold: true, color: P.burg, fill: P.burgL, align: 'center' }, { text: '2.45', bold: true, align: 'center' }]];
    table(s, rows, { x: ML, y: 1.98, w: CW, colW: [3.333, 2.15, 2.15, 2.15, 2.15], rowH: 0.48, fontSize: 13 });
    t(s, "Tech-only answers a question the case didn't ask (L'Oréal already runs central demand sensing). Process-only can't rebalance across outlets or measure outcomes. Policy-only shifts the cost to distributors instead of removing waste.", { x: ML, y: 6.0, w: CW, h: 0.75, fontSize: 13 });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
