import { fromInputValue } from './date.js';

export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 1000;

/**
 * Validácia formulára úlohy. Vracia objekt { pole: 'chybová správa' }.
 * Prázdny objekt = formulár je v poriadku.
 */
export function validateTodoForm(form) {
  const errors = {};
  const title = (form.title ?? '').trim();
  const description = form.description ?? '';

  if (!title) errors.title = 'Názov úlohy je povinný.';
  else if (title.length > TITLE_MAX) errors.title = `Názov môže mať najviac ${TITLE_MAX} znakov (aktuálne ${title.length}).`;

  if (description.length > DESCRIPTION_MAX)
    errors.description = `Popis môže mať najviac ${DESCRIPTION_MAX} znakov (aktuálne ${description.length}).`;

  const from = fromInputValue(form.dateFrom);
  const to = fromInputValue(form.dateTo);
  if (!form.dateFrom) errors.dateFrom = 'Zadajte dátum a čas začiatku.';
  else if (!from) errors.dateFrom = 'Neplatný dátum a čas začiatku.';
  if (!form.dateTo) errors.dateTo = 'Zadajte dátum a čas ukončenia.';
  else if (!to) errors.dateTo = 'Neplatný dátum a čas ukončenia.';

  if (from && to && from > to) errors.dateTo = 'Koniec úlohy nemôže byť skôr ako jej začiatok.';

  return errors;
}

/** Identifikátor študenta – povolíme bežné znaky loginu, URL aj tak ošetruje encodeURIComponent */
export function validateUserName(name) {
  const v = (name ?? '').trim();
  if (!v) return 'Zadajte svoj identifikátor (napr. AIS login).';
  if (v.length > 64) return 'Identifikátor môže mať najviac 64 znakov.';
  if (!/^[\p{L}\p{N}._-]+$/u.test(v)) return 'Použite iba písmená, číslice, bodku, pomlčku alebo podčiarkovník.';
  return null;
}
