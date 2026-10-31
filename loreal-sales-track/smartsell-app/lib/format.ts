export function inr(n: number, compact = true): string {
  const v = Math.round(n);
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (compact && a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(2)} Cr`;
  if (compact && a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(1)} L`;
  return `${sign}₹${a.toLocaleString('en-IN')}`;
}

export const num = (n: number, dp = 0) =>
  Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: dp, minimumFractionDigits: 0 }) : '∞';

export const pct = (n: number, dp = 1) => `${(n * 100).toFixed(dp)}%`;

export const days = (n: number) => (Number.isFinite(n) ? `${Math.round(n)} d` : '∞');
