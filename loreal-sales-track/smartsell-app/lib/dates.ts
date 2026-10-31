const DAY = 86_400_000;

export const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
export const daysBetween = (from: string, to: string) => Math.round((toMs(to) - toMs(from)) / DAY);
export const addDays = (d: string, n: number) => new Date(toMs(d) + n * DAY).toISOString().slice(0, 10);
export const batchCodeFor = (mfgDate: string) => `B${mfgDate.slice(2, 4)}${mfgDate.slice(5, 7)}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDate(d: string, withDow = false) {
  const dt = new Date(toMs(d));
  const s = `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
  return withDow ? `${DOW[dt.getUTCDay()]}, ${s}` : s;
}
