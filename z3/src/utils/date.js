/**
 * Práca s dátumami a časmi.
 *
 * Pravidlá:
 *  - Na server posielame vždy ISO 8601 v UTC (Date.toISOString(), napr. "2026-11-20T08:00:00.000Z").
 *  - Zo servera prijímame ISO 8601 reťazec. Ak nemá časové pásmo ("2026-11-20T08:00:00"),
 *    považujeme ho za UTC – je to konzistentné s tým, čo posielame.
 *  - Používateľovi zobrazujeme všetko v jeho lokálnom čase (Intl, locale sk-SK).
 */

const HAS_TIMEZONE = /([zZ]|[+-]\d{2}:?\d{2})$/;

export function parseServerDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  let s = String(value).trim().replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';
  if (!HAS_TIMEZONE.test(s)) s += 'Z';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toServerDate(date) {
  return date.toISOString();
}

const pad = (n) => String(n).padStart(2, '0');

/** Date -> hodnota pre <input type="datetime-local"> (lokálny čas) */
export function toInputValue(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Hodnota z <input type="datetime-local"> -> Date (lokálny čas) */
export function fromInputValue(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateFmt = new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit' });
const weekdayFmt = new Intl.DateTimeFormat('sk-SK', { weekday: 'short' });

export const formatDate = (d) => (d ? dateFmt.format(d) : '—');
export const formatTime = (d) => (d ? timeFmt.format(d) : '');
export const formatDateTime = (d) => (d ? `${weekdayFmt.format(d)} ${dateFmt.format(d)}, ${timeFmt.format(d)}` : '—');

export function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "pi 20. 11. 2026, 08:00 – 10:00" alebo "pi 20. 11. 2026, 08:00 – ne 22. 11. 2026, 18:00" */
export function formatRange(from, to) {
  if (!from || !to) return '—';
  if (isSameDay(from, to)) return `${formatDateTime(from)} – ${formatTime(to)}`;
  return `${formatDateTime(from)} – ${formatDateTime(to)}`;
}

/** Zaokrúhli čas nahor na najbližšiu celú hodinu */
export function nextFullHour(base = new Date()) {
  const d = new Date(base);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function addHours(date, hours) {
  return new Date(date.getTime() + hours * 3600_000);
}
