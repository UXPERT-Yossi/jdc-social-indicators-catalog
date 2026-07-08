/* ============================================================
   indicator-card.js — Shared rich card component for indicators
   ─────────────────────────────────────────────────────────────
   ONE renderer to rule them all. Used in:
     • browse.html  (Miller column 3, leaves)
     • search-results.html  (main list)
     • ai-chat.html  (right results pane)

   Pattern: self-injecting CSS + DOM-API render (no innerHTML).
   Compare state shared via sessionStorage key 'comparison'.
   Same key search-results.html already uses → cross-screen sync.

   Public API on window.ICCard:
     ICCard.render(indicator, opts)  → DOM element (an <article>)
     ICCard.sourceBreadcrumb(opts)   → DOM element
     ICCard.compare.add(id, name)    → mutates sessionStorage
     ICCard.compare.remove(id)       → ...
     ICCard.compare.has(id)          → boolean
     ICCard.compare.items()          → array of {id, name}
     ICCard.compare.clear()          → empties
     ICCard.compare.onChange(fn)     → subscribe to changes
============================================================ */
(function () {
  'use strict';

  if (window.ICCard) return; /* Guard against double-load */

  /* ─── State (sessionStorage) ──────────────────────────────── */
  const COMPARE_KEY = 'comparison';
  const MAX_COMPARE = 3;
  const subscribers = new Set();

  function loadCompare() {
    try {
      const raw = sessionStorage.getItem(COMPARE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  function saveCompare(items) {
    try { sessionStorage.setItem(COMPARE_KEY, JSON.stringify(items)); }
    catch (e) { /* quota / private mode — silent */ }
    subscribers.forEach(fn => { try { fn(items); } catch (_) {} });
  }

  const compare = {
    items: loadCompare,
    has: (id) => loadCompare().some(it => it.id === id),
    add: (id, name) => {
      const items = loadCompare();
      if (items.some(it => it.id === id)) return false;
      if (items.length >= MAX_COMPARE) {
        alert('ניתן להשוות עד ' + MAX_COMPARE + ' מדדים בו-זמנית. הסר מדד כדי להוסיף חדש.');
        return false;
      }
      items.push({ id: id, name: name });
      saveCompare(items);
      return true;
    },
    remove: (id) => {
      const items = loadCompare().filter(it => it.id !== id);
      saveCompare(items);
    },
    toggle: (id, name) => {
      if (compare.has(id)) compare.remove(id);
      else compare.add(id, name);
    },
    clear: () => saveCompare([]),
    onChange: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    MAX: MAX_COMPARE
  };

  /* ─── DOM helpers ──────────────────────────────────────────── */
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === 'class')      e.className = v;
        else if (k === 'text')  e.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else                    e.setAttribute(k, v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      if (typeof c === 'string')  e.appendChild(document.createTextNode(c));
      else if (c instanceof Node) e.appendChild(c);
    }
    return e;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }
  function icon(name) {
    const svg = svgEl('svg', {
      viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      'aria-hidden': 'true'
    });
    const paths = {
      clock:    () => [ svgEl('circle', { cx: '12', cy: '12', r: '10' }),
                        svgEl('polyline', { points: '12 6 12 12 16 14' }) ],
      file:     () => [ svgEl('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
                        svgEl('polyline', { points: '14 2 14 8 20 8' }) ],
      users:    () => [ svgEl('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
                        svgEl('circle', { cx: '9', cy: '7', r: '4' }),
                        svgEl('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
                        svgEl('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }) ],
      plus:     () => [ svgEl('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
                        svgEl('line', { x1: '5',  y1: '12', x2: '19', y2: '12' }) ],
      check:    () => [ svgEl('polyline', { points: '20 6 9 17 4 12' }) ],
      'arrow-r':() => [ svgEl('polyline', { points: '9 18 15 12 9 6' }) ],
      'arrow-l':() => [ svgEl('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
                        svgEl('polyline', { points: '12 5 5 12 12 19' }) ],
      sparkle:  () => [ svgEl('path', { d: 'M12 3l1.88 5.76L20 11l-5.76 1.88L12 19l-1.88-5.76L4 11l5.76-1.88L12 3z' }) ],
      search:   () => [ svgEl('circle', { cx: '11', cy: '11', r: '8' }),
                        svgEl('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }) ],
      tree:     () => [ svgEl('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
                        svgEl('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
                        svgEl('line', { x1: '8', y1: '18', x2: '21', y2: '18' }),
                        svgEl('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }),
                        svgEl('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }),
                        svgEl('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' }) ]
    };
    const builder = paths[name];
    if (builder) builder().forEach(p => svg.appendChild(p));
    return svg;
  }

  /* ─── CSS injection ────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('ic-card-styles')) return;
    const style = document.createElement('style');
    style.id = 'ic-card-styles';
    style.textContent = `
      .ic-card {
        background: var(--surface, var(--bg-card, #FFFFFF));
        border: 1.5px solid var(--border, #E2E8F0);
        border-radius: var(--radius-xl, 16px);
        padding: 18px 22px;
        margin-block-end: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color .15s, box-shadow .15s, transform .15s;
        position: relative;
      }
      .ic-card:last-child { margin-block-end: 0; }
      .ic-card:hover {
        border-color: var(--primary, #334155);
        box-shadow: var(--shadow-md, 0 4px 12px rgba(15,23,42,.06));
        transform: translateY(-1px);
      }
      .ic-card.in-comparison {
        border-color: var(--primary, #334155);
        background: #F0F9FF;
      }

      /* Title row: title on inline-start (right in RTL), compare button
         on inline-end (left in RTL). Both baseline-aligned so the button
         sits on the same visual line as the title's first row. */
      .ic-card-header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .ic-card-header .ic-card-title {
        flex: 1;
        min-width: 0;
      }
      /* .ic-card-top / .ic-card-badges — legacy shells (empty since badges
         were removed). Kept as no-op selectors in case downstream code
         still queries them. Safe to delete outright. */
      .ic-card-top { display: none; }
      .ic-card-badges { display: none; }
      .ic-badge {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: var(--radius-full, 999px);
        white-space: nowrap;
      }
      /* Type badges follow the project's slate wireframe palette */
      .ic-badge--outcome { background: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; }
      .ic-badge--output  { background: #F8FAFC; color: #334155; border: 1px solid #CBD5E1; }
      .ic-badge--impact  { background: #1E293B; color: #FFFFFF; border: 1px solid #1E293B; }
      .ic-badge--input   { background: #FFFFFF; color: #64748B; border: 1px solid #94A3B8; }
      .ic-badge--context { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
      .ic-badge--new {
        background: var(--primary, #334155);
        color: #fff;
        border: 1px solid var(--primary, #334155);
      }
      .ic-badge--domain {
        color: var(--dc, var(--text-secondary, #475569));
        border: 1px solid var(--dc, var(--border-strong, #CBD5E1));
        background: color-mix(in srgb, var(--dc, #CBD5E1) 10%, #fff);
      }

      .ic-card-compare {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        padding: 5px 11px;
        border: 1px solid var(--border-strong, #CBD5E1);
        border-radius: var(--radius-md, 8px);
        background: var(--surface, #fff);
        cursor: pointer;
        font-family: inherit;
        transition: all .15s;
        flex-shrink: 0;
        white-space: nowrap;
      }
      .ic-card-compare:hover {
        color: var(--primary, #334155);
        border-color: var(--primary, #334155);
        background: var(--primary-light, #E2E8F0);
      }
      .ic-card-compare.added {
        color: #fff;
        background: var(--primary, #334155);
        border-color: var(--primary, #334155);
      }
      .ic-card-compare svg { width: 13px; height: 13px; }

      .ic-card-title {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.35;
        color: var(--text-primary, #0F172A);
        text-decoration: none;
        display: block;
      }
      .ic-card:hover .ic-card-title { color: var(--primary, #334155); }
      .ic-card-snippet {
        font-size: 13.5px;
        line-height: 1.6;
        color: var(--text-secondary, #475569);
        margin: 0;
      }
      .ic-card-rationale {
        background: var(--bg-page, var(--surface-2, #F8FAFC));
        border-inline-start: 3px solid var(--primary, #334155);
        padding: 10px 14px;
        border-radius: var(--radius-md, 8px);
      }
      .ic-card-rationale-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--primary, #334155);
        margin-block-end: 4px;
      }
      .ic-card-rationale-text {
        font-size: 13px;
        line-height: 1.55;
        color: var(--text-primary, #0F172A);
      }

      .ic-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-block-start: 10px;
        border-block-start: 1px solid var(--border, #E2E8F0);
        margin-block-start: 4px;
      }
      .ic-card-open {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary, #334155);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        text-decoration: none;
      }
      .ic-card:hover .ic-card-open { text-decoration: underline; }
      .ic-card-open svg { width: 14px; height: 14px; }
      .ic-card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: var(--text-tertiary, var(--text-muted, #64748B));
      }
      .ic-card-meta-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .ic-card-meta-item svg { width: 13px; height: 13px; flex-shrink: 0; }

      /* ─── Semantic tags row — appears on every card when ind.tags is present.
         Sits between the snippet and rationale so it reads as "tagged with"
         context rather than as part of the badges/title area. */
      .ic-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: center;
      }
      .ic-card-tags-label {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
        color: var(--text-tertiary, #94A3B8);
        margin-inline-end: 4px;
      }
      .ic-card-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11.5px;
        font-weight: 500;
        color: var(--text-secondary, #475569);
        background: var(--surface-2, #F8FAFC);
        border: 1px solid var(--border, #E2E8F0);
        border-radius: var(--radius-full, 999px);
        padding: 2px 9px;
      }
      .ic-card-tag-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: currentColor;
        opacity: .45;
      }

      /* ─── Source breadcrumb (top of results page) ─── */
      .ic-source {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: var(--surface, #fff);
        border: 1px solid var(--border, #E2E8F0);
        border-radius: var(--radius-lg, 12px);
        margin-block-end: 20px;
        flex-wrap: wrap;
      }
      .ic-source-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--primary, #334155);
        color: #fff;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .ic-source-icon svg { width: 15px; height: 15px; }
      .ic-source-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ic-source-eyebrow {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .04em;
        color: var(--text-tertiary, #64748B);
      }
      .ic-source-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary, #0F172A);
      }
      .ic-source-text strong {
        color: var(--primary, #334155);
        font-weight: 700;
      }
      .ic-source-edit {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--primary, #334155);
        background: transparent;
        border: 1px solid var(--border-strong, #CBD5E1);
        border-radius: var(--radius-md, 8px);
        padding: 6px 12px;
        cursor: pointer;
        font-family: inherit;
        transition: all .15s;
      }
      .ic-source-edit:hover {
        background: var(--primary-light, #E2E8F0);
        border-color: var(--primary, #334155);
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Card renderer ────────────────────────────────────────── */
  /* `ind` shape (all optional except id+name):
       { id, name, type, typeLabel, domainLabel, domainColor,
         snippet, rationale, rationaleLabel,
         frequency, ageRange, source, programs, isNew, href }
     `opts`:
       { showCompare: boolean (default true), showRationale: boolean (default true) }
   */
  function renderCard(ind, opts) {
    opts = opts || {};
    const showCompare = opts.showCompare !== false;
    const showRationale = opts.showRationale !== false;
    const href = ind.href || 'indicator-card.html';
    const isSelected = ind.id ? compare.has(ind.id) : false;

    /* Title + compare button live on a SINGLE row (title-row). Type/domain
       badges intentionally not rendered — the filter panel surfaces both
       facets as filters, so the badges were redundant. */
    const title = el('a', {
      href: href,
      class: 'ic-card-title',
      text: ind.name,
      onclick: (e) => e.stopPropagation()
    });

    const headerChildren = [title];
    if (showCompare && ind.id) {
      const btn = el('button', {
        class: 'ic-card-compare' + (isSelected ? ' added' : ''),
        type: 'button',
        'aria-label': (isSelected ? 'הסר ' : 'הוסף ') + ind.name + ' להשוואה',
        'data-ic-compare-id': ind.id,
        onclick: (e) => {
          e.stopPropagation();
          compare.toggle(ind.id, ind.name);
        }
      });
      btn.appendChild(icon(isSelected ? 'check' : 'plus'));
      btn.appendChild(document.createTextNode(' ' + (isSelected ? 'נוסף' : 'השווה')));
      headerChildren.push(btn);
    }
    const header = el('div', { class: 'ic-card-header' }, headerChildren);

    /* Snippet (description) */
    const snippet = ind.snippet ? el('p', { class: 'ic-card-snippet', text: ind.snippet }) : null;

    /* Semantic tags row — rendered when ind.tags is a non-empty array.
       Labels are resolved via window.TAG_LOOKUP if present; otherwise the
       raw tag id is shown as fallback (so the card still works in isolation). */
    let tagsRow = null;
    if (Array.isArray(ind.tags) && ind.tags.length > 0) {
      const lookup = window.TAG_LOOKUP || {};
      tagsRow = el('div', { class: 'ic-card-tags', role: 'list', 'aria-label': 'תגיות סמנטיות' });
      tagsRow.appendChild(el('span', { class: 'ic-card-tags-label', text: 'תגיות' }));
      ind.tags.forEach(tagId => {
        const t = lookup[tagId];
        const label = (t && t.label) || tagId;
        tagsRow.appendChild(el('span', { class: 'ic-card-tag', role: 'listitem' },
          el('span', { class: 'ic-card-tag-dot', 'aria-hidden': 'true' }),
          label
        ));
      });
    }

    /* Rationale block ("מתאים כאשר") */
    let rationale = null;
    if (showRationale && ind.rationale) {
      rationale = el('div', { class: 'ic-card-rationale', role: 'note' },
        el('div', { class: 'ic-card-rationale-label', text: ind.rationaleLabel || 'מתאים כאשר' }),
        el('div', { class: 'ic-card-rationale-text', text: ind.rationale })
      );
    }

    /* Footer: open link + meta */
    const openLink = el('a', {
      href: href,
      class: 'ic-card-open',
      'aria-label': 'פתח כרטיס ' + ind.name,
      onclick: (e) => e.stopPropagation()
    });
    openLink.appendChild(document.createTextNode('פתח כרטיס מדד '));
    openLink.appendChild(icon('arrow-r'));

    const metaItems = [];
    if (ind.frequency) {
      const item = el('span', { class: 'ic-card-meta-item', title: 'תדירות מדידה' });
      item.appendChild(icon('clock'));
      item.appendChild(document.createTextNode(' ' + ind.frequency));
      metaItems.push(item);
    }
    if (ind.ageRange) {
      const item = el('span', { class: 'ic-card-meta-item', title: 'טווח גילאים' });
      item.appendChild(icon('users'));
      item.appendChild(document.createTextNode(' ' + ind.ageRange));
      metaItems.push(item);
    }
    if (ind.source) {
      const item = el('span', { class: 'ic-card-meta-item', title: 'מקור נתונים' });
      item.appendChild(icon('file'));
      item.appendChild(document.createTextNode(' ' + ind.source));
      metaItems.push(item);
    }
    const meta = el('div', { class: 'ic-card-meta' }, metaItems);
    const footer = el('div', { class: 'ic-card-footer' }, openLink, meta);

    /* Whole card */
    const article = el('article', {
      class: 'ic-card' + (isSelected ? ' in-comparison' : ''),
      'data-ic-id': ind.id || '',
      role: 'listitem',
      onclick: () => { window.location.href = href; }
    }, header, snippet, tagsRow, rationale, footer);

    return article;
  }

  /* ─── Source breadcrumb ────────────────────────────────────── */
  /* opts:
       { source: 'search' | 'ai' | 'browse',
         query: string (for search/ai),
         path: array of {name} (for browse, e.g., [{name:'בריאות'}, {name:'תזונה'}]),
         onEdit: function (called when user clicks "ערוך")
       }
   */
  function sourceBreadcrumb(opts) {
    opts = opts || {};
    let iconName = 'search';
    let eyebrow = 'תוצאות';
    let mainText;
    let editLabel = 'ערוך';

    if (opts.source === 'ai') {
      iconName = 'sparkle';
      eyebrow = 'תשובה משיחת AI';
      mainText = opts.query ? '"' + opts.query + '"' : 'שאלה ב-AI';
    } else if (opts.source === 'browse') {
      iconName = 'tree';
      eyebrow = 'תוצאה מעיון בקטלוג';
      mainText = (opts.path || []).map(p => p.name).join(' ‹ ') || 'עיון בקטלוג';
      editLabel = 'חזרה לעיון';
    } else {
      /* default: search */
      iconName = 'search';
      eyebrow = 'תוצאות חיפוש';
      mainText = opts.query ? '"' + opts.query + '"' : 'חיפוש';
    }

    const iconBox = el('div', { class: 'ic-source-icon', 'aria-hidden': 'true' });
    iconBox.appendChild(icon(iconName));

    const body = el('div', { class: 'ic-source-body' },
      el('div', { class: 'ic-source-eyebrow', text: eyebrow }),
      el('div', { class: 'ic-source-text', text: mainText })
    );

    const editBtn = el('button', {
      type: 'button',
      class: 'ic-source-edit',
      text: editLabel,
      onclick: () => {
        if (typeof opts.onEdit === 'function') opts.onEdit();
      }
    });

    return el('div', { class: 'ic-source', role: 'region', 'aria-label': eyebrow },
      iconBox, body, editBtn);
  }

  /* ─── Auto-sync card UI when compare state changes ──────────
     Any card with [data-ic-id] gets its compare button refreshed
     whenever the shared store changes — no matter which page added/removed.
     This means host pages don't need to manually re-render cards on every
     compare action — they only need to handle their own tray (or rely on the
     auto-injected one below). */
  function syncCardsToCompareState() {
    const items = compare.items();
    const selectedIds = new Set(items.map(it => it.id));
    document.querySelectorAll('.ic-card[data-ic-id]').forEach(card => {
      const id = card.getAttribute('data-ic-id');
      if (!id) return;
      const isSelected = selectedIds.has(id);
      card.classList.toggle('in-comparison', isSelected);
      const btn = card.querySelector('[data-ic-compare-id]');
      if (!btn) return;
      const wasAdded = btn.classList.contains('added');
      if (isSelected === wasAdded) return;
      btn.classList.toggle('added', isSelected);
      const oldIcon = btn.querySelector('svg');
      if (oldIcon) btn.replaceChild(icon(isSelected ? 'check' : 'plus'), oldIcon);
      const textNode = Array.from(btn.childNodes).find(n => n.nodeType === 3);
      if (textNode) textNode.textContent = ' ' + (isSelected ? 'נוסף' : 'השווה');
      const title = card.querySelector('.ic-card-title');
      const name = title ? title.textContent : '';
      btn.setAttribute('aria-label', (isSelected ? 'הסר ' : 'הוסף ') + name + ' להשוואה');
    });
  }

  /* ─── Auto-inject comparison tray (sticky bottom) ────────────
     Skipped if the page already has #comparison-tray (e.g., search-results,
     ai-chat have their own implementations) or if window.IC_TRAY_DISABLED.
     Otherwise — single shared tray, slate styling, opens when items > 0. */
  function ensureTray() {
    if (window.IC_TRAY_DISABLED) return null;
    if (document.getElementById('comparison-tray')) return null;
    if (document.getElementById('ic-tray')) return document.getElementById('ic-tray');

    const tray = el('div', { class: 'ic-tray', id: 'ic-tray', role: 'region', 'aria-label': 'מגש השוואה', 'aria-live': 'polite' });
    const inner = el('div', { class: 'ic-tray-inner' },
      el('span', { class: 'ic-tray-label', text: 'השוואה:' }),
      el('div', { class: 'ic-tray-items', id: 'ic-tray-items' }),
      el('div', { class: 'ic-tray-actions' },
        el('button', {
          type: 'button',
          class: 'ic-tray-compare-btn',
          id: 'ic-tray-compare-btn',
          disabled: '',
          text: 'השווה',
          onclick: () => {
            if (compare.items().length >= 2) window.location.href = 'comparison.html';
          }
        }),
        el('button', {
          type: 'button',
          class: 'ic-tray-clear-btn',
          text: 'נקה',
          onclick: () => compare.clear()
        })
      )
    );
    tray.appendChild(inner);
    document.body.appendChild(tray);
    return tray;
  }
  function renderInjectedTray() {
    const tray = document.getElementById('ic-tray');
    if (!tray) return;
    const itemsEl = document.getElementById('ic-tray-items');
    const compareBtn = document.getElementById('ic-tray-compare-btn');
    const items = compare.items();
    itemsEl.textContent = '';
    items.forEach(item => {
      const removeBtn = el('button', {
        class: 'ic-tray-item-remove',
        type: 'button',
        'aria-label': 'הסר ' + item.name + ' מההשוואה',
        text: '×',
        onclick: () => compare.remove(item.id)
      });
      itemsEl.appendChild(el('div', { class: 'ic-tray-item' },
        el('span', { class: 'ic-tray-item-name', text: item.name }),
        removeBtn
      ));
    });
    const emptyCount = Math.max(0, MAX_COMPARE - items.length);
    for (let i = 0; i < emptyCount; i++) {
      itemsEl.appendChild(el('div', { class: 'ic-tray-slot-empty', text: 'הוסף מדד' }));
    }
    tray.classList.toggle('visible', items.length > 0);
    compareBtn.disabled = items.length < 2;
  }

  /* CSS for the injected tray — kept in a separate function so it only adds
     if the tray is actually used. Same slate styling as search-results.html. */
  function injectTrayStyles() {
    if (document.getElementById('ic-tray-styles')) return;
    const style = document.createElement('style');
    style.id = 'ic-tray-styles';
    style.textContent = `
      .ic-tray {
        position: fixed; inset-inline: 0; inset-block-end: 0;
        z-index: 300;
        background: #0F172A;
        border-block-start: 3px solid var(--primary, #334155);
        box-shadow: 0 -4px 24px rgba(0,0,0,.25);
        transform: translateY(100%);
        transition: transform .3s cubic-bezier(.4,0,.2,1);
        font-family: 'Heebo', system-ui, sans-serif;
      }
      .ic-tray.visible { transform: translateY(0); }
      .ic-tray-inner {
        max-width: 1280px;
        margin-inline: auto;
        padding-inline: 32px;
        padding-block: 14px;
        display: flex; align-items: center; gap: 16px;
      }
      .ic-tray-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.7); white-space: nowrap; }
      .ic-tray-items { display: flex; gap: 10px; flex: 1; }
      .ic-tray-item {
        display: flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 8px;
        padding: 6px 10px;
        min-width: 180px;
      }
      .ic-tray-item-name {
        font-size: 13px; font-weight: 500; color: #fff;
        flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ic-tray-item-remove {
        background: none; border: none;
        color: rgba(255,255,255,.5); cursor: pointer;
        font-size: 16px; line-height: 1; padding: 0;
        display: flex;
      }
      .ic-tray-item-remove:hover { color: #fff; }
      .ic-tray-slot-empty {
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,.04);
        border: 1px dashed rgba(255,255,255,.2);
        border-radius: 8px;
        padding: 6px 24px;
        min-width: 160px;
        font-size: 12px;
        color: rgba(255,255,255,.35);
      }
      .ic-tray-actions { display: flex; align-items: center; gap: 10px; }
      .ic-tray-compare-btn {
        background: var(--primary, #334155); color: #fff;
        border: none; border-radius: 8px;
        padding: 8px 20px;
        font-size: 14px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: background .15s;
        white-space: nowrap;
      }
      .ic-tray-compare-btn:hover { background: #1e293b; }
      .ic-tray-compare-btn:disabled { opacity: .5; cursor: not-allowed; }
      .ic-tray-clear-btn {
        background: none;
        border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.6);
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 13px; font-family: inherit;
        cursor: pointer; transition: all .15s;
      }
      .ic-tray-clear-btn:hover { border-color: rgba(255,255,255,.5); color: #fff; }
      /* Keep AI FAB above the tray when both visible */
      .ic-tray.visible ~ .ai-fab,
      body.ai-panel-open .ic-tray { transition: transform .3s, opacity .3s; }
    `;
    document.head.appendChild(style);
  }

  /* ─── Init ─────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectTrayStyles();
    ensureTray();
    renderInjectedTray();
    syncCardsToCompareState();
    /* Global subscription: whenever compare state changes (from any source),
       sync all card UIs + the injected tray. */
    compare.onChange(() => {
      syncCardsToCompareState();
      renderInjectedTray();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Public API */
  window.ICCard = {
    render: renderCard,
    sourceBreadcrumb: sourceBreadcrumb,
    compare: compare,
    icon: icon,
    syncCards: syncCardsToCompareState
  };
})();
