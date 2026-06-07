/* ============================================================
   ai-chat.js  —  Logic for the two-pane AI chat experience.
   Mocked: no real AI calls, all responses are hardcoded.
   XSS-safe: built with DOM API only, no HTML string parsing.
============================================================ */

/* ─── Indicator data (mocked AI recommendations) ─── */
const INDICATORS = [
  {
    id: 'bmi',
    name: 'אחוז ילדים עם BMI > 30',
    type: 'outcome',
    typeLabel: 'תוצאה',
    domain: 'health',
    domainLabel: 'בריאות',
    domainColor: '#DC2626',
    snippet: 'מודד אחוז בני הנוער עם השמנה לפי BMI מעל 30, בחתך גיל ומגדר. מאפשר השוואה לאומית והתפלגות לפי אזורים.',
    rationaleLabel: 'למה זה התאים לכם:',
    rationale: 'אתם פועלים סביב תזונה ופעילות — זה המדד הקלאסי לתוצאה הקשורה ישירות לתחום ההתערבות שלכם.',
    frequency: 'שנתי',
    source: 'מדידה אנתרופומטרית',
    isNew: false
  },
  {
    id: 'activity',
    name: 'שעות פעילות גופנית בשבוע',
    type: 'output',
    typeLabel: 'תפוקה',
    domain: 'health',
    domainLabel: 'פעילות גופנית',
    domainColor: '#D97706',
    snippet: 'מספר השעות השבועיות בהן בני נוער עוסקים בפעילות גופנית מתונה עד נמרצת, בהשוואה להמלצות ה-WHO.',
    rationaleLabel: 'למה זה התאים לכם:',
    rationale: 'מדד מנבא להצלחת המרכיב הספורטיבי — קל לאיסוף בדיווח עצמי, ועונה ישירות על השאלה "האם הצלחנו להזיז אותם?".',
    frequency: 'רבעוני',
    source: 'שאלון משתתפים',
    isNew: false
  },
  {
    id: 'nutrition-knowledge',
    name: 'ידע תזונתי',
    type: 'output',
    typeLabel: 'תפוקה',
    domain: 'edu',
    domainLabel: 'ידע ועמדות',
    domainColor: '#2563EB',
    snippet: 'רמת הידע התזונתי של המשתתפים — מודד אם רכיב החינוך מצליח להעביר את התוכן, עוד לפני שינוי התנהגותי.',
    rationaleLabel: 'למה זה התאים לכם:',
    rationale: 'מאפשר לבחון את הרכיב החינוכי בנפרד מההתנהגות עצמה — חיווי מוקדם לפני שתוצאות BMI מתחילות לזוז.',
    frequency: 'לפני/אחרי מחזור',
    source: 'שאלון פסיכומטרי',
    isNew: false
  }
];

const FOLLOWUP_INDICATORS = [
  {
    id: 'access',
    name: 'נגישות סביבתית למזון בריא',
    type: 'context',
    typeLabel: 'הקשר',
    domain: 'welfare',
    domainLabel: 'סביבה',
    domainColor: '#059669',
    snippet: 'מדד הקשר שמתאר את הסביבה שבה פועלת התוכנית — כמה חנויות מזון בריא ביישוב, מרחק ממוסדות חינוך.',
    rationaleLabel: 'נוסף בעקבות השאלה שלכם:',
    rationale: 'הזכרתם פריפריה — זה מדד הקשר שיעזור לפרש למה תוצאות שונות באזורים שונים, גם כשהתוכנית זהה.',
    frequency: 'דו-שנתי',
    source: 'נתוני מינהל + GIS',
    isNew: true
  },
  {
    id: 'self-efficacy',
    name: 'מסוגלות עצמית לאורח חיים בריא',
    type: 'output',
    typeLabel: 'תפוקה',
    domain: 'edu',
    domainLabel: 'ידע ועמדות',
    domainColor: '#2563EB',
    snippet: 'תפיסת היכולת של הנער/ה לשמור על הרגלים בריאים — אינדיקטור פסיכולוגי המנבא יציבות תוצאות בטווח הארוך.',
    rationaleLabel: 'נוסף בעקבות השאלה שלכם:',
    rationale: 'שאלתם על קיימות התוצאה — מסוגלות עצמית היא מה שמבדיל בין שינוי זמני לשינוי שמחזיק.',
    frequency: 'לפני/אחרי + מעקב 6ח',
    source: 'שאלון GSE מותאם',
    isNew: true
  }
];

