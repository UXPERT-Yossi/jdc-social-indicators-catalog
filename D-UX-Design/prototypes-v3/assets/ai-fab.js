/* ============================================================
   ai-fab.js — Global AI Floating Action Button + Side Panel
   ─────────────────────────────────────────────────────────
   Self-injecting component. Include with:
     <script src="assets/ai-fab.js?v=1"></script>

   To suppress on a specific page (e.g., ai-chat.html that
   already has its own chat), set BEFORE this script loads:
     <script>window.AI_FAB_DISABLED = true;</script>

   XSS-safe: built with DOM API only — no innerHTML, no eval.
   History persists in localStorage across page navigations.
============================================================ */
(function () {
  'use strict';

  if (window.AI_FAB_DISABLED) return;
  if (window.__aiFabLoaded) return;  /* guard against double-include */
  window.__aiFabLoaded = true;

  /* ─── State (localStorage) ──────────────────────────────── */
  const STORAGE_KEY = 'ai-fab-history';
  const STATE = {
    open: false,
    messages: loadMessages()
  };

  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  function saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.messages));
    } catch (e) { /* quota / privacy mode — silent */ }
  }
  function clearMessages() {
    STATE.messages = [];
    saveMessages();
    renderMessages();
  }

  /* ─── Page context — TODO: extend per page (see contribution point) ─── */
  function getPageContext() {
    /* Default fallback: derive from URL path */
    const path = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
    const pageNames = {
      'home.html': 'דף הבית',
      'browse.html': 'עיון לפי תחום',
      'search-results.html': 'תוצאות חיפוש',
      'indicator-card.html': 'כרטיס מדד',
      'comparison.html': 'השוואת מדדים',
      'node-chart.html': 'מפה סמנטית',
      'ai-chat.html': 'שיחת AI'
    };
    /* Per-page overrides can set window.AI_PAGE_CONTEXT = {...} */
    const override = window.AI_PAGE_CONTEXT || {};
    return {
      pageName: override.pageName || pageNames[path] || 'הקטלוג',
      subject: override.subject || null,
      suggestions: override.suggestions || [
        'אילו מדדים מומלצים לתוכנית חינוך?',
        'מה ההבדל בין מדד תוצאה לתפוקה?',
        'איך מודדים אי-שוויון חברתי?'
      ]
    };
  }

  /* ─── DOM helpers (XSS-safe builders) ───────────────────── */
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

  /* ─── CSS injection ─────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('ai-fab-styles')) return;
    const style = document.createElement('style');
    style.id = 'ai-fab-styles';
    style.textContent = `
      /* FAB — slim COLLAPSED RAIL on inline-start (RIGHT in RTL),
         mirroring the collapsed chat pane in canvas.html. Full viewport
         height (below the sticky nav). Click anywhere on the rail to open
         the panel. */
      .ai-fab {
        position: fixed;
        inset-block-start: 0;
        inset-block-end: 0;
        inset-inline-start: 0;
        z-index: 999;                    /* below panel (1001) & nav */
        width: 48px;
        background: #FFFFFF;
        border: none;
        border-inline-end: 1px solid #E2E8F0;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 76px 8px 20px;         /* room for the sticky nav on top */
        gap: 14px;
        transition: background .2s, opacity .2s, transform .2s;
        font-family: 'Heebo', system-ui, sans-serif;
      }
      .ai-fab:hover { background: #F1F5F9; }
      .ai-fab-icon-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: #0F172A;
        color: #fff;
        flex-shrink: 0;
      }
      .ai-fab-icon-badge svg { width: 16px; height: 16px; }
      .ai-fab-expand-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px; height: 24px;
        border: 1px solid #E2E8F0;
        border-radius: 50%;
        color: #64748B;
        background: #FFFFFF;
        flex-shrink: 0;
        transition: color .12s, border-color .12s;
      }
      .ai-fab:hover .ai-fab-expand-arrow {
        color: #334155;
        border-color: #CBD5E1;
      }
      .ai-fab-expand-arrow svg { width: 14px; height: 14px; }
      .ai-fab-hint {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-size: 11.5px;
        font-weight: 600;
        color: #64748B;
        letter-spacing: .04em;
        user-select: none;
        margin-block-start: 4px;
      }
      .ai-fab[aria-expanded="true"] {
        transform: translateX(100%);      /* physical translate — slides out inline-end direction */
        opacity: 0;
        pointer-events: none;
      }
      /* Legacy pulse element (no-op now — kept for DOM-API compat) */
      .ai-fab-pulse { display: none; }

      /* Global: push page content away from the fixed rail so it isn't covered. */
      body { padding-inline-start: 48px; }

      /* Side panel — SAME side as the rail (inline-start = RIGHT in RTL).
         When closed, translated off-screen to the physical right. When open,
         slides into view, effectively "growing" from the rail. */
      .ai-panel {
        position: fixed;
        inset-block-start: 0;
        inset-block-end: 0;
        inset-inline-start: 0;                     /* RIGHT in RTL — same as .ai-fab */
        width: 420px;
        max-width: 100vw;
        z-index: 1001;
        background: #FFFFFF;
        border-inline-end: 1px solid #E2E8F0;      /* seam between panel and page */
        box-shadow: 6px 0 28px rgba(15,23,42,.10); /* shadow spills toward content (LEFT in RTL) */
        display: flex;
        flex-direction: column;
        transform: translateX(100%);                /* off-screen to the physical RIGHT */
        transition: transform .35s cubic-bezier(.4,0,.2,1);
        font-family: 'Heebo', system-ui, sans-serif;
      }
      .ai-panel.open { transform: translateX(0) !important; }

      /* Body push — replace the 48px rail padding with a 420px panel padding.
         Content shifts LEFT (physical) to make room for the RIGHT-anchored panel. */
      body.ai-panel-open {
        padding-inline-start: 420px;
        transition: padding-inline-start .35s cubic-bezier(.4,0,.2,1);
      }
      @media (max-width: 880px) {
        .ai-panel { width: 100vw; }
        body.ai-panel-open { padding-inline-end: 0; }  /* full-screen on mobile */
      }

      /* Panel header */
      .ai-panel-header {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px;
        border-block-end: 1px solid #E2E8F0;
        background: #FFFFFF;
      }
      .ai-panel-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 700;
        color: #0F172A;
      }
      .ai-panel-title-icon {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: #0F172A;
        color: #fff;
        display: grid;
        place-items: center;
      }
      .ai-panel-title-icon svg { width: 16px; height: 16px; }
      .ai-panel-title-text { display: flex; flex-direction: column; gap: 2px; line-height: 1.2; }
      .ai-panel-title-text small {
        font-size: 11px;
        font-weight: 500;
        color: #64748B;
      }
      .ai-panel-actions { display: flex; gap: 4px; }
      .ai-panel-icon-btn {
        width: 32px; height: 32px;
        border-radius: 8px;
        background: transparent;
        border: 1px solid transparent;
        color: #64748B;
        cursor: pointer;
        display: grid;
        place-items: center;
        font-family: inherit;
        transition: background .15s, color .15s, border-color .15s;
      }
      .ai-panel-icon-btn:hover {
        background: #F8FAFC;
        color: #0F172A;
        border-color: #E2E8F0;
      }
      .ai-panel-icon-btn svg { width: 16px; height: 16px; }

      /* Messages area */
      .ai-panel-messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px;
        background: #F1F5F9;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .ai-panel-empty {
        text-align: center;
        color: #64748B;
        padding-block: 24px;
        font-size: 13.5px;
      }
      .ai-panel-empty-title {
        font-size: 15px;
        font-weight: 700;
        color: #0F172A;
        margin-block-end: 6px;
      }
      .ai-panel-empty-suggestions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-block-start: 16px;
        max-width: 320px;
        margin-inline: auto;
      }
      .ai-panel-suggestion {
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        color: #334155;
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        padding: 9px 14px;
        text-align: start;
        cursor: pointer;
        transition: all .15s;
      }
      .ai-panel-suggestion:hover {
        border-color: #334155;
        background: #E2E8F0;
      }

      .ai-bubble { display: flex; gap: 10px; align-items: flex-start; }
      .ai-bubble-avatar {
        width: 28px; height: 28px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .ai-bubble.user .ai-bubble-avatar { background: #CBD5E1; color: #0F172A; }
      .ai-bubble.bot  .ai-bubble-avatar { background: #334155; color: #fff; }
      .ai-bubble-content {
        flex: 1;
        min-width: 0;
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 11px 13px;
        font-size: 13.5px;
        line-height: 1.6;
        color: #0F172A;
        box-shadow: 0 1px 2px rgba(15,23,42,.04);
      }
      .ai-bubble.user .ai-bubble-content {
        background: #E2E8F0;
        border-color: #CBD5E1;
      }

      /* Composer */
      .ai-panel-composer {
        flex-shrink: 0;
        padding: 14px 18px 18px;
        background: #FFFFFF;
        border-block-start: 1px solid #E2E8F0;
      }
      .ai-panel-composer-wrap {
        background: #FFFFFF;
        border: 1.5px solid #CBD5E1;
        border-radius: 12px;
        padding: 9px 12px 7px;
        box-shadow: 0 1px 2px rgba(15,23,42,.04);
        transition: border-color .15s, box-shadow .15s;
      }
      .ai-panel-composer-wrap:focus-within {
        border-color: #334155;
        box-shadow: 0 0 0 3px rgba(51,65,85,.10);
      }
      .ai-panel-composer-input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: 13.5px;
        line-height: 1.55;
        color: #0F172A;
        resize: none;
        min-height: 36px;
        max-height: 110px;
      }
      .ai-panel-composer-input:focus-visible { outline: none; }
      .ai-panel-composer-input::placeholder { color: #64748B; }
      .ai-panel-composer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-block-start: 5px;
      }
      .ai-panel-composer-hint { font-size: 11px; color: #64748B; }
      .ai-panel-composer-send {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #0F172A;
        color: #fff;
        border: none;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: background .15s, transform .15s;
      }
      .ai-panel-composer-send:hover { background: #1e293b; }
      .ai-panel-composer-send:active { transform: scale(.94); }
      .ai-panel-composer-send svg { width: 14px; height: 14px; }

      /* Focus ring */
      .ai-fab:focus-visible,
      .ai-panel-icon-btn:focus-visible,
      .ai-panel-suggestion:focus-visible {
        outline: 2px solid #334155;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Icon builders ─────────────────────────────────────── */
  function iconSparkle() {
    const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                              'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                              'aria-hidden': 'true' });
    s.appendChild(svgEl('path', { d: 'M12 3l1.88 5.76L20 11l-5.76 1.88L12 19l-1.88-5.76L4 11l5.76-1.88L12 3z' }));
    s.appendChild(svgEl('path', { d: 'M5 3v4M3 5h4M19 17v4M17 19h4' }));
    return s;
  }
  /* Chevron pointing inline-end — in RTL that's LEFT, hinting "expand the panel that way". */
  function iconExpandArrow() {
    const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                              'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                              'aria-hidden': 'true' });
    s.appendChild(svgEl('polyline', { points: '15 18 9 12 15 6' }));
    return s;
  }
  function iconClose() {
    const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                              'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                              'aria-hidden': 'true' });
    s.appendChild(svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }));
    s.appendChild(svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' }));
    return s;
  }
  function iconClear() {
    const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                              'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                              'aria-hidden': 'true' });
    s.appendChild(svgEl('polyline', { points: '3 6 5 6 21 6' }));
    s.appendChild(svgEl('path', { d: 'M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6' }));
    s.appendChild(svgEl('path', { d: 'M10 11v6M14 11v6' }));
    return s;
  }
  function iconSend() {
    /* Left-pointing arrow (RTL "send forward" = leftward) */
    const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
                              'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
                              'aria-hidden': 'true' });
    s.appendChild(svgEl('line', { x1: '19', y1: '12', x2: '5', y2: '12' }));
    s.appendChild(svgEl('polyline', { points: '12 5 5 12 12 19' }));
    return s;
  }

  /* ─── Component builders ────────────────────────────────── */
  function buildFab() {
    const btn = el('button', {
      class: 'ai-fab',
      id: 'ai-fab-btn',
      'aria-label': 'פתח שיחה עם AI',
      'aria-expanded': 'false',
      'aria-controls': 'ai-panel',
      onclick: openPanel
    });

    /* Dark circle with sparkle glyph — the "who you're talking to" mark */
    const iconBadge = el('span', { class: 'ai-fab-icon-badge', 'aria-hidden': 'true' });
    iconBadge.appendChild(iconSparkle());
    btn.appendChild(iconBadge);

    /* Chevron in a bordered circle — "expand" affordance */
    const expandArrow = el('span', { class: 'ai-fab-expand-arrow', 'aria-hidden': 'true' });
    expandArrow.appendChild(iconExpandArrow());
    btn.appendChild(expandArrow);

    /* Vertical hint text — reads bottom-to-top in RTL context */
    btn.appendChild(el('span', { class: 'ai-fab-hint', text: 'היועץ החכם' }));

    return btn;
  }

  function buildPanel() {
    const ctx = getPageContext();

    const titleIcon = el('div', { class: 'ai-panel-title-icon', 'aria-hidden': 'true' });
    titleIcon.appendChild(iconSparkle());

    const titleText = el('div', { class: 'ai-panel-title-text' },
      el('span', { text: 'שיחה עם AI' }),
      el('small', { text: 'נמצא ב: ' + ctx.pageName })
    );

    const closeBtn = el('button', {
      class: 'ai-panel-icon-btn',
      'aria-label': 'סגור פאנל',
      onclick: closePanel
    });
    closeBtn.appendChild(iconClose());

    const clearBtn = el('button', {
      class: 'ai-panel-icon-btn',
      'aria-label': 'נקה שיחה',
      title: 'התחלה חדשה',
      onclick: () => { if (confirm('לנקות את כל ההיסטוריה?')) clearMessages(); }
    });
    clearBtn.appendChild(iconClear());

    const header = el('header', { class: 'ai-panel-header' },
      el('div', { class: 'ai-panel-title' }, titleIcon, titleText),
      el('div', { class: 'ai-panel-actions' }, clearBtn, closeBtn)
    );

    const messages = el('div', { class: 'ai-panel-messages', id: 'ai-panel-messages', 'aria-live': 'polite' });

    const composerInput = el('textarea', {
      class: 'ai-panel-composer-input',
      id: 'ai-panel-input',
      placeholder: 'שאלו על מדדים, תחומים, או על המסך הנוכחי...',
      rows: 1,
      'aria-label': 'הודעה ל-AI',
      onkeydown: (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitMessage();
        }
      },
      oninput: (e) => autosize(e.target)
    });

    const sendBtn = el('button', {
      type: 'submit',
      class: 'ai-panel-composer-send',
      'aria-label': 'שלח'
    });
    sendBtn.appendChild(iconSend());

    const composer = el('form', {
      class: 'ai-panel-composer',
      onsubmit: (e) => { e.preventDefault(); submitMessage(); }
    },
      el('div', { class: 'ai-panel-composer-wrap' },
        composerInput,
        el('div', { class: 'ai-panel-composer-bottom' },
          el('span', { class: 'ai-panel-composer-hint', text: 'Enter לשליחה · Shift+Enter לשורה חדשה' }),
          sendBtn
        )
      )
    );

    return el('aside', {
      class: 'ai-panel',
      id: 'ai-panel',
      role: 'dialog',
      'aria-label': 'שיחה עם AI',
      'aria-hidden': 'true'
    }, header, messages, composer);
  }

  /* ─── Render ────────────────────────────────────────────── */
  function renderMessages() {
    const wrap = document.getElementById('ai-panel-messages');
    if (!wrap) return;
    wrap.textContent = '';

    if (STATE.messages.length === 0) {
      const ctx = getPageContext();
      const empty = el('div', { class: 'ai-panel-empty' },
        el('div', { class: 'ai-panel-empty-title', text: 'במה אעזור?' }),
        el('div', { text: ctx.subject
          ? 'אני יודע שאתה בודק את "' + ctx.subject + '". שאל שאלה ספציפית עליו, או נסה אחת מאלה:'
          : 'שאל שאלה על קטלוג המדדים. הנה כמה דוגמאות:' })
      );
      const suggestions = el('div', { class: 'ai-panel-empty-suggestions' });
      ctx.suggestions.forEach(s => {
        suggestions.appendChild(el('button', {
          type: 'button',
          class: 'ai-panel-suggestion',
          text: s,
          onclick: () => { sendUserMessage(s); }
        }));
      });
      empty.appendChild(suggestions);
      wrap.appendChild(empty);
      return;
    }

    STATE.messages.forEach(m => {
      const av = el('div', { class: 'ai-bubble-avatar', 'aria-hidden': 'true', text: m.role === 'bot' ? 'AI' : 'את' });
      const content = el('div', { class: 'ai-bubble-content', text: m.text });
      wrap.appendChild(el('div', { class: 'ai-bubble ' + (m.role === 'bot' ? 'bot' : 'user') }, av, content));
    });

    requestAnimationFrame(() => { wrap.scrollTop = wrap.scrollHeight; });
  }

  /* ─── Behavior ──────────────────────────────────────────── */
  function openPanel() {
    STATE.open = true;
    const fab = document.getElementById('ai-fab-btn');
    const panel = document.getElementById('ai-panel');
    if (fab) fab.setAttribute('aria-expanded', 'true');
    if (panel) {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('ai-panel-open');
    /* Focus the input after slide-in completes */
    setTimeout(() => {
      const input = document.getElementById('ai-panel-input');
      if (input) input.focus();
    }, 350);
  }
  function closePanel() {
    STATE.open = false;
    const fab = document.getElementById('ai-fab-btn');
    const panel = document.getElementById('ai-panel');
    if (fab) fab.setAttribute('aria-expanded', 'false');
    if (panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('ai-panel-open');
    if (fab) fab.focus();
  }

  function submitMessage() {
    const input = document.getElementById('ai-panel-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    input.value = '';
    autosize(input);
    sendUserMessage(text);
  }

  function sendUserMessage(text) {
    STATE.messages.push({ role: 'user', text: text, ts: Date.now() });
    saveMessages();
    renderMessages();
    /* Simulated AI reply (mocked, no real call) */
    setTimeout(() => {
      const reply = mockReply(text);
      STATE.messages.push({ role: 'bot', text: reply, ts: Date.now() });
      saveMessages();
      renderMessages();
    }, 700);
  }

  function mockReply(userText) {
    const ctx = getPageContext();
    const lower = userText.toLowerCase();
    if (lower.includes('שלום') || lower.includes('היי') || lower.includes('hi')) {
      return 'שלום! איך אוכל לעזור לך בקטלוג היום?';
    }
    if (lower.includes('מדד') && lower.includes('בריאות')) {
      return 'בתחום הבריאות יש לנו 4 תחומי משנה: קידום מניעה, טיפול, חירום ובריאות הנפש. רוצה שנעמיק באחד?';
    }
    if (lower.includes('תוצאה') && lower.includes('תפוקה')) {
      return 'הבחנה חשובה: **תוצאה (Outcome)** מודדת שינוי באוכלוסיית היעד (למשל BMI). **תפוקה (Output)** מודדת את מה שהתכנית הניבה (למשל שעות פעילות). תוצאה = מה השתנה. תפוקה = מה עשינו.';
    }
    if (lower.includes('אי-שוויון') || lower.includes('שוויון')) {
      return 'מדדי אי-שוויון נמצאים בעיקר בתחום הרווחה הכלכלית. הקלאסיים: מדד ג\'יני, יחס הכנסה רבעון עליון/תחתון, שיעור עוני יחסי. רוצה לראות אותם?';
    }
    return 'שאלה טובה. בהקשר של "' + ctx.pageName + '", אני יכול לעזור לך למצוא מדדים מתאימים. נסה לתאר את התכנית או האוכלוסיה שאתה עובד עליה, ואני אציע לך 2-3 מדדים רלוונטיים עם הסבר.';
  }

  function autosize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';
  }

  /* ─── Init ──────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.body.appendChild(buildFab());
    document.body.appendChild(buildPanel());
    renderMessages();

    /* ESC to close panel */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && STATE.open) closePanel();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
