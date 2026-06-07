# Design Log — קטלוג מדדים חברתיים | JDC DIDA

---

## סטטוס שלבים

| שלב | סטטוס |
|-----|-------|
| A — Product Brief | ✓ הושלם |
| B — Trigger Map | ✓ הושלם |
| C — UX Scenarios | ✓ הושלם |
| D — UX Design | ⏳ בעבודה — 6 פרוטוטיפים HTML |
| E — Development | ○ טרם התחיל |

---

## Current

שלב D — פרוטוטיפים אינטראקטיביים ב-`D-UX-Design/prototypes/`.
6 מסכים בנויים: `home` · `search-results` · `browse` · `indicator-card` · `comparison` · `node-chart`.
ניווט אחיד בכל המסכים. גרסאות נשמרות אוטומטית ל-`prototypes/_versions/`.
**אחרון:** Phase A של ארכיטקטורה מאוחדת — AI FAB גלובלי בכל המסכים (25 במאי 2026).

---

## Log

### 7 במאי 2026 — Saga

**Product Brief:**
- `A-Product-Brief/product-brief.md` ✓
- `A-Product-Brief/content-language.md` ✓
- `A-Product-Brief/visual-direction.md` ✓

**Trigger Map:**
- `B-Trigger-Map/01-business-goals.md` ✓ — G1 שפת המדידה · G2 כלי הסטנדרט · G3 אימוץ מלא
- `B-Trigger-Map/02-persona-michal-the-manager.md` ✓ — עדיפות ראשית
- `B-Trigger-Map/03-persona-gilad-the-expert.md` ✓ — עדיפות שנייה
- `B-Trigger-Map/04-persona-rachel-the-researcher.md` ✓ — עדיפות שלישית
- `B-Trigger-Map/00-trigger-map.md` ✓ — פוסטר מפת טריגרים
- `B-Trigger-Map/feature-impact.md` ✓ — ניתוח השפעת פיצ'רים (10 פיצ'רים, Tier A–C)

### 7 במאי 2026 — Freya

**UX Scenarios:**
- `C-UX-Scenarios/01-scenario-michal.md` ✓ — 5 מסכים
- `C-UX-Scenarios/02-scenario-gilad.md` ✓ — 6 מסכים
- `C-UX-Scenarios/03-scenario-rachel.md` ✓ — 5 מסכים
- `C-UX-Scenarios/00-ux-scenarios.md` ✓ — אינדקס · 7 מסכים ייחודיים

### 17 במאי 2026 — Freya (Phase D — פרוטוטיפים)

**Node Chart (מפה סמנטית):** נבנה `prototypes/node-chart.html` — גרף D3 force-directed.
- Empty state: 8 תחומי חיים (רק "בריאות" אקטיבי ב-MVP)
- היררכיה: תחום חיים → נושא → תוצאה → מדד → מתודולוגיה (לפי המתודולוגיה הרשמית)
- drill-down בקליק, מרכוז הצומת הנלחץ (מתחשב בפאנל הצד), פריסה רדיאלית מסודרת
- 3 סוגי קשרים: היררכי (מלא+חץ) · משלים (תכלת) · חלופי (מקווקו ענבר)

**ניווט אחיד:** Header זהה ב-6 המסכים. סדר: בית · עיון · מפה סמנטית · אודות.
לוגו בשמאל, תפריט בימין, אקטיבי = קו תחתון.