/* ─── State ─── */
/* Comparison state lives in sessionStorage via window.ICCard.compare —
   shared with search-results, browse, and comparison.html. */
const MAX_COMPARE = (window.ICCard && window.ICCard.compare.MAX) || 3;
let conversationTurn = 1;
let renderedIndicators = [...INDICATORS];

const SEED_USER_MSG = 'אנחנו מפעילים תוכנית לקידום בריאות לנוער בסיכון — תזונה ופעילות גופנית. אילו מדדים כדאי לי למדוד?';

/* ─── DOM helpers (no string parsing) ─── */
function makeEl(tag, attrs, ...children) {
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
    if (typeof c === 'string')   e.appendChild(document.createTextNode(c));
    else if (c instanceof Node)  e.appendChild(c);
  }
  return e;
}
function replaceChildren(parent, ...nodes) {
  parent.textContent = '';
  for (const n of nodes.flat()) {
    if (n) parent.appendChild(n);
  }
}

/* ─── SVG icon builder (DOM-only) ─── */
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgNode(tag, attrs) {
  const e = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
function icon(name) {
  const svg = svgNode('svg', {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true'
  });
  const parts = {
    'plus':       () => [
      svgNode('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
      svgNode('line', { x1: '5',  y1: '12', x2: '19', y2: '12' })
    ],
    'check':      () => [ svgNode('polyline', { points: '20 6 9 17 4 12' }) ],
    'arrow-left': () => [
      svgNode('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
      svgNode('polyline', { points: '12 19 5 12 12 5' })
    ],
    'arrow-r':    () => [ svgNode('polyline', { points: '9 18 15 12 9 6' }) ],
    'clock':      () => [
      svgNode('circle', { cx: '12', cy: '12', r: '10' }),
      svgNode('polyline', { points: '12 6 12 12 16 14' })
    ],
    'file':       () => [
      svgNode('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      svgNode('polyline', { points: '14 2 14 8 20 8' })
    ]
  };
  const builder = parts[name];
  if (builder) for (const child of builder()) svg.appendChild(child);
  return svg;
}

/* ─── Chat message builders ─── */
function buildUserBubble(text) {
  return makeEl('div', { class: 'ai-msg user' },
    makeEl('div', { class: 'ai-msg-avatar', 'aria-hidden': 'true', text: 'את' }),
    makeEl('div', { class: 'ai-msg-bubble', text: text })
  );
}

/* paragraphs: array of arrays. Each inner array contains:
   - string (literal text)
   - { bold: string } (rendered as <strong>) */
function buildBotBubble(paragraphs, opts) {
  opts = opts || {};
  const bubble = makeEl('div', { class: 'ai-msg-bubble' });
  paragraphs.forEach((parts, i) => {
    const para = makeEl('p');
    if (i > 0) para.style.marginBlockStart = '8px';
    for (const part of parts) {
      if (typeof part === 'string') {
        para.appendChild(document.createTextNode(part));
      } else if (part.bold) {
        para.appendChild(makeEl('strong', { text: part.bold }));
      }
    }
    bubble.appendChild(para);
  });
  if (opts.pointer) {
    const link = makeEl('a', {
      class: 'ai-msg-pointer',
      href: '#view-cards',
      onclick: (e) => { e.preventDefault(); switchView('cards'); }
    });
    link.appendChild(icon('arrow-left'));
    link.appendChild(document.createTextNode(' ' + opts.pointer));
    bubble.appendChild(link);
  }
  if (opts.quickReplies && opts.quickReplies.length) {
    const wrap = makeEl('div', { class: 'quick-replies' });
    for (const t of opts.quickReplies) {
      wrap.appendChild(makeEl('button', {
        type: 'button',
        class: 'quick-reply',
        text: t,
        onclick: () => askFollowup(t)
      }));
    }
    bubble.appendChild(wrap);
  }
  return makeEl('div', { class: 'ai-msg bot' },
    makeEl('div', { class: 'ai-msg-avatar', 'aria-hidden': 'true', text: 'AI' }),
    bubble
  );
}

function buildTypingBubble() {
  const typing = makeEl('div', { class: 'ai-typing' },
    makeEl('span'), makeEl('span'), makeEl('span')
  );
  return makeEl('div', { class: 'ai-msg bot typing-msg' },
    makeEl('div', { class: 'ai-msg-avatar', 'aria-hidden': 'true', text: 'AI' }),
    makeEl('div', { class: 'ai-msg-bubble' }, typing)
  );
}

/* ─── Card builder — delegates to the shared ICCard component.
   Same renderer used in browse.html col 3 and search-results.html.
   Falls back to a minimal article if ICCard hasn't loaded (shouldn't happen
   because indicator-card.js is included before ai-chat.js in ai-chat.html). */
function buildCard(it) {
  if (window.ICCard && window.ICCard.render) {
    return window.ICCard.render(it);
  }
  /* Minimal fallback */
  return makeEl('article', { class: 'ic-card' },
    makeEl('a', { href: 'indicator-card.html', class: 'ic-card-title', text: it.name })
  );
}

/* ─── Render ─── */
function renderSeed() {
  const msgs = document.getElementById('chat-messages');
  replaceChildren(msgs,
    buildUserBubble(SEED_USER_MSG),
    buildBotBubble(
      [
        [
          'על בסיס מה שתיארתם, מצאתי ',
          { bold: '3 מדדים' },
          ' שמתאימים במיוחד — אחד לתוצאה, ושניים לתפוקות שיעזרו לכם לבדוק שהמרכיבים פועלים.'
        ],
        ['המדדים מופיעים בכרטיסים בצד. רוצים שאדייק עוד?']
      ],
      {
        quickReplies: [
          'דייק לפי גילאים 12–16',
          'הוסף מדדי הקשר (פריפריה/אקלים)',
          'מה לגבי קיימות התוצאה?'
        ]
      }
    )
  );
  scrollChatToBottom();
  renderCards();
}

function renderCards() {
  const wrap = document.getElementById('results-cards');
  replaceChildren(wrap, ...renderedIndicators.map(buildCard));
  document.getElementById('results-count').textContent = renderedIndicators.length;
}

/* ─── View toggle ─── */
function switchView(view) {
  document.querySelectorAll('.results-tab').forEach(t => {
    t.setAttribute('aria-selected', t.dataset.view === view ? 'true' : 'false');
  });
  document.querySelectorAll('.results-view').forEach(v => {
    v.hidden = (v.id !== 'view-' + view);
  });
}

/* ─── Comparison tray — reads from ICCard.compare (single source of truth).
   Card-level compare buttons are now rendered BY ICCard itself, so we just
   subscribe to changes and re-render the tray + cards when state changes. */
function getCompareItems() {
  return (window.ICCard && window.ICCard.compare.items()) || [];
}

function clearComparison() {
  if (window.ICCard) window.ICCard.compare.clear();
}

function openComparison() {
  if (getCompareItems().length >= 2) {
    window.location.href = 'comparison.html';
  }
}

function renderTray() {
  const tray = document.getElementById('comparison-tray');
  const itemsEl = document.getElementById('tray-items');
  const compareBtn = document.getElementById('tray-compare-btn');
  if (!tray || !itemsEl || !compareBtn) return;

  const items = getCompareItems();
  itemsEl.textContent = '';

  /* Filled slots */
  items.forEach(item => {
    const removeBtn = makeEl('button', {
      class: 'tray-item-remove',
      onclick: () => { if (window.ICCard) window.ICCard.compare.remove(item.id); },
      'aria-label': 'הסר ' + item.name + ' מההשוואה',
      text: '×'
    });
    itemsEl.appendChild(makeEl('div', { class: 'tray-item' },
      makeEl('span', { class: 'tray-item-name', text: item.name }),
      removeBtn
    ));
  });

  /* Empty placeholder slots */
  const emptyCount = Math.max(0, MAX_COMPARE - items.length);
  for (let i = 0; i < emptyCount; i++) {
    itemsEl.appendChild(makeEl('div', { class: 'tray-slot-empty', text: 'הוסף מדד' }));
  }

  tray.classList.toggle('visible', items.length > 0);
  compareBtn.disabled = items.length < 2;
}

/* ─── Chat interactions ─── */
function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) { input.focus(); return; }
  pushUserAndTyping(msg);
  input.value = '';
  autosize(input);
  setTimeout(() => respondAndExpand(msg), 700);
}

function askFollowup(text) {
  document.getElementById('chat-input').value = text;
  sendMessage();
}

function pushUserAndTyping(msg) {
  const msgs = document.getElementById('chat-messages');
  msgs.appendChild(buildUserBubble(msg));
  msgs.appendChild(buildTypingBubble());
  scrollChatToBottom();
}

function respondAndExpand(userMsg) {
  const msgs = document.getElementById('chat-messages');
  const typing = msgs.querySelector('.typing-msg');
  if (typing) typing.remove();

  if (conversationTurn === 1) {
    conversationTurn = 2;
    renderedIndicators = [...INDICATORS, ...FOLLOWUP_INDICATORS];
    renderCards();

    msgs.appendChild(buildBotBubble(
      [
        [
          'הוספתי ',
          { bold: '2 מדדים נוספים' },
          ' שמתאימים לדיוק שביקשתם — מסומנים "חדש בסבב" בכרטיסים.'
        ],
        ['המדדים החדשים מסומנים גם במפה הסמנטית בהשפעת השאלה החדשה.']
      ],
      {
        quickReplies: [
          'הצג רק מדדי תוצאה',
          'איזה מדד הכי קל לאיסוף?',
          'בנה לי סט מדדים מלא'
        ]
      }
    ));
  } else {
    msgs.appendChild(buildBotBubble(
      [
        ['שאלה טובה. בהתבסס על ' + renderedIndicators.length + ' המדדים הנוכחיים בצד, הנה ההמלצה שלי...'],
        ['תרצו שאחבר חבילה מלאה עם תדירויות ולוח זמנים?']
      ],
      {
        quickReplies: [
          'כן, בנה חבילה',
          'הוסף מדדי השפעה ארוכת טווח',
          'סנן לפי תקציב נמוך'
        ]
      }
    ));
  }
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const msgs = document.getElementById('chat-messages');
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

function autosize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function goToCard() {
  window.location.href = 'indicator-card.html';
}

/* ─── Read initial query from URL (when user navigated from home) ─── */
function readInitialQuery() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && q.trim()) {
    const msgs = document.getElementById('chat-messages');
    const firstUserBubble = msgs.querySelector('.ai-msg.user .ai-msg-bubble');
    if (firstUserBubble) firstUserBubble.textContent = q;
  }
}

/* ─── Init ─── */
document.getElementById('chat-input').addEventListener('input', e => autosize(e.target));
renderSeed();
renderTray();
readInitialQuery();

/* Sync UI with the shared compare store. When ICCard.compare changes
   (e.g., user clicks the compare button on an indicator card), re-render
   both the cards (to update the "+ השווה" ⟶ "✓ נוסף" state) and the tray. */
if (window.ICCard) {
  window.ICCard.compare.onChange(() => {
    renderCards();
    renderTray();
  });
}
