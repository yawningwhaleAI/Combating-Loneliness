/* SMARTSELL — L'Oréal Sustainability Challenge 2026 (Sales Track) competition deck. */
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fi = require('react-icons/fi');
const path = require('path');
const QRCode = require('qrcode');
const { applyTheme } = require(process.env.SKILL_DIR + '/scripts/apply_theme.js');

const OUT = process.argv[2];
const SHOTS = '/home/user/Combating-Loneliness/loreal-sales-track/deck/screens/';
const LIVE = 'https://smartsell-loreal.vercel.app';

const THEME = {
  name: 'SMARTSELL Burgundy',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1C1A1B', lt1: 'FFFFFF', dk2: '5E5853', lt2: 'F4EFEA',
    accent1: '6E1A30', accent2: 'B08D57', accent3: '2E7D5B', accent4: '2F5D8C', accent5: 'B4321F', accent6: 'C08A2B',
    hlink: '6E1A30', folHlink: '4A1020',
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = 'SMARTSELL: Turning Field Sales into a Growth and Sustainability Engine';
pres.subject = "L'Oréal Sustainability Challenge 2026, Sales Track";
pres.author = 'SMARTSELL team';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333;
const M = 0.6;

// ---------- icons ----------
const iconCache = {};
async function icon(name, hex, px = 256) {
  const key = `${name}-${hex}`;
  if (iconCache[key]) return iconCache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fi[name], { color: '#' + hex, size: px, strokeWidth: 2 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  iconCache[key] = 'image/png;base64,' + buf.toString('base64');
  return iconCache[key];
}

// ---------- layouts ----------
pres.defineSlideMaster({
  title: 'COVER',
  background: { color: C.accent1 },
  objects: [],
});
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: C.background1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 0.36, w: 9, h: 0.3, fontFace: 'Calibri', fontSize: 11, bold: true, color: C.accent1, charSpacing: 2, margin: 0, valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.62, w: 12.1, h: 1.05, fontFace: 'Cambria', fontSize: 30, bold: true, color: C.text1, margin: 0, valign: 'top', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'source', type: 'body', x: M, y: 6.98, w: 10.6, h: 0.36, fontFace: 'Calibri', fontSize: 10, color: C.text2, margin: 0, valign: 'top' }, text: '' } },
    { text: { text: 'SMARTSELL', options: { x: 11.05, y: 7.0, w: 1.1, h: 0.3, fontFace: 'Calibri', fontSize: 10, bold: true, color: C.accent1, align: 'right', margin: 0 } } },
  ],
  slideNumber: { x: 12.23, y: 7.0, w: 0.5, h: 0.3, fontFace: 'Calibri', fontSize: 10, color: C.text2, align: 'right' },
});
pres.defineSlideMaster({
  title: 'DARK',
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 0.6, w: 9, h: 0.3, fontFace: 'Calibri', fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.0, w: 11.5, h: 1.8, fontFace: 'Cambria', fontSize: 40, bold: true, color: C.background1, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
  slideNumber: { x: 12.23, y: 7.0, w: 0.5, h: 0.3, fontFace: 'Calibri', fontSize: 10, color: C.background2, align: 'right' },
});

// ---------- helpers ----------
let shapeId = 0;
const nm = (s) => `${s}-${++shapeId}`;
function content(section, kicker, title, source) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText(kicker, { placeholder: 'kicker' });
  s.addText(title, { placeholder: 'title' });
  if (source) s.addText(source, { placeholder: 'source' });
  return s;
}
function card(s, x, y, w, h, fill = C.background2, extra = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.08, objectName: nm('card'), ...extra });
}
function txt(s, text, o) {
  s.addText(text, { isTextBox: true, margin: 0, valign: 'top', fontFace: 'Calibri', color: C.text1, fontSize: 14, objectName: nm('text'), ...o });
}
async function iconDot(s, name, x, y, d, fill = C.accent1, iconHex = 'FFFFFF') {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm('icon-circle') });
  const pad = d * 0.25;
  s.addImage({ data: await icon(name, iconHex), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: nm('icon') });
}
function shot(s, file, x, y, w, ratio = 1.6, label) {
  const h = w / ratio;
  s.addShape(pres.shapes.RECTANGLE, { x: x - 0.02, y: y - 0.02, w: w + 0.04, h: h + 0.04, fill: { color: 'E4DDD6' }, line: { color: 'E4DDD6', width: 0 }, shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 6, offset: 2, angle: 90 }, objectName: nm('shot-frame') });
  s.addImage({ path: SHOTS + file, x, y, w, h, objectName: nm('screenshot'), altText: label || 'SMARTSELL prototype screenshot' });
  return h;
}
function pill(s, text, x, y, w, fill, color = C.background1, size = 11) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.3, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.15, objectName: nm('pill') });
  txt(s, text, { x, y, w, h: 0.3, fontSize: size, bold: true, color, align: 'center', valign: 'middle' });
}
function arrowRight(s, x, y, w, color = C.text2) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 1.5, endArrowType: 'triangle' }, objectName: nm('arrow') });
}