**Wireframe pass:** הפלטה הומרה ל-slate אפור (`--primary` #334155). חריג: המפה הסמנטית
+ המקרא נשארו צבעוניים (הצבע חיוני סמנטית). פאנל/ניווט = אפור.

**ריפוזיציה (17 במאי):**
- מיתוג: הוסר "DIDA" (16 הופעות) → "קטלוג מדדים חברתיים" + `assets/joint-logo.svg` (placeholder להחלפה)
- AI דומיננטי (לא מרכזי): `home` — רכיב צ'אט בולט + שיחה מודמה, 3 מסלולים שווי-ערך (שיחת AI · עיון · מפה סמנטית), חיפוש מילולי משני
- `indicator-card`: רכיב "שאל על המדד הזה" (תשובות מודמות) + סעיף "היכן המדד נמצא בשימוש" (פסקאות טקסט, פתוח לכל ארגון — לא רק JDC)
- `browse`: drill-down רמה-אחר-רמה + breadcrumbs + back (במקום אקורדיון)

**גיבוי:** `prototypes/_versions/*_150938.html` — מצב טרום-ריפוזיציה.
**תוכנית מלאה:** `~/.claude/plans/dida-cozy-token.md`

### 18 במאי 2026 — Freya (שדה חיפוש בהאדר)

**שינוי:** הסרת `secondary-search` מ-`home.html` (HTML + CSS + JS `doSearch()`), והוספת
שדה חיפוש פתוח (תמיד גלוי, ללא toggle) ב-Header של כל 6 המסכים.

**מבנה ה-Header החדש (RTL):**
```
[בית עיון מפה אודות]  [🔍 חיפוש מדד, תחום או מילת מפתח...]  [........]  [לוגו]
```
- `<form class="nav-search" action="search-results.html" method="get">` — submit נטיב, ללא JS
- `flex: 1; max-width: 360px; min-width: 200px` — מתאים את עצמו לרוחב מסך
- `inset-inline-end: 12px` לאייקון — mirroring אוטומטי ב-RTL
- Input: `--bg-page` ברקע, focus → `border-color: var(--primary)` + `--bg-card`

**אדפטציה ל-browse.html:** הקובץ משתמש ב-naming ישן (`--surface`/`--surface-2`/`8px`),
ולכן ה-CSS שלו הותאם בהתאם — אך הרכיב נראה ומתפקד זהה.

**גיבוי:** `prototypes/_versions/*_115502.html` — מצב טרום-שדה-חיפוש בהאדר.

**עידון נוסף (18/5):** הרווח האנכי בין שורות התגיות ב-home (`.ai-starters` → `.hero-tags`)
צומצם מ-20px ל-8px, כדי להיות זהה ל-gap האופקי בין הקפסולות (8px) — חזות אחידה.

**איחוד הקפסולות לבלוק אחד (18/5):** שני הקונטיינרים (`.ai-starters` + `.hero-tags`) אוחדו
ל-`.ai-starters` יחיד עם כל 5 הכפתורים. הסיבה: `gap: 8px` + `flex-wrap: wrap` מבטיחים
row-gap = column-gap אוטומטית, ללא צורך ב-margin בין שורות. ה-`.ai-conversation`
הוזז לאחר הקפסולות (במקום ביניהן).

**Bug שתוקן:** `.ai-conversation` עם `display: flex` דרס את ה-`hidden` attribute וגרם
ל-div להתפוס מקום (28px) גם כשהוא "מוסתר". תוקן עם `.ai-conversation[hidden] { display: none; }`.
זה הסביר את ה-36px הכולל שהיו בין השורות (8 + 28).

**CSS שהוסר:** `.hero-tags`, `.tag`, `.tag:hover`, `.tag-dot`, `.tag-question` — כל ה-CSS
של ה-`tag` class הוסר כי לא משתמשים בו יותר. כל 5 הכפתורים משתמשים ב-`.ai-starter`
לחזות אחידה (font-weight 600, padding 7px 16px).

### 18 במאי 2026 — Freya (מסך שיחה דו-pane — ai-chat.html)

**מסך חדש:** `prototypes/ai-chat.html` + `prototypes/assets/ai-chat.js`. מסך שמופיע
אחרי submit ב-AI composer ב-home. דומה לממשק vibe coding (Cursor, v0, Lovable).

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Header (זהה ל-6 המסכים האחרים)                            │
├──────────────────────────────────────────────────────────┤
│  ┌─────────── שמאל (1fr) ──────────┬── ימין (420px) ────┐ │
│  │  תוצאות החקירה                   │  שיחה — בחירת מדדים  │ │
│  │  [tabs: כרטיסים / מפה]           │  ─────────────────  │ │
│  │  ───────────────────             │  💬 user msg        │ │
│  │  ▢ מדד 1 (badges, rationale)    │  🤖 bot response    │ │
│  │  ▢ מדד 2                        │  + quick replies    │ │
│  │  ▢ מדד 3                        │                     │ │
│  │  [+ נוספו ב-turn 2]              │  ─────────────────  │ │
│  │                                  │  [composer]      ↑  │ │
│  │  אקשן strip: השווה N מדדים       │                     │ │
│  └──────────────────────────────────┴─────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**RTL ב-Grid:** `grid-template-columns: 420px 1fr` — העמודה הראשונה (chat 420px) מוקמת
ב-inline-start = ימין ב-RTL. ה-1fr (results) שמאל. אוטומטי, ללא JS.

**שתי תצוגות בצד התוצאות:**
- **כרטיסים** (default) — `result-card` pattern עם badges (תוצאה/תפוקה/הקשר), חתימת תחום,
  rationale "למה זה התאים לכם", meta (תדירות, מקור), כפתור "השווה" + "פתח כרטיס".
- **מפה סמנטית** — SVG סטטי עם 9 nodes (תחום מרכזי → 4 נושאים → 4 מדדים מומלצים).
  קישור "פתח מפה מלאה" → node-chart.html. נשמר ה-styling הצבעוני (חריג בפלטת ה-slate).

**שיחה — סבבים מודמים:**
- **טור 1 (seed):** ההודעה מ-home (URL ?q=...) → bot מציג 3 מדדים בכרטיסים.
- **טור 2 (follow-up):** משתמש שואל → bot מוסיף 2 מדדים נוספים מסומנים "חדש בסבב".
- **טור 3+:** טקסט בלבד (אין הוספת כרטיסים).
- **Quick replies:** כל תגובת bot כוללת 3 chips להמשך מהיר.

**ניווט מ-home:**
- `runConversation()` → `window.location.href = 'ai-chat.html?q=' + encodeURIComponent(msg)`
- כל ה-callers (composer submit, scenario chips, example chips) עוברים דרך זה.
- ai-chat קורא את `?q=...` ומחליף את הודעת ה-seed.

**XSS-safe JS:** ה-security hook חסם innerHTML בקובץ חדש. הפתרון: ai-chat.js כולו בנוי
ב-DOM API (`createElement`, `createElementNS` ל-SVG, `textContent`). פונקציית `makeEl()`
helper לבניית elements בצורה אטומית. SVG icons נבנים מ-paths sequence ב-`svgNode()`.

**Dead code שהוסר מ-home.html:** `AI_RECS`, `aiBubble()`, `recsHTML()`,
`<div class="ai-conversation">` — כולם היו תלויים ב-flow הישן של conv inline.

**לוגו רשמי של ג'וינט (18/5):** הוחלף `assets/joint-logo.svg` מ-placeholder ללוגו האמיתי
(SVG 117×28, מקור: `JDC DIDA2/LOGO.svg`). לפי CLAUDE.md — קובץ בלבד, ה-HTML לא נגענו בו.
הלוגו נראה כעת ב-7 המסכים אוטומטית. גובה תצוגה: 26px (`.nav-logo-img { height: 26px }`).

**Header reorder לקונבנציה עברית (18/5):** ה-Header הוחלף ב-7 הקבצים לסדר הטבעי
של עברית RTL:
```
מימין →  לוגו+טקסט · תפריט (4 קישורים) · ........ · שדה חיפוש  ← שמאל
```
**שינוי טכני:**
- ב-HTML: `<a class="nav-logo">` עבר להיות הראשון ב-DOM (מרונדר ב-inline-start = ימין).
- ב-CSS: `margin-inline-start: auto` הוסר מ-`.nav-logo` ועבר ל-`.nav-search`,
  שכעת נדחף לקצה ה-inline-end (שמאל). `flex: 1` הוחלף ב-`width: 320px` ב-search
  כי auto-margin מתחרה ב-flex-grow על אותו מקום.
- ב-CLAUDE.md: הקונבנציה עודכנה. הסדר הישן ("לוגו בשמאל") נמחק.

**רציונל:** בעברית RTL, brand placement הטבעי הוא ב-leading edge (ימין) — אותו עיקרון
כמו ב-LTR אבל ממורר. הסדר החדש מקבל מיד את המבט הראשון של הקורא ומציב את "מי אנחנו"
לפני "מה אפשר לעשות".

**גיבוי:** `prototypes/_versions/*_154003.html` — מצב לפני reorder.

**Inline SVG ללוגו (18/5):** ה-Claude desktop preview רץ ב-sandbox שלא טוען קבצים יחסיים
(`<img src="assets/joint-logo.svg">` נכשל ב-preview, עובד רק בדפדפן). הפתרון: ה-SVG הוטמע
ישירות בכל 7 הקבצים כ-`<svg class="nav-logo-img" ...>...</svg>` בתוך ה-`<a class="nav-logo">`.

**Trade-off:** הקונבנציה הישנה "החלף קובץ, לא לגעת ב-HTML" כבר לא תקפה. עדכון לוגו עתידי
דורש: (1) להחליף את `assets/joint-logo.svg` (canonical), ו-(2) להחליף את ה-SVG ב-7 ה-HTML
(ע"י grep+replace של ה-`<svg class="nav-logo-img" ...>...</svg>` המלא). CLAUDE.md עודכן.

**טכני:** ה-SVG עם `viewBox="0 0 117 28"`, מוצג בגובה 26px (CSS). ה-`onerror` הוסר —
לא רלוונטי לעוד ל-inline SVG (אין מה ל"להיכשל" בטעינה).

**גודל לוגו ל-18px (18/5):** ה-CSS `nav-logo-img { height: 18px }` בכל 7 הקבצים.
הרוחב מחושב אוטומטית מ-aspect ratio של ה-viewBox (~75px).

**Comparison tray ב-ai-chat (18/5) — זהה ל-search-results:** הרצועה הישנה
(`.results-actions` עם dashed border + "פתח השוואה" disabled) הוחלפה ב-tray מלא:
- **CSS** זהה ל-search-results (רקע `#0F172A`, primary 3px top border, dark item chips
  עם × remove buttons, "השווה" + "נקה" buttons).
- **Positioning**: ב-search-results זה `position: fixed` לכל הויובפורט. ב-ai-chat זה
  flex child של `.results-pane` (sticky bottom of pane via flex layout טבעי).
- **State sync via sessionStorage**: שניהם משתמשים באותו key `comparison` ב-sessionStorage.
  משתמש שבוחר מדדים במסך אחד יראה אותם גם בשני. עקביות אמיתית.
- **MAX_COMPARE = 3** זהה. כפתור "השווה" disabled עד שיש 2+ מדדים.
- **Show/hide animation**: `max-height: 0 → 200px` עם transition .3s. כשמדד נוסף ראשון,
  ה-tray מחליק למעלה. כשמנקים, מחליק חזרה.
- **`.in-comparison` class** על הכרטיס: מסומן עם border בצבע primary + רקע `#F0F9FF`.
  זהה ל-search-results.
- **Cache-buster**: `<script src="assets/ai-chat.js?v=3">` (היה v=2). bump לכל שינוי
  משמעותי ב-JS.

**גיבוי:** `prototypes/_versions/ai-chat_11_164820.html` + `ai-chat-js_11_164820.js`.

**מחיקת `.entry-modes` מה-hero (18/5):** הוסרה דופליקציה ויזואלית בין שני סקשנים שהציעו
את אותם 3 מסלולי גילוי. ההירו השאיר רק את ה-AI composer וה-chips. סקשן "איך זה עובד"
(`how-steps`) נשאר כמקור היחיד להסבר 3 הדרכים.

**עדכון `how-steps` ל-AI-first (18/5):**
- Step 1: "חיפוש חופשי" → **"שיחת AI"**, אייקון מ-magnifying glass לבועת שיחה, תיאור עודכן:
  "תארו תוכנית או שאלו שאלת מדידה. ה-AI מציע מדדים מותאמים, ומסביר את ההיגיון שמאחורי כל המלצה."
- Section sub: "מחפשים" → "משוחחים" (תואם לשינוי).
- Steps 2 ("עיון לפי תחום") ו-3 ("גילוי ויזואלי") נשארו כפי שהם.

**Dead code שנשאר:** CSS של `.entry-modes`, `.entry-card`, `.entry-icon`, `.entry-title`,
`.entry-desc` ב-`home.html` (~85 שורות). לא מפריע, אפשר לנקות בעתיד.

**גיבוי:** `prototypes/_versions/home_46_173004.html`.

**Chips ל-pure prompt examples (18/5):** ה-`.ai-starters` היה ערבוב של 2 actions
(📎 העלה / ✍️ תאר) ו-3 example questions. עכשיו רק 4 example prompts בסגנון
ChatGPT/Claude — שאלות שלמות עם אייקון תחומי (לא כולן `💬`):

- 🩺 מדדים לקידום בריאות נוער
- ⚖️ איך מודדים אי-שוויון
- 🧠 רווחה נפשית בקהילה
- 📊 תוצאה או תפוקה — איך בוחרים?

ה-aria-label של ה-container עודכן: "התחלות מהירות ודוגמאות לשאלות" → "דוגמאות לשאלות".

**ניקוי JS dead code:**
- `focusComposer()` — נמחק (היה בשימוש ע"י entry-cards שכבר נמחקו).
- `aiScenario(kind)` — נמחק (היה בשימוש ע"י action chips שנמחקו).
- `runConversation()` — נמחק (wrapper של navigation, ה-`aiSubmit` עכשיו ניווט ישיר).
- `mockAttach()` — נשאר (עדיין נקרא ע"י paperclip בקומפוזר), אבל refactored מ-innerHTML
  ל-DOM API (createElement/createElementNS) כדי לא להפעיל את ה-security hook.

**`fillPrompt` שינה התנהגות (18/5):** לחיצה על chip לא מנווטת יותר — היא ממלאת את שדה
הקלט ב-`home.html`, focus עם cursor בסוף, ו-`scrollIntoView({block: 'center'})`.
שליחה (Enter או כפתור 📤) עדיין מנווטת ל-ai-chat. UX מותאם לדפוס ChatGPT/Claude.

**הסרת focus outline כפול בקומפוזרים (18/5):** ב-`home.html` (`.ai-composer-input`)
וב-`ai-chat.html` (`.chat-composer-input`) ה-`:focus-visible` הגלובלי דרס את `outline:none`
של הקומפוזר וצייר מסגרת כפולה (border-color מבחוץ + outline מבפנים). תוקן עם override:
`.ai-composer-input:focus-visible { outline: none; }`. ה-`.ai-composer:focus-within`
החיצוני (border + ring) הוא ה-focus indicator היחיד — שמירה על a11y עם vidual cleanliness.

**Breadcrumbs ל-RTL ב-browse (18/5):** 3 תיקונים לעמידה ב-hebrew-rtl-best-practices:
1. **מיקום**: `.drill-nav` הוזז להיות **מעל ה-title** (ראשון ב-page-header-inner),
   במקום אחרי ה-subtitle. דפוס סטנדרטי לאינטרנט — context לפני תוכן.
2. **חץ "חזרה"**: הוסר `transform: scaleX(-1)` מ-`.back-btn svg`. ה-SVG מצייר חץ ימינה
   (→), וב-RTL זה הכיוון הנכון של "חזרה" (= הכיוון ממנו המשתמש הגיע). ה-scaleX הקודם
   הפך לחץ שמאלה (←) — מה שמתאים ל"קדימה" ב-RTL, לא ל"חזרה".
3. **מפריד breadcrumb**: `›` → `‹`. ה-`›` הוא Unicode `ON` (Other Neutral) שלא מתהפך
   אוטומטית ב-RTL. בעברית הזרימה מימין לשמאל, אז drill-down מתבטא במפריד שמצביע שמאלה.

**שמירת `.drill-card-arrow svg { transform: scaleX(-1) }`**: הוא חץ "drill deeper"
על כרטיס תחום, ובעברית drill = ללכת שמאלה (לעומק). ה-scaleX נכון פה.

**גיבוי:** `prototypes/_versions/browse_30_165743.html`.

**תיקון flow השוואה מ-ai-chat (18/5) — באג קריטי:** המשתמש דיווח שכרטיסים שמסומנים
ב-ai-chat לא מגיעים לעמוד ההשוואה. שורש הבעיה: **mismatch של IDs**.

- `search-results.html` משתמש ב-IDs `card-1` עד `card-6`. ל-`comparison.html` יש
  dictionary `INDICATORS` עם בדיוק אותם IDs.
- `ai-chat.js` משתמש ב-IDs סמנטיים: `bmi`, `activity`, `nutrition-knowledge`, `access`,
  `self-efficacy`. אלה **לא היו** ב-`INDICATORS`.
- Flow: ai-chat → toggleCompare(`bmi`, 'אחוז ילדים עם BMI > 30') → sessionStorage שומר
  `[{id: 'bmi', name: '...'}]` → comparison.html טוען → `INDICATORS['bmi']` = undefined
  → render code `if (!ind) return` → דילוג על הכרטיס → המשתמש רואה כלום.

**תיקון:** הוספו 5 entries מלאות ל-`INDICATORS` ב-`comparison.html` — לכל אחת מ-5
המדדים שב-ai-chat (3 ראשוניים + 2 ב-follow-up). כל entry כוללת את כל השדות
שעמוד ההשוואה צריך: `name`, `type`, `typeLabel`, `domain`, `domainLabel`, `domainColor`,
`definition`, `rationale`, `stages` (object), `lessAppropriate`, `tool`, `frequency`,
`ageRange`, `source`, `programs`, `programNames`.

**גם נוספה תמיכה ב-`context` type:** ה-`access` מסווג כ-"הקשר" (context), אבל
comparison.html תמך רק ב-`outcome/output/impact/input`. נוסף `.badge-context` ב-CSS
(`#FFFBEB` רקע, `#D97706` טקסט) וגם נוסף ל-type-map ב-`badgeHTML()`.

**שמירה על architecture:** הפתרון הוא **shared catalog model** — כל המדדים בכל
המסכים זמינים כ-keys ב-`INDICATORS`. אם נוסיף בעתיד מסך חדש שמייצר IDs חדשים,
נצטרך להוסיף גם שם.

**גיבוי:** `prototypes/_versions/comparison_35_170324.html`.

**חץ "שלח" — מעלה ⟶ שמאלה (18/5):** כפתורי send בקומפוזרים השתמשו בחץ למעלה (↑)
כמו ב-ChatGPT/Claude אנגלית. בעברית RTL ה"הזרמה קדימה" = שמאלה, ולכן חץ שמאלה (←)
ברור יותר סמנטית. עודכן ב-3 קבצים:
- `home.html` (`.ai-send-btn`)
- `ai-chat.html` (`.chat-composer-send`)
- `indicator-card.html` (`.ai-ask-send`)

SVG חדש: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 5 5 12 12 19"/>` —
קו אופקי מימין לשמאל + chevron עם apex בצד שמאל.

### 25 במאי 2026 — Freya (Phase A: AI FAB גלובלי)

**רקע ארכיטקטוני:** בריף חדש דרש איחוד 3 כיוונים — Miller Columns ב-browse, מסך תוצאות
אחד עם breadcrumb-source, ו-AI ambient נוכח בכל המסכים. Phase A הוא **התשתית** —
האדיטיב ביותר ולכן נבחר ראשון.

**נכס חדש:** `prototypes/assets/ai-fab.js` (~480 שורות, self-injecting).
- **CSS injection** דרך `<style>` שמוזרק ל-`<head>`. אין צורך ב-`<link>`.
- **HTML injection** דרך `createElement` בלבד — XSS-safe. שני elements נוספים ל-`<body>`:
  כפתור `.ai-fab` ופאנל `aside.ai-panel`.
- **State** ב-localStorage תחת `ai-fab-history` (array של `{role, text, ts}`). שורד נווט בין
  מסכים. שונה מ-sessionStorage של `comparison` (קצר-טווח לסשן).
- **דיכוי per-page**: `<script>window.AI_FAB_DISABLED = true;</script>` לפני include.
  כעת מופעל ב-`ai-chat.html` שיש לו צ'אט מובנה.

**מיקום (RTL-aware):**
- FAB ב-**inset-inline-end: 24px; inset-block-end: 24px** = שמאל-תחתון ב-RTL.
- פאנל ב-**inset-inline-end: 0; width: 420px** = הצמדה לקצה שמאל ב-RTL.
- Slide-in: `transform: translateX(-100%) → 0` (פיזי, לא לוגי — כי `translateX` לא mirror-aware ב-RTL).
- Body push: `padding-inline-end: 420px` כש-`body.ai-panel-open` = הוספת padding בצד שמאל ב-RTL.

**מובייל (≤880px):** הפאנל הופך full-screen, ה-padding מבוטל. media query.

**Context awareness — POC ראשוני:**
- `getPageContext()` קוראת את `window.AI_PAGE_CONTEXT` (override per-page) או fallback ל-URL path.
- כותרת הפאנל מציגה "נמצא ב: [pageName]".
- ב-empty state 3 suggestions (חלק מה-context או default מוטמע).
- ה-mock-reply משתמש ב-pageName בתגובה — "בהקשר של 'דף הבית'..."

**הרחבה עתידית מתוכננת**: כל מסך יגדיר `window.AI_PAGE_CONTEXT = { pageName, subject, suggestions }`
לפני include של ai-fab.js. למשל ב-indicator-card: `{ subject: "מדד אושר סובייקטיבי",
suggestions: ["איך מודדים אושר?", "האם המדד מתאים לגיל הרך?", ...] }`.

**אינטגרציה ב-7 קבצים** (תוספת שורה אחת לכל קובץ):
- 6 קבצים: רק `<script src="assets/ai-fab.js?v=1"></script>` לפני `</body>`.
- `ai-chat.html`: גם `<script>window.AI_FAB_DISABLED = true;</script>` *לפני* ה-script.

**ולידציה ב-preview:**
- ✓ FAB עם sparkle icon מופיע בשמאל-תחתון
- ✓ לחיצה פותחת פאנל, FAB נעלם (opacity:0), תוכן נדחף ימינה ב-420px
- ✓ לחיצה על suggestion → שאלה נשלחת, תגובת mock מופיעה
- ✓ ניווט ל-`indicator-card.html` → ההיסטוריה נטענת מ-localStorage
- ✓ ה-context בכותרת מתעדכן ל-"נמצא ב: כרטיס מדד"

**Skipped בכוונה ב-Phase A** (לפאזות הבאות):
- Per-page `AI_PAGE_CONTEXT` overrides (Phase B עם Miller columns).
- האחדת search-results + ai-chat results למסך אחד (Phase C — "results-surface").
- Miller columns ב-browse (Phase B).

### 25 במאי 2026 — Freya (Phase B: Miller Columns ב-browse)

**מטרה:** החלפת ה-drill-down sequential ב-browse.html ב-Miller Columns אופקיים בסגנון
macOS Finder Column View. הקונספט: כל קליק מוסיף עמודה משמאלה (RTL drill direction),
כל ההיסטוריה נשארת על המסך בו-זמנית.

**שינוי בארכיטקטורת המידע:** ה-`TREE` נשאר זהה (dim → domains → indicators) — רק
ה-rendering layer השתנה. State הופשטה: `{ level, dimId, domId }` ⟶ `{ path: [] }`
(array של IDs נבחרים). כל קליק על item ברמה N קוצץ את ה-path ל-N-1 ומוסיף את ה-ID.

**3 עמודות:**
- **שלב 1 — ממדי חיים** (כל ה-TREE): icon צבעוני + שם + meta של מספר תחומים/מדדים.
- **שלב 2 — תחומים ב-"X"** (אם dim נבחר): dot צבעוני + שם + count.
- **שלב 3 — מדדים ב-"Y"** (אם dom נבחר): badge type (תוצאה/תפוקה/אימפקט/תשומה) +
  שם + meta (תדירות, גיל). קליק → ניווט ל-`indicator-card.html`.

**Active state בעמודות 1-2:** ה-item הנבחר מקבל `background: var(--primary-light)`.
משדר ויזואלית את ה-path הנוכחי.

**אנימציית כניסה לעמודה חדשה:** `@keyframes miller-col-in-rtl` — `opacity 0→1` +
`translateX(-20px → 0)`. ב-RTL הכניסה היא מהשמאל (inline-end), המקום שאליו דריל הולך.

**Responsive fallback:** ב-`@media (max-width: 880px)` ה-container הופך
`flex-direction: column`, העמודות נערמות אנכית עם `max-height: 320px` ו-`overflow-y: auto`.
שומר על שימושיות במובייל בלי לאבד את ה-pattern.

**Crumbs sync:** ה-breadcrumb הקיים (`drill-nav`, מעל ה-title) נשאר ועובד עם
ה-state החדש. רינדור עם DOM API (XSS-safe).

**`back-btn`:** עכשיו מסיר את ה-item האחרון מ-`STATE.path` (`STATE.path.pop()`).

**מימדים שהוסרו:** `.drill-card`, `.drill-card-*`, `.dim-item`, `.dim-trigger`,
`.dim-icon`, `.dim-info`, `.dim-name`, `.dim-desc`, `.dim-meta`, `.dim-count`,
`.dim-domains-count`, `.dim-chevron`, `.dim-body`, `.domain-list`, `.domain-item`,
`.domain-trigger`, `.domain-dot`, `.domain-name`, `.domain-count-pill`,
`.domain-chevron`, `.domain-body`, `.ind-list`, `.ind-row`, `.badge-type`,
`.ind-name-link`, `.ind-meta`, `.ind-arrow`, `.level-title` ⟶ סה"כ ~280 שורות CSS
הוחלפו ב-~150 של `.miller-*`. CSS leaner.

**ולידציה ב-preview:**
- ✓ עמודה אחת ב-root state (5 ממדי חיים)
- ✓ קליק על ממד → עמודה שנייה נוספת משמאל, ה-item הנבחר מסומן active
- ✓ קליק על תחום → עמודה שלישית נוספת, breadcrumb מתעדכן
- ✓ scroll horizontal עובד אם אין מקום לכל העמודות
- ✓ AI FAB עדיין נוכח

**גיבוי:** `prototypes/_versions/browse_36_213232.html`.

### 25 במאי 2026 — Freya (Phase C התחלה: rich cards ב-col 3 של browse)

**Trigger:** Yossi הצביע על אי-עקביות — "מדדים בשלב 3 צריכים להראות כמו תוצאות חיפוש".
זו בדיוק הנקודה של scalability + uniformity מהבריף.

**הקונספט:** ב-Miller cols, **cols 1-2 הן ניווט** (קטגוריות, פנימי) — נשארות קומפקטיות.
**col 3 היא תוכן** (leaves) — מקבלת treatment עשיר כמו ב-search-results.html. דומה
ל-Finder ש-col האחרונה מציגה preview עשיר.

**שינויים ב-`browse.html`:**

**CSS — `.miller-rich-card`** + helpers:
- `.miller-col--wide` modifier: `flex: 1; min-width: 360px` במקום `width: 280px`.
- `.miller-col--wide .miller-col-body` ברקע `--surface-2` (גוון אפור-בהיר) להבדל ויזואלי.
- `.miller-rich-card`: רקע לבן, border 1.5px, radius xl, padding 16/18px, gap 8px, hover עם
  border + shadow + translateY(-1px).
- `.miller-rich-card-top`: רצועת badges (type + domain).
- `.miller-badge-domain`: badge חדש עם CSS variable `--dc` לצבע דינמי לפי domain.
  משתמש ב-`color-mix(in srgb, var(--dc) 10%, #fff)` לרקע עדין-צבעוני.
- `.miller-rich-card-title`: 16px, weight 700, link.
- `.miller-rich-card-meta`: 2 icon-text pairs (clock=תדירות, users=גיל) — מפרק את `ind.meta`
  על " · " אוטומטית.
- `.miller-rich-card-footer`: open link בצד אחד, meta בצד השני.
- `.miller-rich-card-compare`: מוכן ב-CSS אבל לא מחובר ל-JS עדיין (חסר ID matching).

**JS — `indItem(ind, dom)`** מקבל גם את ה-`dom` להצגת domain badge בצבע התואם.
- `icon('clock')`, `icon('users')`, `icon('arrow-r')` — DOM-native SVG icons.
- ה-card כולו clickable (ניווט ל-`href`), עם `e.stopPropagation()` על links פנימיים.

**`buildColumn(eyebrow, title, items, opts)`** קיבל פרמטר `opts.wide` שמוסיף את הקלאס.

**Wireframe palette discovery:** ה-`--impact-bg: #1E293B; --impact-text: #FFFFFF` כבר הוגדר
ב-`:root` של browse.html. ה-badge "אימפקט" יוצא **slate כהה עם טקסט לבן** — לא bug,
זה ה-highlight pattern בפלטה חד-גונית. ה-CSS עם `var(--impact-bg, fallback)` משתמש בפלטה
הקיימת ולא ב-fallback הצבעוני שכתבתי.

**Trade-offs שנותרו:**
- **Compare button חסר**: ה-TREE לא כולל IDs שתואמים ל-`INDICATORS` של comparison.html.
  הוספה דורשת או הרחבת ה-TREE עם IDs, או fallback בעמוד ההשוואה. דחוף לעתיד.
- **Snippet + rationale חסרים**: ה-TREE לא כולל אותם. ה-card מציג רק type+domain+name+meta.
  Phase C מלא דורש extraction של INDICATOR_DATA dictionary משותף לכל המסכים.

**ולידציה ב-preview:**
- ✓ 3 columns: cols 1-2 קומפקטיות (280px כל אחת), col 3 wide (flex: 1)
- ✓ 5 rich cards בעמודה השמאלית, כל אחד עם type+domain badges, title, meta, "פתח כרטיס"
- ✓ Hover על card: border primary + shadow + לחיצה מעלה
- ✓ ה-link "פתח כרטיס מדד" מנווט ל-`indicator-card.html`
- ✓ AI FAB עדיין נוכח בשמאל-תחתון

**גיבוי:** `prototypes/_versions/browse_40_215156.html` (לפני rich cards).

### 25 במאי 2026 — Freya (Phase C השלמה: ICCard component + source breadcrumb)

**מטרה:** רכיב כרטיס מדד **אחד** בכל המסכים — אותו visual + אותו compare flow.
איחוד גם של ה-data: כל card משתמש באותה shape, אותו sessionStorage key, אותו DOM.

**נכס חדש: `assets/indicator-card.js` (~530 שורות, self-injecting)**

חשיפת `window.ICCard` API:
- `ICCard.render(ind, opts)` → DOM `<article class="ic-card">` עם badges, title, snippet,
  rationale, footer, ו-compare button (אם `ind.id` ו-`opts.showCompare !== false`).
- `ICCard.sourceBreadcrumb({ source, query, path, onEdit })` → DOM של breadcrumb
  שמראה איך המשתמש הגיע (search/ai/browse), עם כפתור "ערוך" שמחזיר למקור.
- `ICCard.compare.{ items, has, add, remove, toggle, clear, onChange, MAX }` — single
  source of truth ל-comparison state. sessionStorage key `comparison` (תואם לכל
  המסכים שכבר משתמשים בו).
- `ICCard.icon(name)` — DOM-native SVG icon factory (`clock`, `users`, `plus`, `check`,
  `arrow-r`, `arrow-l`, `sparkle`, `search`, `tree`, `file`).

**Data shape (graceful — שדות חסרים מדולגים):**
```js
{ id, name, type, typeLabel, domainLabel, domainColor,
  snippet, rationale, rationaleLabel,
  frequency, ageRange, source, programs, isNew, href }
```

**CSS injected (`.ic-card-*`):** rich card עם badges, title, snippet, rationale (עם
`border-inline-start: 3px solid primary`), footer עם meta (clock/users/file icons).
מצב `.in-comparison` עם רקע תכלת בהיר ו-border ב-primary. Source breadcrumb עם
icon strip + body + edit button.

**שילוב ב-3 מסכים:**

1. **browse.html**: `indItem(ind, dom)` ⟶ `ICCard.render(treeToCardData(ind, dom))`.
   adapter `treeToCardData()` ממיר את TREE shape (name/type/typeLabel/meta) ל-ICCard shape
   (frequency/ageRange נחתכים מ-meta על " · "). דורש טעינת `indicator-card.js` *לפני*
   ה-inline script (לכן `<script>` נוסף לפני ה-render שלי).

2. **ai-chat.html**: `<script src="assets/indicator-card.js?v=1">` נטען לפני
   `assets/ai-chat.js?v=4`. ב-`ai-chat.js`: `buildCard(it)` ⟶ thin wrapper סביב
   `ICCard.render(it)`. הוסרו `comparisonItems` global, `isInComparison`, `persistComparison`,
   `toggleCompare`, `removeFromCompare`. `clearComparison` ו-`openComparison` משתמשים
   ב-`ICCard.compare`. `renderTray()` קורא מ-`ICCard.compare.items()`. Subscription:
   `ICCard.compare.onChange(() => { renderCards(); renderTray(); })` — sync UI מלא.

3. **search-results.html**: רפקטור גדול. 6 ה-`<article class="result-card">` הקשיחים
   (314 שורות HTML) הוחלפו ב-array `SEARCH_INDICATORS` של 6 entries ובלולאה
   `SEARCH_INDICATORS.forEach(ind => list.appendChild(ICCard.render(ind)))`. שמרתי את
   ה-data attrs (`data-type`, `data-domain`, `data-stage`) ע"י הוספה אחרי render —
   ה-filter logic ממשיך לעבוד ב-`document.querySelectorAll('.ic-card')`. גם ה-compare
   logic הוחלף ב-ICCard.compare wiring.

**Source breadcrumb בפעולה ב-search-results:**
- `?source=search&q=...` (default): "תוצאות חיפוש" + 🔍 + הטקסט שחיפש
- `?source=ai&q=...`: "תשובה משיחת AI" + ✨ + השאלה
- `?source=browse&path=...`: "תוצאה מעיון בקטלוג" + 🌳 + נתיב, "חזרה לעיון"
- כפתור "ערוך" חוזר למקור (input, ai-chat, browse)

**Compare flow מאוחד (3-screen):**
1. בחירת מדד בכל מקום → `ICCard.compare.add(id, name)` → sessionStorage.
2. כל מסכים אחרים שמאזינים ל-`onChange` מתעדכנים אוטומטית (re-render cards + tray).
3. לחיצה על "השווה" בטריי → ניווט ל-`comparison.html` שכבר תומך ב-`comparison` key.
4. `comparison.html` יודעת לקרוא את כל ה-IDs (card-1..6 וגם bmi/activity/etc מ-ai-chat,
   ו-browse/dom-X/... מ-browse — fallback gracefully אם אין INDICATORS entry).

**מה לא הוטמע (Phase D candidate):**
- **comparison.html refactor** — עדיין משתמשת ב-INDICATORS dict פנימי. נדרש לאחד עם
  ICCard data model.
- **home.html chips** — לא נוגעו (לא מציגים כרטיסים).
- **filter sidebar refactor ב-search-results** — נשארה inline. עובדת עם ic-cards דרך data-attrs.

**ולידציה ב-preview:**
- ✓ `browse.html`: col 3 מציגה ic-cards עם compare button (5 cards לדומיין רווחה כלכלית)
- ✓ `ai-chat.html`: pane שמאל מציג 3 ic-cards זהים סגנון
- ✓ `search-results.html`: 6 ic-cards + source breadcrumb + filters
- ✓ `?source=ai&q=X` משנה את ה-breadcrumb ל-"תשובה משיחת AI"
- ✓ Compare ב-browse → רואים את הפריט גם ב-ai-chat tray ב-search-results tray
  (אותו sessionStorage key)

**גיבוי:** `prototypes/_versions/search-results_28_221358.html` (לפני refactor).

### 25 במאי 2026 — Freya (Phase C תיקוני באגים)

**Yossi דיווח על שני באגים:** (1) הכרטיסיות ב-search-results ובניווט browse לא זהות,
(2) "+ השווה" בעיון לא נראה עובד.

**תחקור:**
- בדיקת preview הראתה שלחיצה ב-browse **כן** מוסיפה ל-`ICCard.compare` (before=0, after=1).
- אבל ה-button class לא משתנה ל-`.added` ⟶ נראה כאילו "לא עובד".
- בנוסף, אין `#comparison-tray` ב-browse.html ⟶ אין משוב ויזואלי.
- בנושא הוויזואלי: `treeToCardData()` לא העביר `snippet` ו-`rationale` ⟶ הכרטיסים
  קצרים יותר מ-search-results.

**שלושה תיקונים:**

**1. Auto-sync ב-`indicator-card.js`** (`syncCardsToCompareState()`):
- אינטגרציה חדשה: subscription יחיד גלובלי שמאזין ל-`compare.onChange`.
- מאתר את כל ה-`[data-ic-id]` ב-DOM ומסנכרן את ה-state שלהם: `.in-comparison` class
  על ה-article, ה-`.added` class על הכפתור, רישום ה-icon (`plus` ↔ `check`), ה-text
  ("השווה" ↔ "נוסף"), ו-aria-label.
- עובד **בכל המסכים** בלי שצריך כל מסך לרשום subscriber משלו.

**2. Auto-injected comparison tray ב-ICCard:**
- `ensureTray()` בודק האם יש כבר `#comparison-tray` (קיים ב-search-results ו-ai-chat).
- אם לא — מזריק `<div id="ic-tray">` חדש (CSS נפרד: `.ic-tray-*`).
- ה-tray sticky למטה, חולק את אותו slate-dark כמו ה-tray הקיים.
- `renderInjectedTray()` מעדכן את ה-DOM לפי `compare.items()` בכל change.
- **תוצאה ב-browse**: tray מופיע אוטומטית כשמשתמש מוסיף מדד ראשון.

**3. Generic snippet+rationale generators ב-`browse.html`**:
- `genericSnippet(ind, dom)`: בונה משפט פתיחה מהשם + type + domain.
  "X — מדד תוצאה בתחום 'Y'. מאפשר מעקב לאורך זמן..."
- `genericRationale(ind)`: dictionary לפי `type`:
  - outcome → "מתמקדים בשינוי שיוצרת התכנית..."
  - output → "מודדים מה התכנית מספקת בפועל..."
  - impact → "מעריכים השפעה מערכתית ארוכת-טווח..."
  - input → "מודדים תשומות שהושקעו..."
- `treeToCardData()` משתמש ב-`ind.snippet || genericSnippet(ind, dom)` —
  גמיש, יקבל override אם נוסיף שדה ספציפי בעתיד.

**4. ID matching בין browse TREE ל-SEARCH_INDICATORS:**
- 5 TREE indicators קיבלו `id: 'card-N'` מפורש (במקום ה-slug האוטומטי).
- מתאימים ל-`card-1`..`card-6` ב-SEARCH_INDICATORS:
  - "מדד עוני ילדים ונוער" → `card-1`
  - "שיעור נשירה מהמערכת החינוכית" → `card-2`
  - "תחושת שייכות חברתית" → `card-3`
  - "מדד חוסן משפחתי" → `card-4`
  - "שיעור תעסוקת בני נוער" → `card-5`
  - "ניידות כלכלית בין-דורית" → `card-6`
- **תוצאה**: לחיצה ב-browse → המדד מסומן active גם ב-search-results וב-ai-chat.

**ולידציה ב-preview (4-screen flow):**
- ✓ browse: לחיצה על "+ השווה" → tray מופיע, כפתור הופך ל-"נוסף ✓", רקע אקטיב על card.
- ✓ ניווט ל-search-results: ה-card המתאים (card-1) מסומן active, ה-tray הקיים מציג את הפריט.
- ✓ ניווט ל-ai-chat: אותו פריט מסומן active (אם הופיע בכרטיסים), ה-tray הקיים מציג.
- ✓ Cards visually identical: ב-browse יש עכשיו snippet + rationale + footer כמו ב-search-results.

### 25 במאי 2026 — Freya (Phase D התחלה: browse 3-panel unified layout)

**רקע:** Yossi ציין שאין למעשה הבדל בין search-results ל-browse. ביקש redesign של Miller cols:
- Right panel = step list (Miller-lite, רמה אחת בכל פעם)
- Click ממד → step 2 + breadcrumb למעלה (עם Back button מימין)
- Click תחום → highlighted בpanel הימני + center פותח cards + left panel filters
- "2 פאנלים בצדדים והמדדים במרכז"

**Layout חדש ב-`browse.html`:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                           │
├─────────────────────────────────────────────────────────────────┤
│ [← חזרה]    כל הממדים ‹ ביטחון כלכלי ‹ רווחה כלכלית              │
├──────────┬──────────────────────────────────────────┬───────────┤
│ RIGHT    │  CENTER                                    │ LEFT      │
│ Panel    │  Cards (rich, ICCard.render)              │ Filters   │
│          │                                            │ (hidden   │
│ שלב 2:   │  נמצאו 5 מדדים בתחום "רווחה כלכלית"        │  until    │
│ תחומים   │                                            │  step 3)  │
│ ──────   │  ┌────────────────────────────────────┐   │           │
│ ● רווחה  │  │ [badges] title  [+השווה]           │   │ סוג מדד   │
│  כלכלית  │  │ snippet                             │   │ תדירות    │
│   active │  │ rationale                           │   │           │
│ ● ביטחון │  │ footer                              │   │           │
│   תעסוקתי│  └────────────────────────────────────┘   │           │
└──────────┴──────────────────────────────────────────┴───────────┘
```

**CSS שינויים מרכזיים:**
- מחיקה: כל ה-`.miller-cols`, `.miller-col`, `.miller-col-header`, `.miller-col-body`,
  `.miller-item`, `.miller-rich-card`, `.miller-badge` וגזרות (~290 שורות).
- חדש: `.browse-layout` + `.browse-bc` (breadcrumb) + `.browse-grid` עם `data-step`
  attribute שמשנה את ה-`grid-template-columns` דינמית:
  - step 1, 2: `320px 1fr` (right panel + center welcome/cards)
  - step 3: `320px 1fr 280px` (+ left filters)
- חדש: `.right-panel`, `.right-panel-header`, `.right-panel-body`, `.rp-item` (compact
  list items עם dim icon / dom dot, name+meta, count, chevron).
- חדש: `.center-welcome` (placeholder state כשאין תחום נבחר).
- חדש: `.left-panel` + `.filter-panel` + `.filter-group` + `.filter-item` (filter sidebar
  copied from search-results, simplified — type + frequency).

**JS שינויים מרכזיים:**
- `STATE.path: []` נשמר (אותו מודל פנימי, עכשיו עם render אחר).
- חדש: `renderRightPanel(hasDim)` — מציג ממדים או תחומים לפי state.
- חדש: `renderBreadcrumb(hasDim)` — מציג trail עם back+links או מסתיר.
- חדש: `renderCenter(hasDom)` — welcome state או cards via `ICCard.render`.
- חדש: `renderLeftFilters(hasDom)` — toggle visibility.
- חדש: `applyFilter(dim, value, cb)` + `applyFiltersToCards()` + `clearAllFilters()` —
  filter state לפי checkbox.
- חדש: `freqBucket(freqStr)` ממפה "שנתי" / "חצי-שנתי" / "רב-שנתי" ל-3 buckets לסינון.
- ה-cards מקבלים `data-type` ו-`data-frequency` ב-render כדי שה-filters יוכלו להסתיר/להציג.

**Transitions שאומתו:**
- ✓ **Step 1** (root): רק right panel + center welcome.
- ✓ **Step 2** (לחיצה על ממד): breadcrumb מופיע למעלה עם Back + dim name. Right panel
  מעבר לתחומים. Center welcome מתעדכן ל"בחרו תחום".
- ✓ **Step 3** (לחיצה על תחום): התחום מסומן active ב-right panel. Center fills עם
  rich cards (count + ICCard.render). Left panel מופיע עם filters. Breadcrumb מציג
  3 רמות: כל הממדים ‹ dim ‹ dom.
- ✓ ICCard.render בקרטיסים: badges + title + snippet + rationale + footer + compare button.
- ✓ Compare button עובד (ICCard.compare.toggle), ה-card מסומן in-comparison, tray
  הגלובלי מציג.

**גיבוי:** `prototypes/_versions/browse_54_224552.html` (לפני 3-panel refactor).

### 25 במאי 2026 — Freya (Phase D — שיפורי iteration ל-browse 3-panel)

**Yossi דיווח על 2 תיקונים:**
1. "ה-Breadcrums וה-Back חייבים לשבת באותה כרטיסייה של השלבים והתחומים. כרגע זה למעלה
   וזה לא ברור."
2. "כשאני בשלב 2 - תראה לי כבר בצד שמאל את כל המדדים. כלומר יש 'הכל'."

**שינוי 1: Breadcrumb נכנס לתוך ה-right panel**

- מחיקה: `.browse-bc` (פס breadcrumb עליון נפרד) — CSS + HTML הוסרו.
- חדש: `.right-panel-bc` בתוך ה-`.right-panel` כ-section ראשון לפני ה-header.
  Layout: `justify-content: space-between` עם **back button** ב-inline-start (right ב-RTL)
  ו-**current location label** בקצה השני.
- ב-CSS: `border-block-end` בין ה-breadcrumb לבין ה-header של ה-step list — נוצר מבנה
  חזותי ברור: breadcrumb → title → list, הכל בכרטיס אחד.
- ב-JS: `renderInPanelBreadcrumb(hasDim)` (היה `renderBreadcrumb`) מציג רק את שם ה-dim
  (השמת ה-dom נראית ב-active state של ה-list בלאו הכי).

**שינוי 2: "הכל" view ב-step 2 — כל המדדים של הממד**

- חדש: `rpAllItem(dim)` — פריט "הכל" בראש רשימת התחומים. אקטיבי כש-`!STATE.path[1]`.
  Count = `dim.domains.reduce((s,d) => s + d.indicators.length, 0)`.
- חדש: `selectAllDoms()` — clears `STATE.path[1]` (keeps dim). ה-render מציב את ה"הכל"
  כ-active.
- `renderCenter(hasDim, hasDom)` — שני שינויים:
  - אם `hasDim && !hasDom`: מציג את כל המדדים מכל ה-domains של ה-dim (flatMap).
    Count label: "מדדים בממד 'X' (כל התחומים)".
  - אם `hasDim && hasDom`: מציג רק את ה-dom הספציפי. Count label: "מדדים בתחום 'Y'".
- `data-step="2"` עכשיו משתמש ב-3-column grid (כמו step 3). שני המצבים זהים visually,
  ההבדל רק בתוכן הכרטיסים והפריט שמסומן active.
- `renderLeftFilters(hasDim)`: ה-filters נראים מ-step 2 ואילך (כי יש כרטיסים לסנן).

**Flow המעודכן:**
- **Step 1** (root, no dim): right panel עם ממדים, center welcome, אין left filters.
- **Step 2** (dim picked, "הכל"): right panel עם תחומים + "הכל" active + breadcrumb,
  center עם ALL מדדים, left filters visible.
- **Step 3** (dim + dom picked): right panel עם תחומים + dom active + breadcrumb,
  center עם dom-specific cards, left filters visible.

**ולידציה ב-preview:**
- ✓ Step 1: רק right panel + welcome. אין breadcrumb, אין filters.
- ✓ Step 2 (קליק על ממד): breadcrumb בתוך panel, "הכל" אקטיבי, 8 cards (כל התחומים),
  filters משמאל.
- ✓ Step 3 (קליק על תחום): "הכל" יוצא מ-active, התחום שנבחר נכנס ל-active, ה-center
  מציג רק 5 cards של אותו תחום.
- ✓ "Back" ב-breadcrumb → חזרה ל-step 1 (clear path).

### 25 במאי 2026 — Freya (Phase D iteration 3: consistency polish)

**5 שינויים מתוזמרים מהבריף של Yossi:**

**1. הסרת SubHeader מ-node-chart.html.** הייתה inconsistency — רק node-chart הציג
   `<header class="page-header">` עם title + subtitle + breadcrumb. הוסר.
   `<nav id="breadcrumb" hidden>` נשאר כ-shell ל-JS שעדיין מתייחס אליו (path state).

**2. Right-panel-header structure stays IDENTICAL across steps.** המבנה התקני נשמר
   (eyebrow קטן + title גדול), רק התוכן משתנה. ב-step 2 נוסף **Back button** בצד
   ה-eyebrow.
   - Step 1: eyebrow = "שלב 1", title = "ממדי חיים", Back hidden.
   - Step 2+: eyebrow = "מדד חיים" (label), title = שם הממד (למשל "ביטחון כלכלי"),
     Back visible.
   - Internal layout: `.right-panel-header-top` עם `justify-content: space-between` —
     eyebrow ב-inline-start, Back button ב-inline-end. שורת ה-title נשארת מתחת.
   - הוסר: `.right-panel-bc` ה-floating (היה pre-step header נפרד).

**3. Count line "נמצאו N מדדים" הוזז מעל ה-3 פאנלים.** עכשיו `.browse-count` יושב
   כאלמנט עצמאי מעל ה-`.browse-grid`. כל 3 הפאנלים מתחילים ב-Y אחיד. מוסתר ב-step 1.

**4. Empty state ללא frame.** ה-`.center-welcome` היה עם `border: 2px dashed`. הוסר.
   עכשיו: רקע שקוף, אייקון + טקסט על הרקע האפור של הדף, מרכוז אנכי (`display: flex;
   flex-direction: column; align-items: center; justify-content: center;
   min-height: 360px`).

**5. Filter panel alignment עם search-results.** עדכון `.browse-layout` להתאים
   ל-`.search-layout` ב-search-results:
   - `max-width: 1440px` → `1280px`
   - `padding-inline: 24px` → `32px`
   - `padding-block: 20px 48px` → `28px`
   - `.browse-grid gap: 18px` → `28px`
   - left panel width: `280px` → `264px`
   - sticky offset: 84px (גם ב-search-results, היה 77px → unified).
   
   **תוצאת ולידציה:** ב-1400px viewport — filter panel ב-X=92px, width=264px בשני
   המסכים. מיקום אופקי **זהה לחלוטין**.

**גיבוי:** הקבצים שעודכנו `browse.html`, `search-results.html`, `node-chart.html`.

---

## מסכים לעיצוב (Phase D)

| # | מסך | קובץ | סטטוס | תרחישים |
|---|-----|------|-------|---------|
| 1 | דף הבית | `home.html` | ✓ | כולם |
| 2 | תוצאות חיפוש | `search-results.html` | ✓ | מיכל |
| 3 | כרטיס מדד | `indicator-card.html` | ✓ | כולם |
| 4 | תצוגת השוואה | `comparison.html` | ✓ | מיכל |
| 5 | עיון (drill-down) | `browse.html` | ✓ | גלעד · רחל |
| 6 | Node Chart | `node-chart.html` | ✓ | גלעד |
| 7 | שיחת AI דו-pane | `ai-chat.html` | ✓ | כולם (חדש) |
| 8 | עץ ניווט — ממד | — | ○ | גלעד (עדיפות נמוכה) |

---

## שאלות פתוחות

- השוואה מדף תוצאות: האם המגש נפתח כבר שם, או רק מתוך כרטיס?
- תצוגת מפה בתוצאות: toggle בין רשימה ל-Node Chart מסונן?
- מגש השוואה: כמה מדדים במקביל?
