# CLAUDE.md — קטלוג מדדים חברתיים (הג'וינט)

## מה זה

קטלוג מדדים חברתיים — כלי חשיבה (Guided Thinking Tool) לבחירת מדדים חברתיים,
לא מאגר נתונים. שייך לארגון **הג'וינט** (אין להשתמש במונח "DIDA" — הוסר במכוון).
שלב נוכחי: **D — פרוטוטיפים אינטראקטיביים** (HTML/CSS/JS, RTL עברית).

עבודה בעברית. פלט מובנה לקריאה נוחה ב-RTL.

## מבנה

```
A-Product-Brief/   B-Trigger-Map/   C-UX-Scenarios/   D-UX-Design/
_progress/00-design-log.md   ← רשומת המשכיות קנונית (קרא בתחילת סשן)
summary.md         ← session log אחרון (לסיכום שינויים גדולים)
info /             ← מקורות (מצגת מתודולוגיה, סיכומי פגישות, בנק מדדים)
```

## הפרוטוטיפים — `D-UX-Design/prototypes/`

7 מסכים: `home` · `search-results` · `browse` · `indicator-card` · `comparison` · `node-chart` · `ai-chat`

### Shared assets
- `assets/joint-logo.svg` — canonical logo source. **לוגו inlined ב-HTML** של 7 הקבצים (תאימות Claude preview).
- `assets/ai-fab.js` — **AI FAB גלובלי**, self-injecting. נטען ב-6 קבצים פרט ל-ai-chat. FAB ב-`inset-inline-end: 24px` (שמאל ב-RTL). פאנל 420px → `body.ai-panel-open { padding-inline-end: 420px }`. History ב-localStorage `ai-fab-history`. Context ב-`window.AI_PAGE_CONTEXT`.
- `assets/ai-chat.js` — לוגיקת הצ'אט (XSS-safe, DOM API בלבד).
- `assets/indicator-card.js` — **רכיב משותף** לרינדור כרטיסי מדד עם תגיות סמנטיות. ICCard.render(ind) → DOM. תומך ב-tags row (קורא מ-`window.TAG_LOOKUP`).
- `assets/tag-bar.js` (`v=2`) — **רכיב משותף** של Notion-style category pills + vertical dropdown. `TagBar.mount(container, {registry, isSelected, onToggle})`. Self-injecting CSS. 800ms idle-close.
- `assets/search-sync.js` (`v=1`) — **שומר על ערך החיפוש (`?q=`) בכל שדות החיפוש בעמוד**. נטען ב-7 הקבצים. מסנכרן `.nav-search-input`, `#search-input`, `#searchTopInput`. רק ממלא שדות ריקים ולא דורס ערך שהמשתמש מקליד (race-safe). מאזין ל-popstate.
- `_versions/{שם}_{מספר-רץ}_{HHMMSS}.html` — מוסכמת גיבוי. **גבה לפני שינוי גדול.**

## כללי עקביות (חובה לשמר)

### Global nav
סדר ימין→שמאל ב-RTL:
**לוגו+טקסט** (ימין) · **תפריט: בית · עיון · אודות** · **שדה חיפוש** (קצה שמאל בלבד ב-5 הקבצים שאינם זרימת חיפוש).
- שדה החיפוש: `<form action="search-results.html" method="get">` עם `<input name="q">`. Enter → ניווט אוטומטי ל-`search-results.html?q=<value>`
- אקטיבי = `aria-current="page"` + קו תחתון
- שדה החיפוש נדחף ל-inline-end ע"י `margin-inline-start: auto`
- **שדה החיפוש בנאב מוסר ב-`search-results.html` וב-`node-chart.html`** — שם השדה הגדול ב-`.search-header` הוא שדה הקלט היחיד בעמוד (מניעת שדות חיפוש מתחרים)

### Search-header (search-results.html + node-chart.html) — זהה בדיוק
מבנה:
```
[חזרה][search-field][View Toggle: כרטיסיות | מפה סמנטית]
```
- Search field זהה (אותו placeholder, אותו רוחב 640px)
- View toggle `inline-grid 1fr 1fr` → שני כפתורים זהים ברוחב (126px)
- `margin-inline-start: auto` על ה-toggle → דבוק לקצה inline-end
- ה-toggle תמיד גלוי בעמודי תוצאות — גם כשמגיעים מ-browse. המפה היא תצוגה אלטרנטיבית של אותן תוצאות.

