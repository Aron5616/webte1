# Môj TODO List – WEBTE1, Zadanie č. 3

**Autor:** Matej Petrovič

**Odkaz na školský server:** https://webte1.fei.stuba.sk/~xpetrovicm2/z3/

## Opis aplikácie

Webová aplikácia na správu osobných úloh. Používateľ zadá svoj identifikátor, aplikácia načíta jeho úlohy
z REST API `https://wt1zadanie.iolab.sk` a umožní:

- vytvárať, upravovať, odstraňovať úlohy a meniť ich stav (dokončená / znovu otvorená),
- prezerať úlohy v **kalendári** (mesiac / týždeň / deň, posun na predchádzajúce a nasledujúce obdobie, „Dnes“),
- vytvoriť úlohu kliknutím na deň alebo označením časového úseku v kalendári (čas sa predvyplní),
- presunúť úlohu v kalendári potiahnutím (zmena termínu sa uloží na server),
- prezerať úlohy v **zozname** s filtrom podľa stavu, vyhľadávaním podľa názvu a zoradením podľa začiatku/konca,
- zobraziť detail úlohy – pri otvorení sa načíta aktuálna verzia zo servera (`GET /api/{name}/{todo_id}`),
- obnoviť päť ukážkových úloh (`POST /api/{name}/reset`).

Zoznam aj kalendár čítajú dáta z jedného zdieľaného stavu (`src/stores/todoStore.js`), ktorý sa mení iba
po úspešnej odpovedi servera – preto sú vždy synchronizované.

## Použité technológie

| Technológia | Použitie |
|---|---|
| [Vue.js 3](https://vuejs.org) | framework, komponenty (`<script setup>`, Composition API), reaktívny stav |
| [FullCalendar 6](https://fullcalendar.io) | knižnica kalendára (`@fullcalendar/vue3`, `daygrid`, `timegrid`, `interaction`), slovenská lokalizácia |
| Fetch API | komunikácia s REST API |
| [Vite](https://vitejs.dev) | vývojový server a build |
| vlastné CSS | responzívny dizajn (CSS premenné, Flexbox, Grid), bez CSS frameworku |

## Inštalácia a spustenie

Potrebný je Node.js 20+.

```bash
npm install        # inštalácia závislostí
npm run dev        # vývojový server -> http://localhost:5173
npm run build      # produkčný build do priečinka dist/
npm run preview    # náhľad buildu
```

### Nasadenie na školský server

Po `npm run build` nahrajte **obsah** priečinka `dist/` (index.html, favicon.svg, assets/) na server.
Build používa relatívne cesty (`base: './'`), takže funguje aj v podpriečinku.

## Štruktúra odovzdaného ZIP-u

V koreni ZIP-u je zostavená aplikácia (`index.html`, `assets/`, `favicon.svg`) – dá sa priamo otvoriť
na serveri. Celý zdrojový kód je v priečinku `zdrojovy-kod/` (spustenie podľa návodu vyššie).

## Štruktúra projektu (zdrojový kód)

```
index.html                 vstupný HTML súbor (Vite)
vite.config.js
public/favicon.svg
src/
  main.js                  vytvorenie Vue aplikácie
  App.vue                  rozloženie, navigácia (#calendar, #list, #about), dialógy
  services/todoApi.js      komunikácia s REST API (fetch, chyby, timeout, prevod formátov)
  stores/todoStore.js      zdieľaný stav úloh + akcie (load, create, update, delete, done/undone, reset)
  stores/toastStore.js     notifikácie
  composables/useConfirm.js       potvrdzovací dialóg (Promise)
  composables/useTodoActions.js   spoločné akcie (dokončiť, odstrániť, reset) so spätnou väzbou
  utils/date.js            práca s dátumami a časovými pásmami
  utils/validation.js      validácia formulára a identifikátora
  components/              AppHeader, AppFooter, UserLogin, CalendarView, TaskList, TaskItem,
                           TaskForm, TaskDetail, StatusBadge, LoadState, BaseModal,
                           ConfirmDialog, ToastContainer, AboutSection
  styles/main.css
```

## Poznámky k implementácii

- **URL:** identifikátor študenta sa do URL vkladá cez `encodeURIComponent()`.
- **Dátumy:** na server sa posielajú v ISO 8601 v UTC (`Date.toISOString()`). Dátum zo servera bez
  časového pásma sa považuje za UTC. Používateľovi sa všetko zobrazuje v jeho lokálnom čase (`Intl`, `sk-SK`).
- **Chyby:** sieťové chyby, timeout (15 s) a neúspešné HTTP odpovede (napr. 404, 422, 5xx) sa zobrazia
  zrozumiteľnou správou; pri chybe ostanú údaje vo formulári a dá sa to skúsiť znova.
- **Dvojité odoslanie:** počas ukladania je formulár zablokovaný.
- **XSS:** dáta z API sa vypisujú cez Vue interpoláciu `{{ }}` (escapovaný text), `v-html` sa nepoužíva.
- **localStorage** obsahuje iba zadaný identifikátor používateľa, úlohy sú vždy iba na serveri.

## Použitie AI nástrojov

Pri tvorbe riešenia bol použitý AI asistent **Claude (Anthropic)** – na návrh štruktúry projektu,
generovanie časti kódu komponentov, štýlov a tohto README. Kód som prešiel, otestoval a upravil;
za jeho obsah a funkčnosť zodpovedám a viem ho vysvetliť.
