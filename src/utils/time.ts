import { Shift } from '../types';

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtDate(d: string): string {
  if (!d) return "—";
  const p = d.split("-");
  if (p.length < 3) return d;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

export function fmtTs(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function computeDurationHours(fromHHMM: string, toHHMM: string): number {
  if (!fromHHMM || !toHHMM) return 0;
  const fm = fromHHMM.split(':').map(Number);
  const tm = toHHMM.split(':').map(Number);
  if (fm.length < 2 || tm.length < 2 || isNaN(fm[0]) || isNaN(tm[0])) return 0;
  
  const startMin = fm[0] * 60 + fm[1];
  let endMin = tm[0] * 60 + tm[1];
  
  let diff = endMin - startMin;
  if (diff <= 0) diff += 24 * 60; // overnight wraparound
  
  return Math.round((diff / 60) * 100) / 100;
}

export function fmtDuration(hrs: number | null | undefined): string {
  if (hrs == null || isNaN(hrs)) return "—";
  let h = Math.floor(hrs);
  let m = Math.round((hrs - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h}h ${pad(m)}m`;
}

export function currentShift(): Shift {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return "A";
  if (h >= 14 && h < 22) return "B";
  return "C";
}

export function shiftLabel(s: Shift): string {
  switch (s) {
    case "A": return "A Shift (6 AM–2 PM)";
    case "B": return "B Shift (2 PM–10 PM)";
    case "C": return "C Shift (10 PM–6 AM)";
  }
}
