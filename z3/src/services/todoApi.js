/**
 * Služba na komunikáciu s REST API (oddelená od používateľského rozhrania).
 * Dokumentácia API: https://wt1zadanie.iolab.sk/docs
 */
import { parseServerDate, toServerDate } from '../utils/date.js';

// Adresu je možné pri vývoji prepísať premennou VITE_API_URL (napr. v súbore .env.local)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://wt1zadanie.iolab.sk').replace(/\/$/, '');
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = sieťová chyba / timeout
    this.details = details;
  }
}

/** Zrozumiteľná správa z chybovej odpovede (FastAPI vracia { detail: ... }) */
function describeError(status, data) {
  let detail = '';
  if (data && typeof data === 'object' && 'detail' in data) {
    detail = Array.isArray(data.detail)
      ? data.detail.map((d) => `${(d.loc || []).slice(1).join('.')}: ${d.msg}`).join('; ')
      : String(data.detail);
  }
  const base =
    {
      400: 'Server odmietol požiadavku (neplatné údaje).',
      404: 'Úloha alebo zoznam sa na serveri nenašli.',
      422: 'Server odmietol údaje – nesprávny formát.',
      429: 'Príliš veľa požiadaviek, skúste to o chvíľu.',
    }[status] || (status >= 500 ? 'Na serveri nastala chyba. Skúste to neskôr.' : `Požiadavka zlyhala (HTTP ${status}).`);
  return detail ? `${base} (${detail})` : base;
}

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const options = { method, headers: { Accept: 'application/json' }, signal: controller.signal };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, options);
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'Server neodpovedal včas. Skontrolujte pripojenie a skúste to znova.'
        : 'Nepodarilo sa spojiť so serverom. Skontrolujte internetové pripojenie.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) throw new ApiError(describeError(response.status, data), response.status, data);
  return data;
}

const userPath = (name) => `/api/${encodeURIComponent(name)}`;
const todoPath = (name, id) => `${userPath(name)}/${encodeURIComponent(id)}`;

/** Server -> aplikácia */
export function normalizeTodo(raw) {
  return {
    id: raw.id ?? raw.todo_id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    dateFrom: parseServerDate(raw.date_from),
    dateTo: parseServerDate(raw.date_to),
    isFinished: Boolean(raw.is_finished),
  };
}

/** Aplikácia -> server (všetky polia schémy TodoCreate, PUT nahrádza celú úlohu) */
export function toPayload(todo) {
  return {
    title: todo.title.trim(),
    description: todo.description ?? '',
    date_from: toServerDate(todo.dateFrom),
    date_to: toServerDate(todo.dateTo),
    is_finished: Boolean(todo.isFinished),
  };
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  return data?.todos ?? data?.items ?? data?.data ?? [];
}

const one = (data) => (data && typeof data === 'object' && !Array.isArray(data) ? normalizeTodo(data) : null);

export const todoApi = {
  async list(name) {
    return extractList(await request('GET', userPath(name))).map(normalizeTodo);
  },
  async get(name, id) {
    return one(await request('GET', todoPath(name, id)));
  },
  async create(name, todo) {
    return one(await request('POST', userPath(name), toPayload(todo)));
  },
  async update(name, id, todo) {
    return one(await request('PUT', todoPath(name, id), toPayload(todo)));
  },
  async remove(name, id) {
    await request('DELETE', todoPath(name, id));
  },
  async markDone(name, id) {
    return one(await request('PATCH', `${todoPath(name, id)}/done`));
  },
  async markUndone(name, id) {
    return one(await request('PATCH', `${todoPath(name, id)}/undone`));
  },
  async reset(name) {
    await request('POST', `${userPath(name)}/reset`);
  },
};
