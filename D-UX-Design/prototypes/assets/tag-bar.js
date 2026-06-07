/* ============================================================
   tag-bar.js — Notion-style category pills + flyout for semantic tags
   ─────────────────────────────────────────────────────────────
   ONE component reused across browse.html + search-results.html.

   Design:
     • Horizontal bar of category buttons (one per tag group).
     • Click a category → flyout opens below with chips of all tags
       in that group.
     • Multi-select: selecting a chip stays open. Flyout auto-closes
       after 800ms of inactivity, or on Esc / click-outside.
     • Edge cases:
        - 15+ categories: bar is horizontally scrollable.
        - 40+ tags in a group: flyout has internal vertical scroll.
        - Long labels: truncated with ellipsis + title attr.

   Pattern: self-injecting CSS + DOM-API render (no innerHTML).
   The component is STATELESS — the host page owns the selected set.

   Public API on window.TagBar:
     TagBar.mount(containerElement, {
       registry: TAGS_REGISTRY,       // structured groups → tags
       isSelected: (tagId) => boolean,
       onToggle:  (tagId, willSelect) => void,   // host updates filter, re-renders cards
     })
     → returns { refresh, destroy }

   The host calls refresh() if the selection changes externally
   (e.g., a "clear all filters" button elsewhere).
============================================================ */
(function () {
  'use strict';

  if (window.TagBar) return;  /* Guard against double-load */

  /* ─── DOM helpers ──────────────────────────────────────────── */
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === 'class')      e.className = v;
        else if (k === 'text')  e.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
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
  function svgNode(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  /* Icon library — Lucide-style. New groups can add their own iconKey.
     Unknown keys gracefully render nothing (no broken icon). */
  function icon(name) {
    const svg = svgNode('svg', {
      viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      'aria-hidden': 'true'
    });
    const paths = {
      users: () => [
        svgNode('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        svgNode('circle', { cx: '9', cy: '7', r: '4' }),
        svgNode('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
        svgNode('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
      ],
      'map-pin': () => [
        svgNode('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
        svgNode('circle', { cx: '12', cy: '10', r: '3' })
      ],
      community: () => [
        svgNode('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        svgNode('circle', { cx: '9', cy: '7', r: '4' }),
        svgNode('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
        svgNode('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
        svgNode('circle', { cx: '20', cy: '8', r: '2' })
      ],
      target: () => [
        svgNode('circle', { cx: '12', cy: '12', r: '10' }),
        svgNode('circle', { cx: '12', cy: '12', r: '6' }),
        svgNode('circle', { cx: '12', cy: '12', r: '2' })
      ],
      shield: () => [
        svgNode('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
      ],
      tag: () => [
        svgNode('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
        svgNode('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' })
      ]
    };
    const builder = paths[name];
    if (builder) builder().forEach(p => svg.appendChild(p));
    return svg;
  }

  /* ─── CSS injection ────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('tag-bar-styles')) return;
    const style = document.createElement('style');
    style.id = 'tag-bar-styles';
    style.textContent = `
      /* No margin-block-end here — host (grid row-gap or own margin) controls
         spacing. Keeps this component flex/grid-friendly without overriding. */
      .tag-bar-wrap { position: relative; z-index: 50; }

      /* The horizontal pill bar. Overflow-x: auto handles the edge case
         of many categories — pills scroll horizontally with a thin bar. */
      .tag-bar {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        overflow-y: visible;
        padding-block: 4px;
        scrollbar-width: thin;
        scrollbar-color: var(--border-strong, #CBD5E1) transparent;
      }
      .tag-bar::-webkit-scrollbar { height: 6px; }
      .tag-bar::-webkit-scrollbar-track { background: transparent; }
      .tag-bar::-webkit-scrollbar-thumb {
        background: var(--border-strong, #CBD5E1);
        border-radius: 3px;
      }

      /* Category pill — large, pill-shaped button. */
      .tag-cat {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        background: var(--surface, var(--bg-card, #FFFFFF));
        border: 1.5px solid var(--border, #E2E8F0);
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        font-family: inherit;
        cursor: pointer;
        transition: border-color .15s, color .15s, background .15s;
        white-space: nowrap;
        flex-shrink: 0;
        max-width: 260px;
        overflow: hidden;
      }
      .tag-cat:hover {
        border-color: var(--primary, #334155);
        color: var(--primary, #334155);
      }
      .tag-cat:focus-visible {
        outline: 2px solid var(--primary, #334155);
        outline-offset: 2px;
      }
      .tag-cat-icon { width: 16px; height: 16px; flex-shrink: 0; }
      .tag-cat-label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tag-cat-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        background: var(--primary, #334155);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        border-radius: 9999px;
        flex-shrink: 0;
      }
      .tag-cat-count[hidden] { display: none; }
      .tag-cat-chevron {
        font-size: 14px;
        line-height: 1;
        color: var(--text-tertiary, #94A3B8);
        transition: transform .15s;
        flex-shrink: 0;
      }
      .tag-cat[aria-expanded="true"] .tag-cat-chevron {
        transform: rotate(180deg);
      }

      /* Category with active tags but not currently open → primary-light bg */
      .tag-cat[data-has-active="true"]:not([aria-expanded="true"]) {
        border-color: var(--primary, #334155);
        color: var(--primary, #334155);
        background: var(--primary-light, #F1F5F9);
      }

      /* Currently open category → solid primary */
      .tag-cat[aria-expanded="true"] {
        background: var(--primary, #334155);
        border-color: var(--primary, #334155);
        color: #fff;
      }
      .tag-cat[aria-expanded="true"] .tag-cat-chevron { color: #fff; }
      .tag-cat[aria-expanded="true"] .tag-cat-count {
        background: #fff;
        color: var(--primary, #334155);
      }

      /* Flyout — dropdown-style. Position is set entirely by JS via physical
         top/right (cleaner than mixing logical insets that flip in RTL).
         Max-height + scroll handle long lists. */
      .tag-flyout {
        position: absolute;
        z-index: 60;
        min-width: 240px;
        max-width: 320px;
        background: var(--surface, #FFFFFF);
        border: 1px solid var(--border, #E2E8F0);
        border-radius: 10px;
        box-shadow: 0 10px 28px rgba(15,23,42,.12), 0 2px 6px rgba(15,23,42,.06);
        padding: 6px;
        max-height: 320px;
        overflow-y: auto;
      }
      .tag-flyout[hidden] { display: none; }

      /* Header — minimal, dropdown-style. Group label as eyebrow + clear link. */
      .tag-flyout-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 10px 8px;
        border-block-end: 1px solid var(--border, #E2E8F0);
        margin-block-end: 4px;
      }
      .tag-flyout-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .05em;
        text-transform: uppercase;
        color: var(--text-tertiary, #94A3B8);
      }
      .tag-flyout-clear {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted, #64748B);
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        padding: 2px 4px;
      }
      .tag-flyout-clear:hover { color: var(--primary, #334155); }
      .tag-flyout-clear[hidden] { display: none; }

      /* Vertical list of items — each item is a full-width row */
      .tag-flyout-chips {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      /* Dropdown row — full width, hover bg, checkmark on right when selected */
      .tag-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary, #0F172A);
        font-family: inherit;
        cursor: pointer;
        text-align: start;
        transition: background .1s, color .1s;
      }
      .tag-chip:hover {
        background: var(--surface-2, #F8FAFC);
      }
      .tag-chip:focus-visible {
        outline: 2px solid var(--primary, #334155);
        outline-offset: -2px;
      }
      .tag-chip[aria-pressed="true"] {
        background: var(--primary-light, #F1F5F9);
        color: var(--primary, #334155);
        font-weight: 600;
      }
      .tag-chip[aria-pressed="true"]:hover {
        background: var(--primary-light, #F1F5F9);
      }
      /* Check mark — visible only when row is selected */
      .tag-chip-check {
        font-size: 13px;
        line-height: 1;
        font-weight: 700;
        color: var(--primary, #334155);
        opacity: 0;
        flex-shrink: 0;
      }
      .tag-chip[aria-pressed="true"] .tag-chip-check { opacity: 1; }

      @media (prefers-reduced-motion: reduce) {
        .tag-cat, .tag-cat-chevron, .tag-chip, .tag-chip-check {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Mount a TagBar instance into the given container.
     The component is fully owned by the returned handle:
       handle.refresh() — re-render counts/states from host's source-of-truth
       handle.destroy() — remove from DOM + detach listeners
  ──────────────────────────────────────────────────────────── */
  function mount(container, opts) {
    if (!container) throw new Error('TagBar.mount: container is required');
    const registry   = opts && opts.registry;
    const isSelected = opts && opts.isSelected;
    const onToggle   = opts && opts.onToggle;
    if (!registry || typeof isSelected !== 'function' || typeof onToggle !== 'function') {
      throw new Error('TagBar.mount: registry + isSelected + onToggle are required');
    }

    injectStyles();

    /* Component state — kept LOCAL to this instance, not global. */
    let openGroup = null;
    let closeTimer = null;
    const IDLE_MS = 800;

    /* Build skeleton */
    const wrap   = el('div', { class: 'tag-bar-wrap' });
    const bar    = el('div', { class: 'tag-bar', role: 'toolbar', 'aria-label': 'תיוג סמנטי' });
    const flyout = el('div', { class: 'tag-flyout', role: 'region', 'aria-label': 'בחירת תגיות', hidden: '' });
    wrap.appendChild(bar);
    wrap.appendChild(flyout);
    container.appendChild(wrap);

    /* ─── Idle-close timer.
         Every interaction (open, chip-click) resets it.
         Explicit close (Esc, outside-click, same-cat re-click) cancels it. */
    function resetIdleTimer() {
      cancelIdleTimer();
      closeTimer = setTimeout(() => { closeFlyout(); }, IDLE_MS);
    }
    function cancelIdleTimer() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }

    function openFlyoutFor(groupKey) {
      if (openGroup === groupKey) {  /* Click same category → toggle close */
        closeFlyout();
        return;
      }
      openGroup = groupKey;
      renderFlyout();
      flyout.hidden = false;
      positionFlyout(groupKey);   /* anchor under the clicked button */
      updateAriaExpanded();
      resetIdleTimer();
    }

    /* Position the absolute flyout under the just-clicked category button.
       Uses ONLY physical properties (top/right/left) — no logical insets to
       avoid RTL-flip confusion. CSS sets no positioning by default; JS owns it. */
    function positionFlyout(groupKey) {
      const anchor = bar.querySelector('.tag-cat[data-group="' + groupKey + '"]');
      if (!anchor) return;
      const wrapBox = wrap.getBoundingClientRect();
      const btnBox = anchor.getBoundingClientRect();
      /* Vertical: below the button + small gap */
      flyout.style.top = (btnBox.bottom - wrapBox.top + 6) + 'px';
      /* Horizontal: align right edge of flyout with right edge of button.
         In RTL Hebrew, "right" is the start side — natural anchor. */
      flyout.style.right = (wrapBox.right - btnBox.right) + 'px';
      flyout.style.left = 'auto';
      flyout.style.bottom = 'auto';
    }

    function closeFlyout() {
      if (!openGroup) return;
      openGroup = null;
      flyout.hidden = true;
      updateAriaExpanded();
      cancelIdleTimer();
    }

    function updateAriaExpanded() {
      bar.querySelectorAll('.tag-cat').forEach(btn => {
        btn.setAttribute('aria-expanded', btn.dataset.group === openGroup ? 'true' : 'false');
      });
    }

    /* ─── Render the category bar.
         Reads from registry + host's isSelected() to compute count badges. */
    function renderTagBar() {
      bar.textContent = '';
      Object.entries(registry).forEach(([groupKey, group]) => {
        const activeCount = group.tags.filter(t => isSelected(t.id)).length;
        const btn = el('button', {
          class: 'tag-cat',
          type: 'button',
          'data-group': groupKey,
          'data-has-active': activeCount > 0 ? 'true' : 'false',
          'aria-expanded': openGroup === groupKey ? 'true' : 'false',
          'aria-haspopup': 'true',
          title: group.label,
          onclick: () => openFlyoutFor(groupKey)
        });
        /* Icon — only if registry specifies iconKey AND we have a builder for it */
        if (group.iconKey) {
          const ic = icon(group.iconKey);
          ic.classList.add('tag-cat-icon');
          btn.appendChild(ic);
        }
        btn.appendChild(el('span', { class: 'tag-cat-label', text: group.label }));
        const countEl = el('span', {
          class: 'tag-cat-count',
          'aria-label': activeCount + ' תגיות נבחרו',
          text: String(activeCount)
        });
        if (activeCount === 0) countEl.hidden = true;
        btn.appendChild(countEl);
        btn.appendChild(el('span', { class: 'tag-cat-chevron', 'aria-hidden': 'true', text: '▾' }));
        bar.appendChild(btn);
      });
    }

    /* ─── Render the flyout's content for the currently-open group. */
    function renderFlyout() {
      flyout.textContent = '';
      if (!openGroup) return;
      const group = registry[openGroup];
      if (!group) return;

      /* Header: group title + clear button if any selected in THIS group */
      const groupActiveIds = group.tags.filter(t => isSelected(t.id)).map(t => t.id);
      const header = el('div', { class: 'tag-flyout-header' },
        el('div', { class: 'tag-flyout-title', text: group.label }),
        (() => {
          const btn = el('button', {
            class: 'tag-flyout-clear',
            type: 'button',
            text: 'נקה',
            'aria-label': 'נקה ' + group.label,   /* full context for screen readers */
            onclick: (e) => {
              /* Same defense as chip clicks — see comment there. */
              e.stopPropagation();
              groupActiveIds.forEach(id => onToggle(id, false));
              renderTagBar();
              renderFlyout();    /* full re-render is safe here — clear button mutates many chips */
              resetIdleTimer();
            }
          });
          if (groupActiveIds.length === 0) btn.hidden = true;
          return btn;
        })()
      );
      flyout.appendChild(header);

      /* Chips */
      const chipsBox = el('div', { class: 'tag-flyout-chips' });
      group.tags.forEach(t => {
        const selected = isSelected(t.id);
        const chip = el('button', {
          class: 'tag-chip',
          type: 'button',
          'aria-pressed': selected ? 'true' : 'false',
          'data-tag': t.id,
          onclick: (e) => {
            /* stopPropagation prevents document.click from firing.
               Without it, our re-render below detaches the chip from DOM
               before the bubble reaches `document`, so `wrap.contains(target)`
               returns false and the outside-click handler closes the flyout. */
            e.stopPropagation();
            const willSelect = !isSelected(t.id);
            onToggle(t.id, willSelect);
            chip.setAttribute('aria-pressed', willSelect ? 'true' : 'false');
            /* Surgical updates only — don't destroy the flyout body, since
               the user is mid-interaction. Just refresh: count on category
               pill, clear-button visibility in header. */
            renderTagBar();
            const clearBtn = flyout.querySelector('.tag-flyout-clear');
            if (clearBtn) {
              const stillActive = group.tags.some(tt => isSelected(tt.id));
              clearBtn.hidden = !stillActive;
            }
            resetIdleTimer();     /* user is active → restart 800ms */
          }
        });
        /* Label on the start side (right in RTL); check on the end side (left in RTL).
           justify-content: space-between in CSS pushes them apart. */
        chip.appendChild(el('span', { class: 'tag-chip-label', text: t.label }));
        chip.appendChild(el('span', { class: 'tag-chip-check', 'aria-hidden': 'true', text: '✓' }));
        chipsBox.appendChild(chip);
      });
      flyout.appendChild(chipsBox);
    }

    /* ─── Outside-click / Esc handlers.
         Both bypass the idle timer (immediate close). */
    function onDocClick(e) {
      if (!openGroup) return;
      if (wrap.contains(e.target)) return;
      closeFlyout();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape' && openGroup) {
        const lastOpen = openGroup;
        closeFlyout();
        /* Return focus to the category button so keyboard users don't lose place */
        const btn = bar.querySelector('.tag-cat[data-group="' + lastOpen + '"]');
        if (btn) btn.focus();
      }
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);

    /* Initial render */
    renderTagBar();

    return {
      refresh: () => { renderTagBar(); if (openGroup) renderFlyout(); },
      destroy: () => {
        cancelIdleTimer();
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onKeyDown);
        wrap.remove();
      }
    };
  }

  window.TagBar = { mount };
})();