### App-shell layout (search-results + node-chart)
```css
html, body { height: 100%; margin: 0 }
body { display: flex; flex-direction: column; overflow: hidden }
.global-nav, .search-header { flex-shrink: 0 }
.search-layout / .main-layout { flex: 1; min-height: 0 }
.cards-col, .filter-col { overflow-y: auto }  /* internal scroll only */
```
**אין page-level scroll.** Header sticky, גלילה רק בתוך cards/filter.

### Layout sides (RTL)
- **Filter ב-inline-start (ימין)** — שומר על inline-end (שמאל) פנוי ל-AI panel הגלובלי
- **AI FAB ב-inline-end (שמאל)** — לא מתנגש עם פילטר
- **Tag bar / view-toggle** — בתוך grid column של cards (לא משתרעים על filter)

### פלטה Wireframe
`--primary: #334155` (slate). כל הצבעים הסמנטיים → גווני slate.
**חריג:** המפה הסמנטית (graph `node-chart`) + המקרא **נשארים צבעוניים** — הצבע חיוני סמנטית שם.

### 3 מסלולי גילוי שווי-ערך (איחוד חדש)
1. **חיפוש** (nav search bar → search-results) → cards view = default
2. **עיון** (browse.html) → hub overview עם hover-reveal של sub-domains
3. **AI** (FAB גלובלי) → פאנל שיחה

**שיווי-ערך:** AI דומיננטי ויזואלית אבל לא יחידי. עיון ומפה לא פחות חשובים.
**Map = view על תוצאות חיפוש** — אין מסך התחלה נפרד למפה. הערך שחיפשת = המרכז.

### AI בפרוטוטיפ
שלד ויזואלי + שיחה **מודמה** (hardcoded), לא AI אמיתי.

## URL params — convention

| Param | Meaning | Used by |
|-------|---------|---------|
| `?q=<text>` | טקסט חיפוש | nav search, search-results, node-chart |
| `?node=<id>` | מרכוז על צומת ספציפי | node-chart, search-results (round-trip) |
| `?from=browse` | הגעה מזרימת עיון | search-results (legacy — לא משפיע כיום על UI; ה-toggle תמיד גלוי) |

## browse.html — מבנה חדש (Hover-Reveal Hub)

### Root view (level 0)
- `grid-template-columns: repeat(3, 1fr)` → 5 ממדי חיים בפריסה 3+2
- **כל קובייה היא `<div>` (לא `<button>`)** עם שתי שכבות:
  - **Default**: icon גדול + שם 19px + desc + count
  - **Hover** (cross-fade .22s): icon + שם 19px בשורה אחת + תגיות sub-domain לחיצות
- **קליק על תגית sub-domain** → `search-results.html?q=<name>&from=browse`
- **לא יש drill מ-root** — ה-hover חושף את ה-sub-domains ישירות

### Level 2 (אם הגיעו בכל זאת)
- Grid של תת-תחומים → לחיצה → leaf
- Breadcrumbs: `בית › <dim>`

### Leaf view (indicators)
- TagBar עם 32 תגיות בקבוצות (`ages, geo, population, themes, status`)
- Filter panel ב-inline-start: סוג מדד · תדירות · שלב בתכנית · כלי מדידה
- Toolbar עם count (start) + sort (end)
- ICCard render לכל מדד (כולל tags row)

### Drill-nav (always top)
- "בית" → root
- שם ממד → level 2 (clickable)
- שם תת-תחום → current (not clickable)

## search-results.html

### Grid layout
```css
grid-template-columns: 264px 1fr;
grid-template-rows: auto auto 1fr;
grid-template-areas:
  "filter   tagbar"
  "filter   toolbar"
  "filter   cards";
```

### Filter groups
1. סוג מדד (תוצאה/תפוקה/אימפקט/תשומה)
2. תדירות (שנתי/חצי-שנתי/רב-שנתי)
3. שלב בתכנית (תכנון/יישום/הערכה)
4. תחום חיים (welfare/edu/social/resilience/employ)
5. כלי מדידה (נתוני מינהל/שאלון/ביטוח לאומי)

### View toggle (cards = active)
שיכפול מ-node-chart, רק active state שונה.

## node-chart.html

### Search-first
- Search-header **תמיד גלוי** (לא רק כשיש תוצאות)
- Empty state = hint קטן בלבד ("חפשו... למעלה")
- `?q=<text>` → **תמיד מציג את גרף תוצאות החיפוש** (6 מדדי תוצאה + תחומי-אב) ממורכז ב-best-match. המפה היא תצוגה אחרת של אותן תוצאות שמופיעות ב-search-results.html.
- `?node=<id>` → round-trip:
  - `i.*` (health-tree) → `centerOnSearchResult` על ה-tree
  - `r.*` (result indicator) → `showSearchResultsGraph()` + `centerNode` + `selectNode` עליו