(async () => {
  // ======================= 1. COVER =======================
  {
    pres.addSection({ title: 'Opening' });
    const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Opening' });
    txt(s, "L'ORÉAL SUSTAINABILITY CHALLENGE 2026 · SALES TRACK", { x: M, y: 0.7, w: 8.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 3 });
    txt(s, 'SMARTSELL', { x: M, y: 1.55, w: 8.5, h: 1.3, fontFace: 'Cambria', fontSize: 66, bold: true, color: C.background1 });
    txt(s, 'Turning field sales into a growth and sustainability engine', { x: M, y: 2.9, w: 8.2, h: 1.0, fontFace: 'Cambria', fontSize: 26, color: C.background1 });
    txt(s, 'Move from selling more inventory into the channel to moving the right inventory to the right customer, at the right place and at the right time.', { x: M, y: 4.15, w: 7.8, h: 1.0, fontSize: 18, italic: true, color: C.background2 });
    txt(s, [{ text: 'Live prototype  ', options: { bold: true, color: C.accent2 } }, { text: 'smartsell-loreal.vercel.app', options: { color: C.background1, hyperlink: { url: LIVE } } }], { x: M, y: 5.75, w: 7.5, h: 0.4, fontSize: 16 });
    txt(s, 'Field sales intelligence and inventory intervention for the on-ground salesforce · All prototype data is synthetic', { x: M, y: 6.25, w: 8.4, h: 0.4, fontSize: 12, color: C.background2 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.55, y: 0.55, w: 3.0, h: 6.45, fill: { color: '4A1020' }, line: { color: '4A1020', width: 0 }, rectRadius: 0.25, objectName: nm('phone-frame') });
    s.addImage({ path: SHOTS + '16-mobile-count.jpg', x: 9.7, y: 0.7, w: 2.7, h: 2.7 * (2532 / 1170), objectName: nm('mobile-shot'), altText: 'SMARTSELL Smart Count on a phone' });
    s.addNotes(`Good morning. We're presenting SMARTSELL.

Our one-line idea is on the slide: move from selling more inventory INTO the channel, to moving the right inventory to the right customer, at the right place and time.

On the right is our working product, on a phone, because that's where it lives: in the hands of a L'Oréal sales rep standing in a shop. Everything you'll see today runs live at smartsell-loreal.vercel.app, on synthetic data.

In twelve minutes we'll show you the problem, its root cause, how SMARTSELL works, a live demo, the business case and a pilot that proves it or stops it.`);
  }

  // ======================= 2. EXEC SUMMARY =======================
  {
    const s = content('Opening', 'EXECUTIVE SUMMARY', 'Less waste and more growth come from the same move: acting on the shelf before the order', 'Sources: L\'Oréal Sales Track case (≈1.5%, ≈1%); financials are illustrative estimates (see Appendix C). Prototype data is synthetic.');
    const rows = [
      ['FiAlertTriangle', 'The problem', 'Returned, expired and damaged stock is ≈1.5% of revenue, plus ≈1% to handle and destroy it (case). Cutting orders only swaps waste for stock-outs.'],
      ['FiSearch', 'The root cause', 'Waste is decided when the order is taken and discovered when the return arrives. Reps visit the shop many times in between, but nothing asks them to act. Quick commerce is widening the gap.'],
      ['FiSmartphone', 'The solution', 'SMARTSELL gives every rep a 4-minute routine: see the at-risk SKUs, get rupees-at-risk and days-to-act, take the cheapest sanctioned fix, rebalance across the beat, and order to what will sell.'],
      ['FiTrendingUp', 'The impact', 'Base case ≈₹18 cr a year net, about 3× its cost over 3 years (illustrative). In our live simulation, returns fell from 1.6% to 0.9% of sell-out with fewer stock-outs.'],
      ['FiFlag', 'The ask', 'A 16-week, two-city pilot against control territories with clear scale and stop criteria. We need one distributor-data extract and a willing ASM.'],
    ];
    let y = 1.85;
    for (const [ic, head, body] of rows) {
      await iconDot(s, ic, M, y + 0.02, 0.55);
      txt(s, head, { x: M + 0.8, y, w: 2.3, h: 0.6, fontSize: 16, bold: true, color: C.accent1, valign: 'middle' });
      txt(s, body, { x: M + 3.1, y, w: 9.0, h: 0.85, fontSize: 14, color: C.text1, valign: 'middle' });
      y += 0.98;
    }
    s.addNotes(`The whole story on one page.

The problem: about 1.5% of revenue comes back as returned, expired or damaged stock, and another 1% goes on handling it. Those are the case's numbers. The obvious fix, ordering less, just creates stock-outs.

The root cause: waste is decided at the order and discovered at the return. In between, the rep is in that shop many times, and nothing in the visit asks them to act. Quick commerce is making this worse.

Our solution, SMARTSELL, gives every rep a four-minute routine that catches the problem early and fixes it cheaply.

The impact: around 18 crore a year in our base case, clearly labelled as an estimate. And our ask is small: a 16-week pilot.`);
  }

  // ======================= 3. PROBLEM =======================
  {
    pres.addSection({ title: 'The problem' });
    const s = content('The problem', 'THE BUSINESS PROBLEM', 'Every expired unit was sold once, and paid for twice', "Sources: L'Oréal Sustainability Challenge 2026 Sales Track case, p.2 (≈1.5% \"capped\", ≈1%). L'Oréal India FY25 net sales ₹5,925 cr (PTI via The Week, 3 Oct 2025). ₹148 cr is illustrative and assumes the case percentages apply to L'Oréal India.");
    const nodes = [['FiHome', "L'Oréal", 'Plants & depots'], ['FiTruck', 'Distributor', 'Weeks of stock, many batches'], ['FiShoppingBag', 'Retailer', 'Shelf + back room, no POS'], ['FiUser', 'Consumer', 'The only real sale']];
    const xs = [0.9, 4.0, 7.1, 10.2];
    for (let i = 0; i < 4; i++) {
      await iconDot(s, nodes[i][0], xs[i] + 0.55, 1.95, 0.8, i === 3 ? C.accent3 : C.accent1);
      txt(s, nodes[i][1], { x: xs[i], y: 2.85, w: 1.9, h: 0.35, fontSize: 16, bold: true, align: 'center' });
      txt(s, nodes[i][2], { x: xs[i] - 0.2, y: 3.2, w: 2.3, h: 0.35, fontSize: 12, color: C.text2, align: 'center' });
      if (i < 3) arrowRight(s, xs[i] + 1.55, 2.35, 1.6);
    }
    txt(s, 'Sell-in (revenue booked)', { x: 2.35, y: 1.9, w: 2.0, h: 0.3, fontSize: 11, bold: true, color: C.accent1, align: 'center' });
    txt(s, 'Secondary sales', { x: 5.45, y: 1.9, w: 2.0, h: 0.3, fontSize: 11, bold: true, color: C.text2, align: 'center' });
    txt(s, 'Sell-out (real demand)', { x: 8.55, y: 1.9, w: 2.0, h: 0.3, fontSize: 11, bold: true, color: C.accent3, align: 'center' });
    // visibility strip as three tinted cards
    card(s, 0.7, 3.7, 3.0, 0.55, 'E6F0EA'); txt(s, 'Visible in ERP', { x: 0.85, y: 3.7, w: 2.8, h: 0.55, fontSize: 12, bold: true, color: C.accent3, valign: 'middle' });
    card(s, 3.8, 3.7, 3.0, 0.55, 'F6EEDD'); txt(s, 'Partly visible: stock, rarely batch age', { x: 3.95, y: 3.7, w: 2.8, h: 0.55, fontSize: 12, bold: true, color: C.accent6, valign: 'middle' });
    card(s, 6.9, 3.7, 5.7, 0.55, 'F7E4E1'); txt(s, 'Blind spot: batch age and real sell-out. Only the rep standing in the shop can see it.', { x: 7.05, y: 3.7, w: 5.5, h: 0.55, fontSize: 12, bold: true, color: C.accent5, valign: 'middle' });
    // stats
    const stats = [['≈1.5%', 'of revenue returned, expired or damaged', 'Case data ("capped" at ≈1.5%)', C.accent5], ['≈1%', 'more to handle, reverse-ship and destroy it', 'Case data', C.accent5], ['≈₹148 cr', 'a year at L\'Oréal India\'s scale', 'Illustrative: 2.5% × ₹5,925 cr FY25 net sales', C.accent1]];
    for (let i = 0; i < 3; i++) {
      const x = 0.7 + i * 4.05;
      card(s, x, 4.6, 3.85, 2.1, C.background2);
      txt(s, stats[i][0], { x: x + 0.25, y: 4.75, w: 3.4, h: 0.85, fontFace: 'Cambria', fontSize: 40, bold: true, color: stats[i][3] });
      txt(s, stats[i][1], { x: x + 0.25, y: 5.6, w: 3.4, h: 0.6, fontSize: 15, color: C.text1 });
      txt(s, stats[i][2], { x: x + 0.25, y: 6.25, w: 3.4, h: 0.35, fontSize: 11, color: C.text2 });
    }
    s.addNotes(`Here's the system. L'Oréal books revenue when stock moves into distributors: that's sell-in. The money is only real when a consumer buys it off the shelf: that's sell-out.

The coloured strip shows what each part of the chain can see. The ERP sees the depot. The distributor's system sees totals, but rarely how old each batch is. And at the retailer, where waste actually happens, nobody sees batch age or real sales, except the rep who walks in every week.

When sell-in and sell-out drift apart, stock ages and comes back. The case puts that at about 1.5% of revenue, plus 1% to handle it. At L'Oréal India's scale, that's roughly 148 crore a year, if those percentages apply. Every one of those units was made, shipped and advertised, then shipped back and destroyed.`);
  }

  // ======================= 4. ROOT CAUSE =======================
  {
    const s = content('The problem', 'ROOT CAUSE', 'Waste is a visibility and execution problem, not just a forecasting problem', 'Sources: Dabur Q2 FY25 inventory correction (Sharekhan, 30 Oct 2024; Baroda Securities, 31 Oct 2024). Out-of-stock shopper response: Gruen, Corsten & Bharadwaj, GMA/FMI/CIES 2002 (global, not India). Rep-influence ratings are our assessment.');
    const tiles = [
      ['Demand forecasting', 'Central forecasts can\'t see outlet sell-out or batch age', 'Low'],
      ['Distributor ordering', 'Orders sized by habit, schemes and period-end loading', 'High'],
      ['Retailer inventory', 'Same range for every outlet; old batches hidden at the back', 'High'],
      ['Visibility', 'No batch-age or sell-out view at the outlet', 'Medium'],
      ['Product velocity', 'Quick commerce and seasons shift demand faster than norms', 'Medium'],
      ['Field execution', 'No trigger, no sanctioned actions, sell-in-only targets', 'High'],
    ];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = M + col * 2.72, y = 1.85 + row * 1.75;
      card(s, x, y, 2.55, 1.6, C.background2);
      txt(s, tiles[i][0], { x: x + 0.18, y: y + 0.15, w: 2.2, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
      txt(s, tiles[i][1], { x: x + 0.18, y: y + 0.5, w: 2.2, h: 0.7, fontSize: 12, color: C.text1 });
      const lvl = tiles[i][2];
      pill(s, `Rep influence: ${lvl}`, x + 0.18, y + 1.18, 1.85, lvl === 'High' ? C.accent1 : lvl === 'Medium' ? C.accent2 : C.text2, C.background1, 10);
    }
    // why cutting orders fails
    card(s, 8.95, 1.85, 3.78, 3.35, 'F7E4E1');
    txt(s, 'Why "just order less" fails', { x: 9.15, y: 2.0, w: 3.4, h: 0.35, fontSize: 15, bold: true, color: C.accent5 });
    txt(s, [
      { text: '30 → 21 days', options: { bold: true, fontFace: 'Calibri', fontSize: 22, color: C.accent5, breakLine: true } },
      { text: 'Dabur halted primary sales for 7–8 days to cut distributor stock, and guided to a revenue decline (Q2 FY25).', options: { fontSize: 12, breakLine: true } },
      { text: ' ', options: { fontSize: 6, breakLine: true } },
      { text: '≈1 in 3', options: { bold: true, fontFace: 'Cambria', fontSize: 22, color: C.accent5, breakLine: true } },
      { text: 'shoppers facing a stock-out switch brand or don\'t buy at all (global study).', options: { fontSize: 12 } },
    ], { x: 9.15, y: 2.4, w: 3.4, h: 2.7 });
    // insight
    card(s, M, 5.45, 12.13, 1.3, C.accent1);
    txt(s, [
      { text: 'Key insight  ', options: { bold: true, color: C.accent2 } },
      { text: 'Waste is decided when the order is taken and discovered when the return arrives. In between, the rep is in the shop many times, but nothing in the visit asks them to look, tells them what they may do, or rewards them for doing it.', options: { color: C.background1 } },
    ], { x: M + 0.3, y: 5.55, w: 11.5, h: 1.1, fontSize: 16, valign: 'middle' });
    s.addNotes(`Why does stock go bad? We mapped six root causes and rated how much a rep can influence each.

Forecasting matters, but central forecasting can't see an outlet's shelf. The big levers are ones the rep controls: how orders are sized, which range each outlet carries, whether old batches go to the front, and whether anyone acts on what they see.

And why not simply order less? Dabur tried that publicly last year: it stopped shipping for over a week to cut distributor stock from 30 to 21 days, and took a revenue hit. A global study found about one in three shoppers who hit an empty shelf switch brand or don't buy at all.

So the insight at the bottom is the heart of our pitch. Waste is decided at the order and discovered at the return, and nothing in today's visit closes that gap.`);
  }

  // ======================= 5. SOLUTION =======================
  {
    pres.addSection({ title: 'The solution' });
    const s = content('The solution', 'OUR STRATEGIC SOLUTION', 'SMARTSELL turns every visit into early detection and the right action', 'Design principle: a layer on L\'Oréal\'s existing SFA/DMS, not a replacement. Rules-based and explainable; machine learning only where it earns its place (phase 3).');
    // inputs
    card(s, M, 1.85, 2.45, 4.0, C.background2);
    txt(s, 'INPUTS', { x: M + 0.2, y: 2.0, w: 2.1, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    txt(s, [
      { text: 'Distributor DMS: stock and invoices', options: { bullet: { indent: 14 }, breakLine: true } },
      { text: 'Rep Smart Count + barcode and batch scan', options: { bullet: { indent: 14 }, breakLine: true } },
      { text: '12 simple field signals', options: { bullet: { indent: 14 }, breakLine: true } },
      { text: 'Online / quick-commerce trend', options: { bullet: { indent: 14 } } },
    ], { x: M + 0.2, y: 2.4, w: 2.1, h: 3.3, fontSize: 13, paraSpaceAfter: 8 });
    // modules
    const mods = [['FiDatabase', 'Stock Intelligence', 'Pre-visit brief, Smart Count, batch and expiry capture, stock-flow sell-out'], ['FiActivity', 'Risk Engine', 'FEFO projected waste, ₹ at risk, days to act, stock-out and channel-shift detection'], ['FiCompass', 'Action Engine', '8-step intervention ladder, transfer matching, order guardrail, approvals'], ['FiBarChart2', 'Manager Intelligence', 'Territory risk, approvals, repeat offenders, scorecards, outcomes vs business-as-usual']];
    for (let i = 0; i < 4; i++) {
      const x = 3.3 + i * 1.95;
      card(s, x, 1.85, 1.82, 4.0, i % 2 ? 'F8F4F0' : 'EFE7E0');
      await iconDot(s, mods[i][0], x + 0.56, 2.05, 0.7);
      txt(s, `0${i + 1}`, { x: x + 0.15, y: 2.95, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.accent2, align: 'center' });
      txt(s, mods[i][1], { x: x + 0.1, y: 3.25, w: 1.62, h: 0.65, fontSize: 15, bold: true, color: C.accent1, align: 'center' });
      txt(s, mods[i][2], { x: x + 0.12, y: 3.95, w: 1.58, h: 1.8, fontSize: 12, color: C.text1, align: 'center' });
    }
    // users
    card(s, 11.2, 1.85, 1.53, 4.0, C.background2);
    txt(s, 'USERS', { x: 11.32, y: 2.0, w: 1.3, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const users = [['FiUser', 'Field rep'], ['FiUsers', 'ASM'], ['FiTruck', 'Distributor'], ['FiSmartphone', 'Q-comm KAM']];
    for (let i = 0; i < 4; i++) {
      await iconDot(s, users[i][0], 11.33, 2.45 + i * 0.83, 0.42, C.accent1);
      txt(s, users[i][1], { x: 11.8, y: 2.45 + i * 0.83, w: 0.9, h: 0.42, fontSize: 12, bold: true, valign: 'middle' });
    }
    // pillars
    const pillars = ['Directly answers the case', 'Empowers the existing salesforce', 'Balances growth and sustainability', 'Measurable', 'Demonstrable today'];
    for (let i = 0; i < 5; i++) {
      const x = M + i * 2.45;
      await iconDot(s, 'FiCheckCircle', x, 6.12, 0.38, C.accent3);
      txt(s, pillars[i], { x: x + 0.48, y: 6.08, w: 1.9, h: 0.5, fontSize: 12, bold: true, valign: 'middle' });
    }
    s.addNotes(`SMARTSELL is a field sales intelligence and inventory intervention system for L'Oréal's existing on-ground salesforce.

It takes data L'Oréal already has (distributor stock and invoices), adds what only the rep can capture (a quick count, the batch date printed on every pack, and simple signals like dust or unopened cartons), and runs it through four connected modules.

Stock Intelligence captures it. The Risk Engine turns it into rupees at risk and days left to act. The Action Engine recommends the cheapest sanctioned fix. Manager Intelligence closes the loop.

Five reasons this is the right answer, along the bottom: it answers the case directly; it uses the salesforce L'Oréal already pays for; it protects growth and cuts waste with the same move; it's measurable; and you can try it today.`);
  }

  // ======================= 6. HOW IT WORKS =======================
  {
    const s = content('The solution', 'HOW SMARTSELL WORKS', 'A closed loop the rep runs in about four extra minutes per flagged outlet', 'Design target of ≤4 extra minutes is an assumption and a pilot stop criterion. Case question A: "At which points during a retailer/distributor visit can slow-moving or ageing stock be spotted?"');
    const steps = [['FiDatabase', 'Capture', 'Count only flagged SKUs; scan batch and expiry'], ['FiActivity', 'Detect', '₹ at risk, days to act, stock-out, channel shift'], ['FiCompass', 'Recommend', 'Cheapest sanctioned fix first'], ['FiCheckCircle', 'Execute', 'Accept, modify or reject; assign owner'], ['FiBarChart2', 'Measure', 'Recount; verified ₹ rescued'], ['FiRepeat', 'Learn', 'Reject reasons and outcomes tune the rules']];
    for (let i = 0; i < 6; i++) {
      const x = M + i * 2.04;
      await iconDot(s, steps[i][0], x + 0.6, 1.9, 0.75, i === 5 ? C.accent3 : C.accent1);
      txt(s, steps[i][1], { x, y: 2.75, w: 1.95, h: 0.35, fontSize: 16, bold: true, align: 'center', color: C.accent1 });
      txt(s, steps[i][2], { x: x + 0.05, y: 3.1, w: 1.85, h: 0.7, fontSize: 12, align: 'center' });
      if (i < 5) arrowRight(s, x + 1.45, 2.27, 0.68, C.accent2);
    }
    txt(s, 'Six moments in a visit where slow or ageing stock gives itself away', { x: M, y: 4.1, w: 12, h: 0.4, fontSize: 16, bold: true });
    const moments = [['Pre-visit brief', '30 s', 'Phone shows the 5–10 SKUs predicted at risk'], ['Shelf walk', '60–90 s', 'Dust, faded packs, same facings as last time'], ['Back room', '60 s', 'Unopened cartons, oldest batch codes'], ['Retailer chat', '60 s', '"What aren\'t customers asking for?"'], ['Order moment', '30 s', 'Guardrail: suggested vs asked quantity'], ['Day-end sync', 'auto', 'Escalations to ASM, distributor, KAM']];
    for (let i = 0; i < 6; i++) {
      const x = M + i * 2.04;
      card(s, x, 4.6, 1.92, 2.1, C.background2);
      txt(s, `${i + 1}`, { x: x + 0.15, y: 4.72, w: 0.4, h: 0.4, fontFace: 'Cambria', fontSize: 22, bold: true, color: C.accent2 });
      txt(s, moments[i][1], { x: x + 0.9, y: 4.78, w: 0.9, h: 0.3, fontSize: 11, color: C.text2, align: 'right' });
      txt(s, moments[i][0], { x: x + 0.15, y: 5.18, w: 1.65, h: 0.35, fontSize: 14, bold: true });
      txt(s, moments[i][2], { x: x + 0.15, y: 5.55, w: 1.65, h: 1.05, fontSize: 12, color: C.text1 });
    }
    s.addNotes(`This is how it works in practice: a closed loop of capture, detect, recommend, execute, measure and learn.

The bottom row answers the case's first question directly: where in a visit can you spot slow or ageing stock? We found six moments. Before walking in, the phone already shows the five to ten SKUs predicted to be at risk from distributor invoices. Then a shelf walk, a look in the back room for unopened cartons and old batch codes, three quick questions to the retailer, and finally the order moment, where the guardrail stops new waste being created.

The rep only counts flagged SKUs, at flagged outlets. Our design target is four extra minutes, and if the pilot shows more, that's a stop signal.`);
  }

  // ======================= 7. EARLY DETECTION =======================
  {
    pres.addSection({ title: 'Detection and action' });
    const s = content('Detection and action', 'EARLY DETECTION', 'Twelve simple signals, routed to the person who can fix them', 'Case question A: "What simple signals (e.g., shelf dust, unsold cartons, retailer feedback) should be flagged, and to whom?" Signals adjust the sales estimate; only batch data can trigger near-expiry.');
    const sig = ['Dust / faded packs', 'Unopened outer cartons', 'Same count as last visit', 'Old batch hidden at back', 'Old MRP / old pack design', 'Behind the counter / off-shelf', 'No or damaged tester', '"Customers don\'t ask for it"', 'Retailer wants to return', 'Dented, leaking, heat-damaged', 'Competitor running a heavy scheme', 'Shoppers buy it on quick commerce'];
    txt(s, 'WHAT THE REP TICKS (NO TECH NEEDED)', { x: M, y: 1.85, w: 6, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    for (let i = 0; i < 12; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + col * 3.1, y = 2.25 + row * 0.72;
      card(s, x, y, 2.95, 0.58, i === 11 ? 'EEE8F6' : C.background2);
      txt(s, sig[i], { x: x + 0.18, y, w: 2.7, h: 0.58, fontSize: 13, valign: 'middle', bold: i === 11, color: i === 11 ? '5B3A8A' : C.text1 });
    }
    txt(s, 'WHO GETS THE FLAG', { x: 7.1, y: 1.85, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const route = [['FiUser', 'Field rep', 'Rotate shelf, move to eye level, pause this SKU\'s re-order, verify count'], ['FiTruck', 'Distributor', 'Execute transfers, FEFO in the godown, monthly ageing review'], ['FiUsers', 'Area Sales Manager', 'Approve transfers over ₹10k, schemes, sampling budget, end-of-life'], ['FiLayers', 'Brand team', 'Same SKU slow in 3+ outlets: range or shade issue'], ['FiSmartphone', 'Quick-commerce KAM', 'Demand moving online: shift allocation, stop loading general trade']];
    for (let i = 0; i < 5; i++) {
      const y = 2.25 + i * 0.86;
      await iconDot(s, route[i][0], 7.1, y + 0.05, 0.55, i === 4 ? '5B3A8A' : C.accent1);
      txt(s, route[i][1], { x: 7.85, y, w: 4.9, h: 0.33, fontSize: 14, bold: true });
      txt(s, route[i][2], { x: 7.85, y: y + 0.33, w: 4.9, h: 0.45, fontSize: 12, color: C.text2 });
    }
    s.addNotes(`The case asks: which simple signals, and flagged to whom? Here's our answer.

On the left are twelve signals a rep can see without any technology: dust, unopened cartons, the same count as last week, an old MRP sticker, a product hidden behind the counter. We added a twelfth that matters more every month: "shoppers say they buy it on quick commerce."

On the right is where each flag goes. The rep fixes shelf-level issues on the spot. The distributor executes transfers. The ASM approves anything with a cost. If the same SKU is slow in three or more outlets, that's a range problem for the brand team, not the rep. And channel shift goes to the quick-commerce key-account team.

One rule matters: a signal can lower our sales estimate, but only real batch data can trigger a near-expiry alert. That keeps false alarms down.`);
  }

  // ======================= 8. RISK ENGINE =======================
  {
    const s = content('Detection and action', 'INVENTORY RISK ENGINE', 'Rupees at risk and days to act, not a black-box score', 'Parameters are assumptions to calibrate in the pilot: 30-day sellable buffer at outlets, 120 days at distributors; 30-day cover norm; reorder at ≤14 days. Example uses synthetic data from the live prototype.');
    txt(s, 'HOW EACH SKU IS SCORED', { x: M, y: 1.85, w: 5.5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const calc = [['1', 'Velocity', 'monthly sell-out ÷ 30 (stock-flow: last count + deliveries − today\'s count)'], ['2', 'FEFO projection', 'each batch sells oldest-first until expiry − buffer; what\'s left is projected unsold'], ['3', '₹ at risk', 'projected unsold × unit value; days to act = days until that batch hits its buffer'], ['4', 'Priority', '₹ at stake × urgency × data confidence, so uncertain data ranks lower but is never hidden']];
    for (let i = 0; i < 4; i++) {
      const y = 2.25 + i * 0.78;
      txt(s, calc[i][0], { x: M, y, w: 0.4, h: 0.5, fontFace: 'Cambria', fontSize: 24, bold: true, color: C.accent2 });
      txt(s, calc[i][1], { x: M + 0.45, y, w: 1.6, h: 0.5, fontSize: 14, bold: true });
      txt(s, calc[i][2], { x: M + 2.05, y, w: 3.75, h: 0.72, fontSize: 12, color: C.text1 });
    }
    // state table
    const states = [['Near-expiry', 'Unsold units, ≤90 days to act', 'Speed', C.accent5], ['Ageing risk', 'Unsold units, >90 days to act', 'Fix demand early', C.accent6], ['Stock-out risk', 'Cover ≤ reorder point', 'Replenish, rebalance', C.accent4], ['Slow / overstock', 'Cover >2× norm, sells in time', 'Diagnose, no discount', 'A58A5C'], ['Channel shift', 'Outlet falling, online rising', 'Resize + hand off', '5B3A8A']];
    for (let i = 0; i < 5; i++) {
      const y = 5.4 + i * 0.3;
      s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.07, w: 0.16, h: 0.16, fill: { color: states[i][3] }, line: { color: states[i][3], width: 0 }, objectName: nm('dot') });
      txt(s, states[i][0], { x: M + 0.28, y, w: 1.6, h: 0.3, fontSize: 12, bold: true });
      txt(s, states[i][1], { x: M + 1.9, y, w: 2.3, h: 0.3, fontSize: 11, color: C.text2 });
      txt(s, states[i][2], { x: M + 4.2, y, w: 1.65, h: 0.3, fontSize: 11, bold: true, color: states[i][3] });
    }
    // example + screenshot
    card(s, 6.75, 1.85, 5.98, 1.55, C.background2);
    txt(s, 'Shree Beauty · Lumea shampoo: 120 units · 20 a month · expiry in 105 days', { x: 6.95, y: 1.95, w: 5.6, h: 0.35, fontSize: 12, color: C.text2 });
    txt(s, [{ text: '₹14,700', options: { fontFace: 'Cambria', fontSize: 30, bold: true, color: C.accent5 } }, { text: '  at risk today · 75 days to act', options: { fontSize: 14, bold: true } }], { x: 6.95, y: 2.3, w: 5.6, h: 0.55 });
    txt(s, [{ text: '₹0', options: { fontFace: 'Cambria', fontSize: 22, bold: true, color: C.accent3 } }, { text: '  if the same shelf had been caught 150 days earlier', options: { fontSize: 13 } }], { x: 6.95, y: 2.85, w: 5.6, h: 0.45 });
    shot(s, '06-what-if.jpg', 6.75, 3.6, 5.98, 2000 / 848, 'What-if lab: caught 150 days earlier');
    txt(s, 'Live what-if lab: judges can drag stock, sales and expiry and watch every number update', { x: 6.75, y: 6.18, w: 5.98, h: 0.4, fontSize: 11, italic: true, color: C.text2 });
    s.addNotes(`We deliberately didn't build a black-box AI score. A sales director should be able to audit every number in five minutes.

For each SKU we compute three things. First, how many units won't sell in time: batches sell oldest-first, and each can only sell until thirty days before expiry. Second, what those units are worth. Third, how many days are left to act.

Take a real example from the prototype: Shree Beauty has 120 bottles of shampoo selling 20 a month, expiring in 105 days. Seventy won't sell in time: ₹14,700 at risk, 75 days to act. Tick "caught 150 days earlier" in the what-if lab and the risk drops to zero. That's the value of early detection.

The states on the bottom left each get a different playbook, including a new one: channel shift, when an outlet is losing demand to quick commerce.`);
  }

  // ======================= 9. NEXT BEST ACTION =======================
  {
    const s = content('Detection and action', 'NEXT BEST ACTION ENGINE', 'Cheapest fix first: near-expiry needs speed, slow-moving needs diagnosis', 'Case question B: "What specific on-ground actions would you use to move slow SKUs? What can we do differently for a near-expiry SKU versus a slow-moving one?" Costs and uplifts are assumptions to validate in the pilot.');
    const ladder = [['L0', 'Verify / diagnose', '₹0'], ['L1', 'Rotate & re-place (FEFO, eye level)', '₹0'], ['L2', 'Order guardrail: pause this SKU', '₹0'], ['L3', 'Rebalance to a faster outlet', '~3% logistics'], ['L4', 'Activate: tester, sampling, advisor', 'Budget'], ['L5', 'Approved bundle', 'Bundle cost'], ['L6', 'Time-boxed approved scheme', 'Trade spend'], ['L7', 'Controlled end-of-life, pre-expiry', '~50% margin'], ['L8', 'Return and record root cause', 'Full loss']];
    txt(s, 'THE 8-STEP LADDER', { x: M, y: 1.85, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    for (let i = 0; i < 9; i++) {
      const y = 2.2 + i * 0.5;
      const w = 2.2 + i * 0.25;
      const fill = i <= 2 ? 'E6F0EA' : i <= 5 ? 'F6EEDD' : 'F7E4E1';
      card(s, M, y, w + 1.2, 0.42, fill);
      txt(s, ladder[i][0], { x: M + 0.12, y, w: 0.45, h: 0.42, fontSize: 12, bold: true, color: C.accent1, valign: 'middle' });
      txt(s, ladder[i][1], { x: M + 0.55, y, w: w + 0.0, h: 0.42, fontSize: 12, valign: 'middle' });
      txt(s, ladder[i][2], { x: M + w + 0.1, y, w: 1.0, h: 0.42, fontSize: 10, color: C.text2, valign: 'middle', align: 'right' });
    }
    txt(s, 'L6 is a last resort and never offered for Luxe or Derma brands', { x: M, y: 6.7, w: 5.0, h: 0.25, fontSize: 11, bold: true, color: C.accent5 });
    // comparison
    const rows = [['', 'Near-expiry', 'Slow-moving, healthy shelf life'], ['Core question', 'Where can it sell before it\'s too late?', 'Why isn\'t it selling here?'], ['First move', 'Pause re-order, transfer to the fastest outlets', 'Diagnose, then fix visibility, trial or range'], ['Discount?', 'Late, approved, mass brands only', 'Avoid: it hides the cause'], ['Success =', 'Units sold before the buffer date', 'Sell-out uplift at the same outlet']];
    const tbl = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0 || ci === 0, color: ri === 0 ? (ci === 1 ? HEX.accent5 : ci === 2 ? HEX.accent6 : HEX.dk1) : HEX.dk1, fill: { color: ri === 0 ? 'FFFFFF' : ci === 0 ? 'F4EFEA' : 'FFFFFF' } } })));
    s.addTable(tbl, { x: 6.6, y: 1.85, w: 6.13, colW: [1.35, 2.39, 2.39], fontFace: 'Calibri', fontSize: 12, border: { type: 'solid', color: 'E4DDD6', pt: 0.75 }, rowH: 0.42, valign: 'middle', objectName: nm('comparison-table') });
    const h = shot(s, '07-recommendations-c.jpg', 6.6, 4.5, 3.6, 1.6, 'Recommended actions screen');
    txt(s, 'In the app: ranked actions with rationale, effect, cost, owner and approval need. Accept, modify or reject with a reason.', { x: 10.45, y: 4.55, w: 2.28, h: h, fontSize: 12, color: C.text2 });
    s.addNotes(`The case's second question: what actions move slow stock, and how is near-expiry different from slow-moving?

On the left is our intervention ladder. The cheapest, least brand-risky steps come first: verify, rotate the shelf, pause re-orders of that one SKU, move stock to a faster outlet, then demand activation like testers and sampling. Discounting is step six of eight, and never for Luxe or dermatology brands. That protects brand equity and avoids the channel conflict distributors have publicly complained about.

The table answers near-expiry versus slow-moving. They're different problems. Near-expiry is about speed: where can this sell before it's too late? Slow-moving is about diagnosis: why isn't it selling here? Discounting a slow mover just hides the cause.

The screenshot shows exactly this in the product: ranked actions, each with a reason, an effect, a cost and an owner.`);
  }

  // ======================= 10. FOUR OUTLETS =======================
  {
    const s = content('Detection and action', 'IN THE FIELD', 'Four outlets, four different right answers', 'All four examples are seeded scenarios in the live prototype (synthetic data). Transfers are capped at what the recipient can sell before the batch\'s buffer date, so waste is never pushed downstream.');
    const ex = [
      ['Shree Beauty, Andheri', 'Near-expiry', '120 shampoo units, ≈70 won\'t sell in time: ₹14,700 at risk', 'Pause re-order (retailer asked for 24 more) and transfer 66 units to Glow Chemist, which was 8 days from running out', '₹14,700 → ₹840 at risk; a stock-out avoided', C.accent5],
      ['Sai Kirana, Malad', 'Slow-moving', 'Premium Vitamin C serum, 240 days of cover, healthy shelf life', 'Diagnose: wrong outlet profile. Move to the counter, cap re-orders, move 18 units to CarePoint Chemist. No discount.', 'Cash freed for the retailer, serum sells where it fits', 'A58A5C'],
      ['Powai Wellness Chemist', 'Stock-out risk', 'Face wash: 6 days of cover at 60 a month; retailer asked for only 24', 'Replenish 60 units, sized to demand plus lead time (no surplus nearby to transfer)', 'Shelf stays full; lost sales protected', C.accent4],
      ['Galleria counter, Powai', 'Luxe guardrail', 'Slow luxury fragrance; rep requests a 25% discount', 'Request blocked by the brand guardrail; manager redirects to a beauty-advisor day and sample vials', 'Brand equity protected', C.accent1],
    ];
    const hdr = ['Outlet', 'Situation', 'What SMARTSELL recommends', 'Result'];
    const colW = [1.95, 2.75, 3.85, 2.1];
    let x = M;
    hdr.forEach((hd, i) => { txt(s, hd.toUpperCase(), { x, y: 1.85, w: colW[i], h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 1 }); x += colW[i] + 0.12; });
    for (let r = 0; r < 4; r++) {
      const y = 2.2 + r * 1.15;
      card(s, M, y, 11.0, 1.05, r % 2 ? 'FFFFFF' : C.background2);
      let xx = M + 0.12;
      txt(s, ex[r][0], { x: xx, y: y + 0.12, w: colW[0] - 0.1, h: 0.45, fontSize: 13, bold: true });
      pill(s, ex[r][1], xx, y + 0.62, 1.6, ex[r][5], C.background1, 10);
      xx += colW[0] + 0.12;
      txt(s, ex[r][2], { x: xx, y: y + 0.1, w: colW[1] - 0.05, h: 0.9, fontSize: 12, valign: 'middle' });
      xx += colW[1] + 0.12;
      txt(s, ex[r][3], { x: xx, y: y + 0.1, w: colW[2] - 0.05, h: 0.9, fontSize: 12, valign: 'middle' });
      xx += colW[2] + 0.12;
      txt(s, ex[r][4], { x: xx, y: y + 0.1, w: colW[3] - 0.2, h: 0.9, fontSize: 12, bold: true, color: C.accent3, valign: 'middle' });
    }
    await iconDot(s, 'FiShield', 11.85, 2.2, 0.75, C.accent3);
    txt(s, 'Order guardrail', { x: 11.65, y: 3.0, w: 1.15, h: 0.3, fontSize: 12, bold: true, align: 'center' });
    txt(s, 'Every order shows asked vs suggested, with the reason. Overrides need a reason.', { x: 11.65, y: 3.3, w: 1.15, h: 1.9, fontSize: 11, color: C.text2, align: 'center' });
    s.addNotes(`Here's what that looks like in four real-looking outlets from our prototype.

At Shree Beauty, shampoo is near expiry: ₹14,700 at risk. The retailer wants 24 more; SMARTSELL says pause that SKU. Two kilometres away, Glow Chemist is eight days from running out of the same shampoo. One approved transfer of 66 units: no discount, no return, no lost sale. Risk drops to ₹840.

At Sai Kirana, a premium serum is slow but has plenty of shelf life. That's a diagnosis problem: it's in the wrong outlet. Move it to the counter, stop re-ordering, and send some to a chemist where it sells. No discount.

At Powai Wellness, the risk is the opposite: a stock-out. We replenish to demand, not to the retailer's habitual ask.

And at the luxury counter, a discount request is blocked by the brand guardrail.`);
  }

  // ======================= 11. QUICK COMMERCE =======================
  {
    const s = content('Detection and action', 'QUICK COMMERCE', 'Quick commerce becomes a planning signal, not a source of waste', 'Sources: NielsenIQ India FMCG Snapshot Q4 2025 (Mar 2026); Business Standard, 25 Oct 2026; Dabur Q2 FY25 brokerage notes (Oct 2024); AICPDF via Storyboard18 (Nov 2024), allegation. Online growth figures in the prototype are synthetic.');
    const ev = [['≈18%', 'of FMCG sales in India\'s top-8 metros are online, and over ¾ of that is quick commerce', 'NielsenIQ, Q4 2025'], ['Priority', "L'Oréal named quick commerce a focus for India growth", 'Business Standard, Oct 2026'], ['30 → 21 days', 'distributor stock cut at Dabur after demand moved channels', 'Brokerage notes, Oct 2024'], ['Dumping', 'distributors allege near-expiry stock is offloaded on quick commerce at deep discounts', 'AICPDF, Nov 2024']];
    for (let i = 0; i < 4; i++) {
      const x = M + i * 3.07;
      card(s, x, 1.85, 2.92, 1.75, C.background2);
      txt(s, ev[i][0], { x: x + 0.2, y: 1.95, w: 2.6, h: 0.55, fontFace: ev[i][0].includes('→') ? 'Calibri' : 'Cambria', fontSize: 24, bold: true, color: '5B3A8A' });
      txt(s, ev[i][1], { x: x + 0.2, y: 2.5, w: 2.6, h: 0.75, fontSize: 12 });
      txt(s, ev[i][2], { x: x + 0.2, y: 3.27, w: 2.6, h: 0.28, fontSize: 10, color: C.text2 });
    }
    txt(s, 'OUR APPROACH', { x: M, y: 3.85, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const ap = [['FiEye', 'Detect', 'Outlet sell-out −20%+ in 3 months while the brand grows 20%+ online, or the rep\'s signal'], ['FiSliders', 'Resize', 'Order guardrail uses a 21-day cover norm, not 30: stop loading general trade'], ['FiSmartphone', 'Hand off', 'Flag to the quick-commerce KAM and demand planning: move allocation online'], ['FiRefreshCw', 'Route', 'Fresh stock follows demand online; ageing stock is rebalanced within general trade, never dumped']];
    for (let i = 0; i < 4; i++) {
      const y = 4.2 + i * 0.66;
      await iconDot(s, ap[i][0], M, y, 0.5, '5B3A8A');
      txt(s, ap[i][1], { x: M + 0.65, y, w: 1.1, h: 0.5, fontSize: 14, bold: true, valign: 'middle' });
      txt(s, ap[i][2], { x: M + 1.75, y, w: 4.45, h: 0.6, fontSize: 12, valign: 'middle' });
    }
    shot(s, '12-manager-qcomm.jpg', 6.75, 4.2, 5.98, 2000 / 692, 'Manager channel-shift card');
    txt(s, 'In the app: 5 SKU-outlets shifting online; ₹23,160 of general-trade loading avoided against retailer asks (synthetic)', { x: 6.75, y: 6.35, w: 5.98, h: 0.45, fontSize: 11, italic: true, color: C.text2 });
    s.addNotes(`Quick commerce is the force that makes this problem urgent now.

NielsenIQ reports that in India's top eight metros, about 18% of FMCG sales are already online, and over three-quarters of that is quick commerce. L'Oréal itself has named quick commerce a priority. But dark stores hold only days of stock, so when demand moves online, the old volumes keep flowing into general-trade distributors and age there. That's exactly what happened at Dabur.

Our approach has four steps. Detect: when an outlet's sales fall while the brand grows online, that's demand moving, not dying. Resize: the order guardrail tightens for that SKU at that outlet. Hand off: the rep flags it to the quick-commerce key-account team. Route: fresh stock follows demand online, while ageing stock stays in general trade. We never dump it online at a discount, which is what distributors have publicly objected to.`);
  }

  // ======================= 12. PRODUCT JOURNEY =======================
  {
    pres.addSection({ title: 'The product' });
    const s = content('The product', 'THE PRODUCT EXPERIENCE', 'A working product, not a concept: the rep\'s visit end to end', 'Genuine screenshots of the live prototype (synthetic data; fictional brands Lumea, Verdé, Chroma, DermaPure, Salon Pro, Maison Éclat). Not connected to any L\'Oréal system.');
    const tiles = [['01-rep-beat-c.jpg', '1  Today\'s beat', 'Outlets ranked by ₹ at stake'], ['03-scan-c.jpg', '2  Scan barcode & batch', 'Smart Count with 12 signals'], ['05-why-flagged-c.jpg', '3  Why it\'s flagged', 'Plain-English risk + FEFO view'], ['07-recommendations-c.jpg', '4  Recommended actions', 'Accept, modify or reject'], ['09-order-guardrail-c.jpg', '5  Order guardrail', 'Asked vs suggested, with reasons'], ['10-approvals-c.jpg', '6  ASM approvals', 'Guardrail checks attached']];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = M + col * 3.35, y = 1.85 + row * 2.6;
      shot(s, tiles[i][0], x, y, 3.05, 1.6, tiles[i][1]);
      txt(s, tiles[i][1], { x, y: y + 1.95, w: 3.05, h: 0.28, fontSize: 13, bold: true, color: C.accent1 });
      txt(s, tiles[i][2], { x, y: y + 2.21, w: 3.05, h: 0.25, fontSize: 11, color: C.text2 });
    }
    card(s, 10.65, 1.85, 2.08, 5.0, C.background2);
    txt(s, 'Try it yourself', { x: 10.8, y: 2.0, w: 1.8, h: 0.35, fontSize: 15, bold: true, color: C.accent1, align: 'center' });
    const qr = await QRCode.toBuffer(LIVE, { margin: 1, width: 600, color: { dark: '#6E1A30', light: '#FFFFFF' } });
    s.addImage({ data: 'image/png;base64,' + qr.toString('base64'), x: 10.89, y: 2.45, w: 1.6, h: 1.6, objectName: nm('qr'), altText: 'QR code to the live SMARTSELL prototype' });
    txt(s, [{ text: 'smartsell-loreal.vercel.app', options: { hyperlink: { url: LIVE }, color: C.accent1, bold: true } }], { x: 10.75, y: 4.15, w: 1.88, h: 0.5, fontSize: 11, align: 'center' });
    txt(s, [
      { text: 'Built-in 5-minute judge guide', options: { bullet: { indent: 14 }, breakLine: true } },
      { text: 'Works on a phone', options: { bullet: { indent: 14 }, breakLine: true } },
      { text: 'Reset anytime; your own copy of the data', options: { bullet: { indent: 14 } } },
    ], { x: 10.8, y: 4.75, w: 1.83, h: 1.9, fontSize: 11, paraSpaceAfter: 6, color: C.text1 });
    s.addNotes(`This is the actual product, running today. Every screen here is a real screenshot.

One: the rep's day, with outlets ranked by rupees at stake. Two: Smart Count, with a simulated barcode and batch scan and the twelve signals. Three: "why it's flagged", in plain English, batch by batch. Four: ranked actions the rep can accept, modify or reject with a reason. Five: the order guardrail, showing what the retailer asked for against what will actually sell. Six: the manager's approval queue, with guardrail checks attached.

You can try it yourself at smartsell-loreal.vercel.app. There's a five-minute judge guide built in, and it works on a phone.

[If presenting live: switch to the demo here. Follow the judge guide: Shree Beauty, count, why flagged, accept the transfer, order, approve as manager, fast-forward a quarter.]`);
  }

  // ======================= 13. PROOF / OUTCOMES =======================
  {
    const s = content('The product', 'THE LOOP CLOSES', 'In simulation, the same stock produces half the returns and far fewer empty shelves', 'Illustrative simulation in the prototype: synthetic Mumbai network (18 outlets, 3 distributors, 24 SKUs), 13 weeks, same starting stock, only the hero transfer accepted. Not a forecast of L\'Oréal results.');
    s.addChart(pres.charts.BAR, [
      { name: 'With SMARTSELL', labels: ['Returned / expired stock', 'Sales lost to stock-outs'], values: [16416, 1526] },
      { name: 'Business-as-usual', labels: ['Returned / expired stock', 'Sales lost to stock-outs'], values: [30276, 37900] },
    ], {
      x: M, y: 1.85, w: 6.2, h: 3.6, barDir: 'col', barGrouping: 'clustered', chartColors: [HEX.accent1, 'C9C1B9'],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '₹#,##0', dataLabelFontSize: 11, dataLabelColor: HEX.dk1, dataLabelFontFace: '+mn-lt',
      showLegend: true, legendPos: 't', legendFontSize: 12, legendFontFace: '+mn-lt', legendColor: HEX.dk1,
      catAxisLabelColor: HEX.dk2, catAxisLabelFontSize: 12, catAxisLabelFontFace: '+mn-lt', valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
      showTitle: true, title: 'After one quarter (₹, synthetic territory)', titleFontSize: 13, titleColor: HEX.dk1, titleFontFace: '+mn-lt', objectName: nm('outcome-chart'),
    });
    const st = [['0.9%', 'vs 1.6%', 'returns as % of sell-out (case cap ≈1.5%)'], ['−₹13,860', '', 'expiry risk rescued by one transfer'], ['66', 'units', 'saved from reverse logistics and destruction']];
    for (let i = 0; i < 3; i++) {
      const x = M + i * 2.1;
      txt(s, [{ text: st[i][0], options: { fontFace: 'Cambria', fontSize: 24, bold: true, color: C.accent3 } }, { text: st[i][1] ? `  ${st[i][1]}` : '', options: { fontSize: 12, color: C.text2 } }], { x, y: 5.65, w: 2.0, h: 0.5 });
      txt(s, st[i][2], { x, y: 6.15, w: 1.95, h: 0.6, fontSize: 11, color: C.text2 });
    }
    shot(s, '11-manager-c.jpg', 7.15, 1.85, 5.58, 1.6, 'Manager territory overview');
    txt(s, 'Manager view: ₹ at risk, near-expiry %, stock-outs, completion, ₹ rescued', { x: 7.15, y: 5.4, w: 5.58, h: 0.3, fontSize: 11, italic: true, color: C.text2 });
    card(s, 7.15, 5.8, 5.58, 0.95, C.background2);
    txt(s, 'Fast-forward runs two worlds from the same stock: SMARTSELL (guardrail orders, transfers, interventions) vs business-as-usual ("same as last time" re-orders, retailer asks, no rebalancing).', { x: 7.3, y: 5.85, w: 5.3, h: 0.85, fontSize: 12, valign: 'middle' });
    s.addNotes(`Does it work? We built a side-by-side simulation into the product. Same starting stock, two worlds, fast-forwarded one quarter.

In the business-as-usual world, retailers re-order "same as last time" and nothing is rebalanced. In the SMARTSELL world, orders follow the guardrail and approved actions execute. With just the one hero transfer accepted, returns roughly halve, and lost sales from empty shelves almost disappear.

Interestingly, the business-as-usual world lands at about 1.6% of sell-out returned, close to the case's 1.5% figure, which suggests the model behaves realistically. SMARTSELL brings it to about 0.9%.

To be clear: this is a synthetic simulation, not a forecast. Its job is to show the mechanism. The pilot's job is to measure the real number.`);
  }

  // ======================= 14. FINANCIAL CASE =======================
  {
    pres.addSection({ title: 'Impact and roll-out' });
    const s = content('Impact and roll-out', 'BUSINESS IMPACT', 'Base case: ≈₹18 cr a year net, with honest bounds', 'Illustrative model (model/financial_model.py). Sourced inputs: case ≈1.5% and ≈1%; L\'Oréal India FY25 net sales ≈₹5,925 cr (rounded to ₹5,900 cr). All other inputs are assumptions: see Appendix C. Excludes quick-commerce loading avoided (not modelled).');
    // waterfall with shapes
    txt(s, 'BASE CASE, ₹ CR PER YEAR (STEADY STATE)', { x: M, y: 1.85, w: 6.5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const items = [['Expiry loss avoided', 8.0, 0, C.accent3], ['Handling avoided', 5.3, 8.0, C.accent3], ['Cost to recover', -2.0, 13.3, C.accent5], ['Contribution from fewer stock-outs', 6.9, 11.3, C.accent3], ['Net benefit', 18.2, 0, C.accent1]];
    const baseY = 6.25, scale = 3.6 / 20, bw = 0.95;
    s.addShape(pres.shapes.LINE, { x: M, y: baseY, w: 6.3, h: 0, line: { color: 'C9C1B9', width: 1 }, objectName: nm('axis') });
    items.forEach(([label, v, start, col], i) => {
      const x = M + 0.15 + i * 1.25;
      const top = v >= 0 ? start + v : start;
      const bottom = v >= 0 ? start : start + v;
      const y = baseY - top * scale;
      const h = Math.max(0.04, (top - bottom) * scale);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: bw, h, fill: { color: col }, line: { color: col, width: 0 }, objectName: nm('waterfall-bar') });
      txt(s, `${v > 0 && i < 4 ? '+' : ''}${v.toFixed(1)}`, { x: x - 0.1, y: y - 0.32, w: bw + 0.2, h: 0.3, fontSize: 13, bold: true, align: 'center', color: col });
      txt(s, label, { x: x - 0.15, y: baseY + 0.05, w: bw + 0.3, h: 0.6, fontSize: 10, align: 'center', color: C.text2 });
    });
    txt(s, 'Pool ₹147.5 cr (2.5% × ₹5,900 cr) → only ≈36% addressable by field sales → 25% of that prevented', { x: M, y: 2.2, w: 6.3, h: 0.5, fontSize: 12, color: C.text1 });
    // scenario table
    const rows = [['', 'Conservative', 'Base', 'Optimistic'], ['Addressable share of waste pool', '25%', '36%', '46%'], ['Waste prevented (of addressable)', '15%', '25%', '35%'], ['Net benefit per year', '₹7.3 cr', '₹18.2 cr', '₹32.8 cr'], ['3-year cost (build + run)', '₹18.0 cr', '₹15.0 cr', '₹12.0 cr'], ['3-year ROI', '≈1%', '≈204%', '≈584%'], ['Units saved from waste / year', '≈1.3 lakh', '≈3.2 lakh', '≈5.6 lakh']];
    const tbl = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0 || ci === 2, color: ri === 0 ? 'FFFFFF' : HEX.dk1, fill: { color: ri === 0 ? HEX.accent1 : ci === 2 ? 'F4EFEA' : 'FFFFFF' }, align: ci === 0 ? 'left' : 'center' } })));
    s.addTable(tbl, { x: 7.15, y: 1.85, w: 5.58, colW: [2.28, 1.1, 1.1, 1.1], fontFace: 'Calibri', fontSize: 12, rowH: 0.44, border: { type: 'solid', color: 'E4DDD6', pt: 0.75 }, valign: 'middle', objectName: nm('scenario-table') });
    card(s, 7.15, 5.15, 5.58, 1.6, C.background2);
    txt(s, [
      { text: 'How to read it  ', options: { bold: true, color: C.accent1 } },
      { text: 'Base case pays back in year 2 (year-1 ROI ≈ −9% while it ramps up). The conservative case only breaks even, which is why we propose a pilot with stop criteria. Waste reduction alone is worth ≈₹11.3 cr a year before any growth benefit.', options: {} },
    ], { x: 7.3, y: 5.22, w: 5.3, h: 1.45, fontSize: 12, valign: 'middle' });
    s.addNotes(`Now the money, with honest bounds.

We start from the case's pools: 2.5% of revenue, roughly 147 crore at L'Oréal India's scale. But we don't claim it all. Only about a third arises in channels and causes a rep can influence, and we assume a quarter of that can be prevented.

The waterfall shows the base case: 8 crore of expiry loss avoided, 5.3 crore of handling avoided, minus 2 crore to actually move the stock, plus 6.9 crore of contribution from fewer stock-outs, valued at margin, not revenue. Net: about 18 crore a year.

We avoid double counting: stock rescued by a transfer is counted once, never again as extra sales.

The conservative case only breaks even. We're showing you that on purpose. It's why we're asking for a pilot, not a national roll-out.`);
  }

  // ======================= 15. ROADMAP =======================
  {
    const s = content('Impact and roll-out', 'IMPLEMENTATION ROADMAP', 'A 16-week pilot that proves it, or stops it', 'Pilot design and budget are proposals to agree with L\'Oréal (≈₹50 lakh: build ₹20 L, data ₹10 L, training ₹5 L, intervention budget ₹10 L, measurement ₹5 L). Returns are a lagging metric, so they are re-measured at +6 months.');
    const ph = [['Pilot', 'Weeks 0–16', 'Two cities, test vs control; shadow scorecard'], ['Validate', 'Months 4–7', 'Returns follow-up at +6 months; calibrate parameters'], ['Optimise', 'Months 5–9', 'Integrate into existing SFA; paid scorecard; top-10 metros'], ['Scale', 'Months 10–18+', 'All territories; salon and derma variants; ML where proven']];
    for (let i = 0; i < 4; i++) {
      const x = M + i * 3.07;
      s.addShape(pres.shapes.CHEVRON, { x, y: 1.9, w: 2.95, h: 0.75, fill: { color: i === 0 ? HEX.accent1 : i === 1 ? '8E3A50' : i === 2 ? 'B07282' : 'CFA9B3' }, line: { color: 'FFFFFF', width: 0 }, objectName: nm('phase') });
      txt(s, ph[i][0], { x: x + 0.6, y: 1.9, w: 2.1, h: 0.75, fontSize: 16, bold: true, color: i < 2 ? C.background1 : C.text1, valign: 'middle' });
      txt(s, ph[i][1], { x, y: 2.75, w: 2.9, h: 0.3, fontSize: 12, bold: true, color: C.accent1 });
      txt(s, ph[i][2], { x, y: 3.05, w: 2.85, h: 0.6, fontSize: 12, color: C.text1 });
    }
    // pilot design grid
    const pd = [['FiCompass', 'Geography', 'Mumbai (quick-commerce heavy) + one tier-2 city, e.g. Nagpur or Indore'], ['FiTruck', 'Coverage', '4 test + 4 control distributors; ~600 outlets; ~12 reps'], ['FiPackage', 'SKUs', '40 focus SKUs: top 20 by past returns + top 20 by velocity'], ['FiUsers', 'Training', '1-day workshop, 2 ride-along days per rep, weekly ASM huddle'], ['FiSmartphone', 'Technology', 'Prototype hardened into a PWA on a weekly DMS extract, or configured in the existing SFA'], ['FiTarget', 'Measurement', 'Test vs control; weekly leading KPIs; returns at +6 months']];
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + col * 3.95, y = 3.9 + row * 0.95;
      await iconDot(s, pd[i][0], x, y, 0.48);
      txt(s, pd[i][1], { x: x + 0.6, y, w: 3.2, h: 0.3, fontSize: 13, bold: true });
      txt(s, pd[i][2], { x: x + 0.6, y: y + 0.3, w: 3.25, h: 0.6, fontSize: 11, color: C.text2 });
    }
    card(s, 8.6, 3.9, 4.13, 2.85, C.background2);
    txt(s, 'Decision at week 16', { x: 8.8, y: 4.0, w: 3.8, h: 0.35, fontSize: 15, bold: true, color: C.accent1 });
    txt(s, [
      { text: 'Scale if: ', options: { bold: true, color: C.accent3 } },
      { text: 'at-risk ₹ down ≥20% vs control, stock-outs down ≥15%, secondary growth ≥ control, ≥70% of actions completed, ≤4 extra minutes per visit', options: { breakLine: true } },
      { text: ' ', options: { fontSize: 6, breakLine: true } },
      { text: 'Stop if: ', options: { bold: true, color: C.accent5 } },
      { text: 'at-risk ₹ improves <10%, or growth falls more than 2 points below control', options: {} },
    ], { x: 8.8, y: 4.4, w: 3.8, h: 2.3, fontSize: 12 });
    s.addNotes(`How do we get from prototype to proof? A 16-week pilot that either proves it or stops it.

Two cities: Mumbai, where quick commerce is strongest, and one tier-2 city where general trade dominates. Four test distributors against four matched controls, about 600 outlets, a dozen reps, and forty focus SKUs chosen from past returns and top sellers.

Training is light: a one-day workshop and two ride-along days. The technology is our prototype, hardened and fed by a weekly distributor-data extract, or configured inside L'Oréal's existing SFA if the vendor allows.

On the right is the decision rule, agreed up front. If at-risk stock doesn't fall at least 20% versus control without hurting growth, we stop. The budget is about 50 lakh, and what it buys is evidence.`);
  }

  // ======================= 16. KPI & GOVERNANCE =======================
  {
    const s = content('Impact and roll-out', 'KPI AND GOVERNANCE FRAMEWORK', 'One scorecard for growth and waste, owned by the sales line', 'Targets are pilot proposals measured against control territories. Scorecard weights are assumptions to agree with L\'Oréal sales leadership.');
    const k = [['Expiry & return rate', '₹ returned ÷ ₹ secondary sales', '−15% at +6 months'], ['At-risk inventory value', 'Σ projected unsold × unit value', '−25%'], ['Sell-through', 'Units sold ÷ (opening + receipts)', '+10% on flagged SKUs'], ['Days of inventory', 'Stock ÷ daily sell-out', 'Within norm ±20%'], ['Stock-out rate', 'Must-stock SKUs at zero ÷ checked', '−20%'], ['Intervention completion', 'Actions done ÷ accepted', '≥70%'], ['Inventory recovered', '₹ of at-risk stock sold via transfer, bundle or activation', 'Tracked'], ['Incremental contribution & ROI', '(Test − control growth) × margin − costs', '≥ control']];
    for (let i = 0; i < 8; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const x = M + col * 3.07, y = 1.85 + row * 1.55;
      card(s, x, y, 2.92, 1.42, C.background2);
      txt(s, k[i][0], { x: x + 0.18, y: y + 0.12, w: 2.6, h: 0.32, fontSize: 14, bold: true, color: C.accent1 });
      txt(s, k[i][1], { x: x + 0.18, y: y + 0.46, w: 2.6, h: 0.55, fontSize: 11, color: C.text2 });
      txt(s, k[i][2], { x: x + 0.18, y: y + 1.0, w: 2.6, h: 0.3, fontSize: 13, bold: true, color: C.accent3 });
    }
    // governance cadence
    txt(s, 'GOVERNANCE CADENCE', { x: M, y: 5.05, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const cad = [['Daily', 'Rep: visits, Smart Count, actions'], ['Weekly', 'ASM: approvals, repeat offenders, coaching'], ['Monthly', 'Distributor ageing review; brand and demand-planning readout'], ['Quarterly', 'Sales leadership: scorecard, policy on returns and schemes']];
    for (let i = 0; i < 4; i++) {
      const y = 5.4 + i * 0.36;
      txt(s, cad[i][0], { x: M, y, w: 1.1, h: 0.32, fontSize: 12, bold: true, color: C.accent1 });
      txt(s, cad[i][1], { x: M + 1.1, y, w: 5.1, h: 0.32, fontSize: 12 });
    }
    // healthy sales scorecard
    txt(s, 'HEALTHY SALES SCORECARD (REP INCENTIVE)', { x: 7.15, y: 5.05, w: 5.6, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2 });
    const sc = [['Secondary sales vs target', 50, HEX.accent1], ['Sell-through health', 20, HEX.accent3], ['Availability', 15, HEX.accent4], ['Execution', 15, HEX.accent2]];
    let x = 7.15;
    sc.forEach(([label, wgt, col]) => {
      const w = 5.58 * (wgt / 100);
      s.addShape(pres.shapes.RECTANGLE, { x, y: 5.45, w, h: 0.5, fill: { color: col }, line: { color: 'FFFFFF', width: 1 }, objectName: nm('scorecard-bar') });
      txt(s, `${wgt}%`, { x, y: 5.45, w, h: 0.5, fontSize: 13, bold: true, color: C.background1, align: 'center', valign: 'middle' });
      txt(s, label, { x, y: 6.0, w, h: 0.6, fontSize: 10, color: C.text2, align: 'center' });
      x += w;
    });
    s.addNotes(`How will management know it's working? Eight KPIs, deliberately balanced between waste and growth.

The waste side: return rate, at-risk inventory value, days of inventory and inventory recovered. The growth side: sell-through, stock-out rate and incremental contribution. And intervention completion, because the playbook only works if it's used.

The cadence is simple: reps daily, ASMs weekly, distributors and brand teams monthly, and sales leadership quarterly.

Most importantly, the incentive. Without changing what reps are paid for, no tool changes behaviour. Our Healthy Sales Scorecard keeps secondary sales at half the weight, so growth stays the priority, and adds sell-through health, availability and execution. In the pilot it runs as a shadow scorecard first.`);
  }

  // ======================= 17. CLOSING =======================
  {
    const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Impact and roll-out' });
    s.addText('THE CLOSE', { placeholder: 'kicker' });
    s.addText('From order collection to intelligent demand and inventory management', { placeholder: 'title' });
    const shifts = [['Selling more into the channel', 'Moving the right stock to the right shelf'], ['Finding waste at the return', 'Catching it while the fix is cheap'], ['Discount as the default', 'Discount as the guarded last resort'], ['Quick commerce as a threat', 'Quick commerce as a planning signal']];
    for (let i = 0; i < 4; i++) {
      const y = 3.05 + i * 0.6;
      txt(s, shifts[i][0], { x: M, y, w: 4.6, h: 0.45, fontSize: 16, color: 'B9AFA6', valign: 'middle' });
      s.addShape(pres.shapes.LINE, { x: 5.35, y: y + 0.22, w: 0.6, h: 0, line: { color: HEX.accent2, width: 1.5, endArrowType: 'triangle' }, objectName: nm('arrow') });
      txt(s, shifts[i][1], { x: 6.15, y, w: 6.3, h: 0.45, fontSize: 18, bold: true, color: C.background1, valign: 'middle' });
    }
    txt(s, "Every unit that sells instead of expiring is waste avoided at the top of the hierarchy, before any recycling, in line with L'Oréal for the Future.", { x: M, y: 5.6, w: 11.8, h: 0.6, fontSize: 15, italic: true, color: C.accent2 });
    txt(s, [{ text: 'Our ask: one distributor-data extract, two territories, 16 weeks.   ', options: { bold: true, color: C.background1 } }, { text: 'Try it: smartsell-loreal.vercel.app', options: { hyperlink: { url: LIVE }, color: C.accent2 } }], { x: M, y: 6.4, w: 12, h: 0.4, fontSize: 15 });
    s.addNotes(`Let me close with the shift we're proposing.

Today, a rep's job is to collect orders. With SMARTSELL, it becomes intelligent demand and inventory management: moving the right stock to the right shelf, catching waste while the fix is cheap, keeping discounts as a last resort, and treating quick commerce as a planning signal rather than a threat.

And every unit that sells instead of expiring is waste avoided at the very top of the waste hierarchy, before any recycling. That fits L'Oréal for the Future.

We didn't add a new team or a new system. We gave L'Oréal's existing salesforce a reason, a routine and a tool. Our ask is one data extract, two territories and sixteen weeks. Thank you; we'd love your questions.`);
  }

  // ======================= APPENDIX =======================
  pres.addSection({ title: 'Appendix' });
  {
    const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Appendix' });
    s.addText('APPENDIX', { placeholder: 'kicker' });
    s.addText('Evidence, methodology and Q&A', { placeholder: 'title' });
    const items = ['A  Sources and data integrity', 'B  Risk methodology and parameters', 'C  Financial model assumptions and sensitivity', 'D  The five playbooks', 'E  Five biggest risks and how we address them', 'F  Likely judge questions', 'G  Solution options we considered'];
    txt(s, items.map((t, i) => ({ text: t, options: { breakLine: i < items.length - 1 } })), { x: M, y: 3.0, w: 8, h: 3.5, fontSize: 18, color: C.background1, paraSpaceAfter: 6 });
    s.addNotes('Appendix slides for Q&A. Jump to the relevant one when a judge asks about sources, the formula, the financial assumptions, playbooks, risks or alternatives.');
  }
  // A Sources
  {
    const s = content('Appendix', 'APPENDIX A · SOURCES AND DATA INTEGRITY', 'What is fact, what is research, what is our estimate', 'Full source register with URLs: research folder, sources.md. Some claims were verified from search summaries of the named pages; re-open before external use. Global data is labelled as such.');
    const leg = [['Case fact', 'From the L\'Oréal brief: ≈1.5% returns/expired/damaged; ≈1% handling; field teams see distributor and retailer inventory', C.accent1], ['Research finding', 'Public, dated sources (below). India unless marked global', C.accent4], ['Estimate', 'Our modelled numbers: financial scenarios, addressable shares, uplifts', C.accent6], ['Synthetic', 'All prototype data: fictional brands, outlets, people, online growth rates', C.text2]];
    for (let i = 0; i < 4; i++) {
      const y = 1.85 + i * 0.55;
      pill(s, leg[i][0], M, y + 0.08, 1.7, leg[i][2], C.background1, 10);
      txt(s, leg[i][1], { x: M + 1.85, y, w: 3.85, h: 0.5, fontSize: 11, valign: 'middle' });
    }
    const src = [
      ["L'Oréal India FY24 revenue ₹5,576 cr; FY25 net sales ₹5,925 cr, profit ₹597.5 cr", 'Indiaretailing, 27 Nov 2024; PTI/The Week, 3 Oct 2025'],
      ["India +14% LFL (H1 2025), +17% (H1 2026); SAPMENA-SSA +10.9% (2025)", "L'Oréal half-year results; 2025 URD"],
      ["Quick commerce a focus; CeraVe and La Roche-Posay expanding", 'Business Standard, 25 Oct 2026'],
      ['E-com 18% of FMCG in top-8 metros; q-comm >¾ of e-com; kirana volume +1.1%', 'NielsenIQ Q4 2025 snapshot, Mar 2026'],
      ['Dabur cut distributor stock 30 → 21 days; halted primary 7–8 days', 'Sharekhan 30 Oct 2024; Baroda Securities 31 Oct 2024'],
      ['AICPDF alleges near-expiry dumping via quick commerce', 'Storyboard18, Nov 2024 (allegation)'],
      ['HUL Shikhar: 1.4 m retailers; dormancy challenges', 'Unilever 2023; WARC'],
      ['Cosmetics labels must carry use-before / expiry date', 'CDSCO Cosmetics Rules 2020 (amended 2025)'],
      ['Packaging 33% recycled, 44% recycled or bio-based (2025)', "L'Oréal 2025 URD"],
      ['Out-of-stock: ≈8% average; ≈1 in 3 shoppers switch or don\'t buy', 'Gruen, Corsten & Bharadwaj 2002 (global)'],
    ];
    const tbl = [[{ text: 'Claim', options: { bold: true, color: 'FFFFFF', fill: { color: HEX.accent1 } } }, { text: 'Source, date', options: { bold: true, color: 'FFFFFF', fill: { color: HEX.accent1 } } }], ...src.map((r) => [{ text: r[0] }, { text: r[1], options: { color: HEX.dk2 } }])];
    s.addTable(tbl, { x: 6.45, y: 1.85, w: 6.28, colW: [3.68, 2.6], fontFace: 'Calibri', fontSize: 10, rowH: 0.42, border: { type: 'solid', color: 'E4DDD6', pt: 0.5 }, valign: 'middle', objectName: nm('sources-table') });
    txt(s, 'Not publicly available (we did not invent these): L\'Oréal India channel mix, distributor and outlet counts, field-force size, SFA/DMS stack, return-policy terms, or what "capped at ≈1.5%" means. These are pilot set-up questions.', { x: M, y: 4.2, w: 5.6, h: 1.4, fontSize: 12, color: C.text1 });
    s.addNotes('If asked "where does this number come from?", this slide separates case facts, dated research, our estimates and synthetic prototype data. The full register with URLs is in sources.md in our research folder.');
  }
  // B Methodology
  {
    const s = content('Appendix', 'APPENDIX B · RISK METHODOLOGY', 'Every flag can be traced to five inputs and four parameters', 'Reference implementation: model/risk_engine_reference.py (Python) and lib/engine.ts (prototype). Unit tests check the worked examples.');
    const rows = [['Parameter', 'Outlet', 'Distributor', 'Why'], ['Minimum sellable buffer', '30 days', '120 days', 'Shoppers and retailers avoid packs close to expiry; distributor stock still has to reach a shelf'], ['Target days of cover', '30', '21', 'Distributor norm in line with publicly corrected FMCG levels'], ['Reorder point', '≤14 days', '≤12 days', 'Lead time 7 days + safety stock'], ['Overstock', '>2× norm', '>2× norm', 'Cash tied up even when it sells in time'], ['Channel-shift cover norm', '21 days', '—', 'Outlet −20% in 3 months while online grows +20%'], ['Confidence', 'Scan/DMS 1.0 · count 0.85 · verbal 0.5', '', 'Recency: ≤7 d ×1.0, ≤30 d ×0.8, older ×0.5; Low locks costly actions']];
    const tbl = rows.map((r, ri) => r.map((c) => ({ text: c, options: { bold: ri === 0, color: ri === 0 ? 'FFFFFF' : HEX.dk1, fill: { color: ri === 0 ? HEX.accent1 : 'FFFFFF' } } })));
    s.addTable(tbl, { x: M, y: 1.85, w: 12.13, colW: [2.6, 2.4, 1.5, 5.63], fontFace: 'Calibri', fontSize: 12, rowH: 0.48, border: { type: 'solid', color: 'E4DDD6', pt: 0.5 }, valign: 'middle', objectName: nm('params-table') });
    txt(s, [
      { text: 'Limitations we state openly: ', options: { bold: true, color: C.accent1 } },
      { text: 'velocity is assumed constant over the window (a trend factor and ML forecasts come later); stock-flow sell-out is noisy, so anomalies are flagged and confidence-weighted; buffers and norms are assumptions to calibrate against L\'Oréal\'s return terms; the engine recommends and people decide.', options: {} },
    ], { x: M, y: 5.55, w: 12.1, h: 1.2, fontSize: 13 });
    s.addNotes('Use this slide if a judge probes the formula or thresholds. Key message: every parameter is explicit and configurable, and the pilot calibrates them.');
  }
  // C Financial assumptions
  {
    const s = content('Appendix', 'APPENDIX C · FINANCIAL MODEL', 'Assumptions behind the ₹18 cr base case, and what moves it most', 'Model: model/financial_model.py; outputs in model/scenarios.csv. Double-counting rules: transferred units counted once (as avoided credit notes, never also as extra sales); stock-out benefit at contribution margin; distributor working capital excluded.');
    const rows = [['Input', 'Conservative', 'Base', 'Optimistic', 'Basis'], ['Revenue base', '₹5,900 cr', '₹5,900 cr', '₹5,900 cr', 'L\'Oréal India FY25 net sales, rounded (sourced)'], ['Waste pool', '1.5% + 1%', '1.5% + 1%', '1.5% + 1%', 'Case (sourced)'], ['Field-covered share', '50%', '60%', '70%', 'Assumption'], ['Sales-influenceable share', '50%', '60%', '65%', 'Assumption; validate with return reason codes'], ['Waste prevented', '15%', '25%', '35%', 'Assumption; pilot measures it'], ['Cost to recover stock', '35%', '25%', '20%', 'Of loss avoided'], ['Stock-out reduction', '10%', '20%', '30%', 'On an 8% OOS base, 35% brand loss (global study)'], ['Contribution margin', '35%', '35%', '35%', 'Assumption'], ['Build + year-1 run', '₹12.0 cr', '₹10.0 cr', '₹8.0 cr', 'Assumption; lower if configured in existing SFA']];
    const tbl = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0, color: ri === 0 ? 'FFFFFF' : ci === 4 ? HEX.dk2 : HEX.dk1, fill: { color: ri === 0 ? HEX.accent1 : ci === 2 ? 'F4EFEA' : 'FFFFFF' }, align: ci === 0 || ci === 4 ? 'left' : 'center' } })));
    s.addTable(tbl, { x: M, y: 1.85, w: 7.9, colW: [2.0, 1.1, 0.95, 1.05, 2.8], fontFace: 'Calibri', fontSize: 11, rowH: 0.4, border: { type: 'solid', color: 'E4DDD6', pt: 0.5 }, valign: 'middle', objectName: nm('assumptions-table') });
    s.addChart(pres.charts.BAR, [
      { name: 'Low', labels: ['Waste prevented 15–35%', 'Stock-out reduction 10–30%', 'Baseline OOS 5–12%', 'Field-covered share 50–70%', 'Contribution margin 25–45%'], values: [13.7, 14.8, 15.6, 15.2, 16.2] },
      { name: 'High', labels: ['Waste prevented 15–35%', 'Stock-out reduction 10–30%', 'Baseline OOS 5–12%', 'Field-covered share 50–70%', 'Contribution margin 25–45%'], values: [22.7, 21.7, 21.7, 21.3, 20.2] },
    ], {
      x: 8.75, y: 1.85, w: 3.98, h: 4.6, barDir: 'bar', barGrouping: 'clustered', chartColors: ['C9C1B9', HEX.accent1],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 10, dataLabelColor: HEX.dk1, dataLabelFontFace: '+mn-lt',
      showLegend: true, legendPos: 'b', legendFontSize: 10, legendFontFace: '+mn-lt', catAxisLabelFontSize: 10, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: '+mn-lt',
      valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, valAxisMinVal: 0,
      showTitle: true, title: 'Net benefit ₹ cr/yr (base 18.2)', titleFontSize: 12, titleColor: HEX.dk1, titleFontFace: '+mn-lt', objectName: nm('sensitivity-chart'),
    });
    s.addNotes('Walk through only if asked. The two assumptions that matter most are the waste-prevention rate and the stock-out reduction, which is exactly what the pilot is designed to measure.');
  }
  // D Playbooks
  {
    const s = content('Appendix', 'APPENDIX D · THE FIVE PLAYBOOKS', 'Each risk state gets its own sequence, cost and guardrail', 'Approval thresholds: transfers above ₹10,000 or across distributors, any scheme, sampling budget and end-of-life need ASM approval. Luxe and Derma: no price schemes; Luxe: no bundles.');
    const rows = [['Playbook', 'Sequence', 'Main risk', 'Guardrail'], ['Near-expiry', 'Verify batch → pause re-order → transfer projected-unsold units to the fastest outlets → approved bundle → controlled end-of-life if <30 days', 'Pushing short-dated stock onto retailers who return it', 'Transfer capped at recipient\'s sell-through capacity'], ['Slow-moving (healthy shelf life)', 'Diagnose (reason code) → visibility → tester or sampling → cap re-orders → range correction → rebalance if no change in 2 visits', 'Acting on the wrong diagnosis', 'Re-measure velocity at the next 2 visits'], ['Overstocked node', 'SKU-level cover review → guardrail on over-covered SKUs only → rebalance → reset norms by SKU class', 'Revenue cliff from blanket cuts', 'Fast SKUs keep ordering'], ['Stock-out risk', 'Source from surplus outlets first → replenish to cover + lead time → raise beat frequency', 'Over-correcting into excess', 'Capped at target cover'], ['Poor visibility / channel shift', 'Benchmark peers → placement and testers → or, if demand moved online, resize orders and hand off to quick-commerce KAM', 'Blaming the product for an execution or channel issue', 'Never dump ageing stock on quick commerce']];
    const tbl = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0 || ci === 0, color: ri === 0 ? 'FFFFFF' : ci === 0 ? HEX.accent1 : HEX.dk1, fill: { color: ri === 0 ? HEX.accent1 : 'FFFFFF' } } })));
    s.addTable(tbl, { x: M, y: 1.85, w: 12.13, colW: [2.1, 5.2, 2.5, 2.33], fontFace: 'Calibri', fontSize: 11, rowH: [0.38, 0.88, 0.88, 0.75, 0.66, 0.88], border: { type: 'solid', color: 'E4DDD6', pt: 0.5 }, valign: 'middle', objectName: nm('playbooks-table') });
    s.addNotes('Detail behind the action engine. Use if asked "what exactly does the rep do for X?"');
  }
  // E Risks
  {
    const s = content('Appendix', 'APPENDIX E · RISKS AND OBJECTIONS', 'The five biggest risks to SMARTSELL, and how we address them', 'Each mitigation is built into the prototype or the pilot design.');
    const r = [['FiUsers', 'Reps won\'t adopt it', 'Extra time, "another app", incentives still pay for sell-in', 'Count flagged SKUs only (≤4 min is a stop criterion); embed in existing SFA; Healthy Sales Scorecard; credit for ₹ rescued'], ['FiDatabase', 'Data is poor', 'No POS in general trade, missing batches, stale counts', 'Stock-flow sell-out; confidence weighting; "verify first" locks costly actions; DMS as the base layer'], ['FiAlertTriangle', 'Unintended consequences', 'Discount habit, brand dilution, channel conflict, under-ordering', 'Discount is step 6 of 8; no schemes for Luxe/Derma; transfers within authorised network; growth guardrail KPI vs control'], ['FiLayers', 'L\'Oréal already has systems', 'SFA/DMS and central demand sensing exist', 'SMARTSELL is a logic and workflow layer the current SFA can host; it feeds outlet signals into demand planning'], ['FiBarChart2', 'Benefits are overstated', 'Estimates mistaken for results', 'Only case % are sourced; three scenarios with a break-even conservative case; pilot with stop criteria']];
    for (let i = 0; i < 5; i++) {
      const y = 1.85 + i * 0.98;
      card(s, M, y, 12.13, 0.86, i % 2 ? 'FFFFFF' : C.background2);
      await iconDot(s, r[i][0], M + 0.15, y + 0.16, 0.54);
      txt(s, r[i][1], { x: M + 0.85, y: y + 0.08, w: 2.6, h: 0.7, fontSize: 14, bold: true, color: C.accent1, valign: 'middle' });
      txt(s, r[i][2], { x: M + 3.5, y: y + 0.08, w: 3.3, h: 0.7, fontSize: 12, color: C.text2, valign: 'middle' });
      txt(s, r[i][3], { x: M + 6.9, y: y + 0.08, w: 5.1, h: 0.7, fontSize: 12, valign: 'middle' });
    }
    s.addNotes('If a judge asks "what could go wrong?", answer with adoption first: it is the biggest risk, and it is why time-per-visit and completion rate are explicit pilot stop criteria.');
  }
  // F Q&A
  {
    const s = content('Appendix', 'APPENDIX F · LIKELY JUDGE QUESTIONS', 'Short answers to the questions we expect', 'Full answers: research folder, 12-judge-qa.md.');
    const qa = [['We already have an SFA and DMS. Why this?', 'They capture orders and stock. SMARTSELL adds the decision layer: batch-level risk at the outlet, sanctioned actions, and verified outcomes. Your SFA can host it.'], ['Where is the AI?', 'Deliberately rules-first so it can be audited. ML comes in phase 3 for sparse-SKU forecasts and learning which action works where.'], ['Reps visit 20 outlets a day. They won\'t count.', 'They count only flagged SKUs at flagged outlets. Batch dates are printed by law, so reading one takes seconds. ≤4 minutes is a stop criterion.'], ['Doesn\'t a transfer just move the problem?', 'Only if you send too much. Quantity is capped at what the recipient can sell before its own buffer date.'], ['What about quick commerce?', 'We detect demand moving online, tighten general-trade orders there and hand off to the quick-commerce KAM. We never dump short-dated stock online.'], ['Is the ₹18 cr real?', 'No. It\'s an illustrative base case built only on the case percentages and labelled assumptions. The pilot measures the real number.']];
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + col * 6.13, y = 1.85 + row * 1.6;
      card(s, x, y, 5.98, 1.45, C.background2);
      txt(s, qa[i][0], { x: x + 0.2, y: y + 0.12, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.accent1 });
      txt(s, qa[i][1], { x: x + 0.2, y: y + 0.5, w: 5.6, h: 0.9, fontSize: 12 });
    }
    s.addNotes('Keep answers to three beats: direct answer, evidence or number, what the pilot does about it.');
  }
  // G Options
  {
    const s = content('Appendix', 'APPENDIX G · OPTIONS CONSIDERED', 'Why a hybrid beats a tech-only or process-only answer', 'Weights and scores are our judgement (1–5). Weighted: tech-led 0.25·4+0.20·2+0.20·2+0.15·3+0.10·4+0.10·4 = 3.05, and so on. Judges are welcome to re-weight.');
    const rows = [['Criterion (weight)', 'Tech-led AI platform', 'Process-led playbook', 'Hybrid: SMARTSELL', 'Policy-led returns'], ['Business impact (25%)', '4', '3', '5', '2'], ['Feasibility in 6–12 months (20%)', '2', '5', '4', '4'], ['Answers the case brief (20%)', '2', '4', '5', '2'], ['Differentiation (15%)', '3', '2', '5', '1'], ['Scalability (10%)', '4', '2', '4', '5'], ['Judge demo appeal (10%)', '4', '1', '5', '1'], ['Weighted score', '3.05', '3.15', '4.70', '2.45']];
    const tbl = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0 || ri === rows.length - 1 || ci === 3, color: ri === 0 ? 'FFFFFF' : ci === 3 ? HEX.accent1 : HEX.dk1, fill: { color: ri === 0 ? HEX.accent1 : ci === 3 ? 'F4EFEA' : 'FFFFFF' }, align: ci === 0 ? 'left' : 'center' } })));
    s.addTable(tbl, { x: M, y: 1.85, w: 12.13, colW: [3.33, 2.2, 2.2, 2.2, 2.2], fontFace: 'Calibri', fontSize: 13, rowH: 0.5, border: { type: 'solid', color: 'E4DDD6', pt: 0.5 }, valign: 'middle', objectName: nm('options-table') });
    txt(s, 'Tech-only answers a question the case didn\'t ask (L\'Oréal already runs central demand sensing). Process-only can\'t rebalance across outlets or measure outcomes. Policy-only shifts the cost to distributors instead of removing waste.', { x: M, y: 6.0, w: 12.1, h: 0.75, fontSize: 13 });
    s.addNotes('Use if asked "why not just a better forecast?" or "why not just training?".');
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