### שני מודלי נתונים מאוחדים תחת DATA אחד
- **Health-tree** (קבוע): `health → topics → outcomes → indicators (i.*) → methods` — מאחורי הפלואו של עיון.
- **Search-results** (מוזרק בעת הצורך): 6 מדדי תוצאה (`r.card-1..6`) מקושרים ל-5 תחומי-אב (welfare/edu/social/resilience/employ). מועתק מ-`SEARCH_INDICATORS` של search-results.html — שיכפול מכוון, כמו TAGS_REGISTRY.
- `injectSearchResultsIntoData()` חד-פעמי (`searchResultsInjected` flag). שימוש חוזר ב-domain nodes קיימים → רק מפעיל אותם (active=true). `social` הוא היחיד שנוסף חדש.

### DATA structure (D3 force graph)
```
nodes: [{ id, label, type, parent?, desc?, counts?, active? }]
links: [{ source, target, type: 'hierarchical' | 'complementary' | 'alternative' }]
types: domain · topic · outcome · indicator · method
id prefixes: i.* (health-tree indicators) · r.* (result indicators) · o.* (outcomes) · t.* (topics) · m.* (methods)
```

## היררכיית הנתונים (לפי המתודולוגיה הרשמית)

```
תחום חיים → נושא/תת-תחום → תוצאה (Outcome) → מדד → מתודולוגיה
בריאות      קידום בריאות    תזונה             BMI    EAT-26
```

MVP מודגם דרך תחום "בריאות" → "קידום בריאות". מדד = כלי/ראיה, לא אמת/מטרה.
הקטלוג פתוח לכל ארגון — לא ממוקד JDC ("היכן המדד נמצא בשימוש", לא "תכניות JDC").

## TAGS_REGISTRY — 32 תגיות סמנטיות (5 קבוצות)

```js
{
  ages:      { iconKey:'users',     tags: [children, youth, young-adults, adults, seniors] },
  geo:       { iconKey:'map-pin',   tags: [north, south, center, jerusalem, periphery, mixed-cities] },
  population:{ iconKey:'community', tags: [olim, arab, haredi, bedouin, ethiopian, fsu, disability, lgbtq] },
  themes:    { iconKey:'target',    tags: [poverty, resilience, belonging, violence, dropout, gender, digital, mobility, climate] },
  status:    { iconKey:'shield',    tags: [single-parent, at-risk-women, at-risk-children, homeless] }
}
```

קיים ב-`browse.html` ו-`search-results.html` (כפילות — לעתיד אפשר להוציא ל-shared file).
`window.TAG_LOOKUP` (flat) — לכל id → `{ label, groupKey }`. נקרא ע"י ICCard.

## פרסונות (Trigger Map)

מיכל המנהלת (ראשית) · גלעד המדידן (שנייה) · רחל החוקרת (שלישית).

## הרגלי עבודה

- שינוי גדול בפרוטוטיפ → קודם גבה ל-`_versions/` (מספר רץ הבא + חותמת שעה).
- כל שינוי **nav / header / search field** → החל זהה ב-7 הקבצים (script batch).
- כל שינוי ב-`assets/tag-bar.js` → במפ את ה-cache-buster `?v=N+1` ב-browse.html + search-results.html.
- עדכן `_progress/00-design-log.md` בסוף סשן (אם יש שינוי משמעותי).
- תוכניות עבודה: `~/.claude/plans/`.
- `summary.md` נשמר אחרי סשנים גדולים עם narrative של מה השתנה.

## דפוסי קוד שנקבעו

### CSS
- **Logical properties** (`inset-inline-start/end`, `margin-block-end`) — RTL-friendly
- **`min-height: 0`** על flex/grid children שצריכים `overflow: auto`
- **`inline-grid 1fr 1fr`** ל-equal-width segmented controls
- **`margin-inline-start: auto`** ל-end-anchoring ב-flex
- **`[hidden] { display: none }`** override כש-`display` מוגדר ב-CSS

### HTML
- **`<button>` אסור** להכיל `<a>` → השתמש ב-`<div role="group">` כשצריך children אינטראקטיביים
- **Forms שמנווטים**: `<form action="...html" method="get"><input name="q"></form>` — Enter מנווט אוטומטית

### JS
- **DOM-API rendering (no innerHTML)** — XSS-safe pattern
- **URL params כ-state** — shareable, refresh-resilient
- **Self-injecting components** — ICCard, TagBar
- **Cache-buster `?v=N`** על assets שמתעדכנים
