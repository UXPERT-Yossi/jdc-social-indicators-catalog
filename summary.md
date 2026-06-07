# Session Summary — JDC Indicators Catalog Prototype

**תקופה:** סשן ארוך של איטרציות עיצוב על שלב D (פרוטוטיפים אינטראקטיביים).
**תוצר:** רה-ארכיטקטורה של זרימת ה"עיון" + איחוד "חיפוש" ו"מפה סמנטית" + הפרדת התיוג הסמנטי + השוואת UI בין מסכים.

---

## 1. שיפורי ארכיטקטורה רוחביים

### 1a. Tag-taxonomy סמנטי (32 תגיות, 5 קבוצות)
מבנה חדש ב-`browse.html` ו-`search-results.html`:
```
ages: ילדים · בני נוער · צעירים · מבוגרים · גיל הזהב
geo: צפון · דרום · מרכז · ירושלים · פריפריה · ערים מעורבות
population: עולים · ערבים · חרדים · בדואים · אתיופים · יוצאי בריה"מ · אנשים עם מוגבלות · להט"ב
themes: עוני · חוסן · שייכות · אלימות · נשירה · מגדר · דיגיטל · ניידות חברתית · אקלים
status: חד-הוריות · נשים בסיכון · ילדים בסיכון · חסרי בית
```
כל מדד מתויג בכ-5-6 תגיות (אחריות הג'וינט עתידית להעמיק).

### 1b. רכיב משותף חדש: `assets/tag-bar.js`
Notion-style category pills + vertical dropdown. API:
```js
window.TagBar.mount(container, {
  registry: TAGS_REGISTRY,
  isSelected: (id) => boolean,
  onToggle:  (id, willSelect) => void
});
```
- **Self-injecting CSS** (`#tag-bar-styles`)
- **Dropdown vertical** עם chips אנכיים + checkmark
- **800ms idle-close** auto-timer
- **Esc / click-outside** → סגירה מיידית
- **Cache-buster:** `?v=2`
**Mounted ב:** `browse.html` (leaf view) + `search-results.html`

### 1c. עדכון `assets/indicator-card.js`
- נוסף `tagsRow` שמוצג בכל כרטיס ב-`<div class="ic-card-tags">`
- מאוכלס מ-`ind.tags` array + מתורגם ע"י `window.TAG_LOOKUP`
- Fallback: אם אין lookup, מציג את ה-id

### 1d. App-shell layout (`search-results.html` + `node-chart.html`)
```css
html, body { height: 100%; margin: 0; }
body { display: flex; flex-direction: column; overflow: hidden; }
.global-nav, .search-header { flex-shrink: 0; }
.search-layout { flex: 1; min-height: 0; }
.cards-col { min-height: 0; overflow-y: auto; }
```
**תוצאה:** אין page-level scroll. רק `.cards-col` (ו-`.filter-col` במידת הצורך) גוללים פנימית.

---

## 2. browse.html — רה-ארכיטקטורה מלאה של הזרימה

### 2a. Hub Overview Page (root level)
- **3 עמודות grid** עם 5 ממדי חיים → פריסה 3+2 (`repeat(3, 1fr)`)
- **Hover-reveal pattern על כל קובייה:**
  - Default: icon גדול + שם 19px + desc + count
  - Hover: icon + שם 19px (אותו גודל!) בשורה אחת + תגיות sub-domains
  - **`<button>` הוחלף ל-`<div>`** (כדי לאפשר `<a>` ילדים)
  - Cross-fade בין `.cube-default` ל-`.cube-hover` (opacity transition .22s)
  - `:focus-within` תומך ב-keyboard a11y
- **תגיות sub-domain לחיצות**: ` href="search-results.html?q=<name>&from=browse"`
- **`?from=browse`** → search-results מסתיר את ה-view-toggle (זרימת עיון לא דורשת מפה)

### 2b. Drill-down משני (level 2)
- אם המשתמש בכל זאת נכנס לדים → grid של תת-תחומים (2-3 cubes)
- breadcrumbs: `בית › <dim>` (current)

### 2c. Leaf view (indicators)
- **רשימת כרטיסים בסגנון search-results** + פאנל סינון
- **Drill-nav top:** `[חזרה][crumbs]`
  - "בית" = root (level 0)
  - שם ממד = clickable → level 2
  - שם תת-תחום = current (לא לחיץ)
- **TagBar** מעל ה-toolbar
- **Layout:** filter בצד ימין (RTL inline-start), cards בצד שמאל

### 2d. נתונים מועשרים ב-TREE
לכל מדד נוספו שדות:
- `frequency` (שנתי / חצי-שנתי / רב-שנתי / רבעוני / חמש-שנתי)
- `ageRange` (e.g., '12-18', '18+')
- `stage` ('evaluation' / 'implementation' / 'planning')
- `source` ('admin' / 'survey' / 'social-security')
- `tags` (array of tag ids)

### 2e. סינון מורחב
פאנל הסינון מכיל 4 קבוצות:
1. סוג מדד (תוצאה/תפוקה/אימפקט/תשומה)
2. תדירות
3. שלב בתכנית (תכנון/יישום/הערכה)
4. כלי מדידה (נתוני מינהל/שאלון/ביטוח לאומי)

(תגיות סמנטיות הועברו ל-TagBar בנפרד.)

---

## 3. search-results.html — איחוד עם node-chart

### 3a. App-shell + Sticky Header
- Body flex column, ללא scroll body
- `.search-header` sticky עליון: [חזרה][search field][View Toggle]

### 3b. Top Toolbar Row — זהה ל-node-chart
```html
<div class="search-header-inner">
  <a class="back-btn">חזרה</a>
  <div class="search-field-wrap">
    <span class="search-field-icon">🔍</span>
    <input class="search-field" name="q" placeholder="...">
  </div>
  <div class="view-toggle">  <!-- inline-grid 1fr 1fr, equal-width buttons -->
    <button class="active">כרטיסיות</button>
    <a href="node-chart.html?q=...">מפה סמנטית</a>
  </div>
</div>
```
- **View toggle**: `display: inline-grid; grid-template-columns: 1fr 1fr` → שני כפתורים זהים ברוחב (126px)
- **`margin-inline-start: auto`** על ה-toggle → דבוק לקצה inline-end (שמאל ב-RTL)
- **Hidden when `?from=browse`** (`.view-toggle[hidden] { display: none }`)

### 3c. Grid Layout (`.search-layout`)
```css
grid-template-columns: 264px 1fr;
grid-template-areas:
  "filter   tagbar"
  "filter   toolbar"
  "filter   cards";
grid-template-rows: auto auto 1fr;
row-gap: 16px;
```
- **Filter** ב-`inline-start` (ימין ב-RTL) — מותיר את inline-end (שמאל) ל-AI panel
- **Tag-bar** ב-cards column בלבד (לא משתרע על filter)
- **Toolbar** עם count בקצה-start (ימין) + sort בקצה-end (שמאל) דרך `margin-inline-start: auto`

### 3d. סנכרון search input מ-URL
- IIFE שקוראת `?q=` ומציבה ב-`#search-input.value` ב-load
- `doSearch()` מנווט ל-`search-results.html?q=<new>` (ומוחק `?node=`)

### 3e. Tag pills פילטר אקטיבי
ה-bar "פילטרים פעילים" **נמחק** — count badges על pills + checkboxes פתוחים בפאנל מספיקים כסיגנל.

---

## 4. node-chart.html — Search-first + מאוחד

### 4a. הסרת ה-search-empty card הגדול
- ה-`<div class="empty-state">` עכשיו מכיל רק `<div class="empty-state-hint">` קטן ("חפשו... בראש העמוד")
- הוסרו ~70 שורות CSS של `.search-empty-*`

### 4b. Search Header תמיד גלוי
- `header.hidden = false` תמיד (לא רק כשיש תוצאות)
- מבנה זהה ל-search-results

### 4c. Deep-link מ-`?q=` + `?node=`
```js
?node=<id> → centerOnSearchResult(matching node)
?q=<text> → searchNodes(text) → centerOnSearchResult(best match)
```
**round-trip:** search-results מעביר `?q=...&node=<id>` למפה כשיש center → המפה ממרכזת באותו צומת.

### 4d. רשת קיימת
DATA.nodes (D3 force graph) עם domains, topics, outcomes, indicators, methods.
`centerOnSearchResult(node)`: פינ ל-`width/2, height/2` + הוספת direct neighbors → render.

---

## 5. indicator-card.html — Cross-link

### 5a. נמחק: AI Ask Card
ה-`section.ai-ask-card` הוסר (HTML + CSS + JS). AI FAB גלובלי הוא נקודת כניסה יחידה.

### 5b. נוסף: "הצג במפה הסמנטית"
- כפתור בקצה inline-end של ה-breadcrumb
- `href="node-chart.html?node=i.bmi"` (לפרוטוטיפ — node id קבוע)
- בעתיד, כל indicator-card ידע את ה-id שלו ויקודד אותו

---

## 6. Cross-screen unification

### 6a. שם ה-tab משתנה
"מפה סמנטית" → **"חיפוש"** ב-nav של 7 הקבצים (sed batch). מאוחר יותר הוסר לחלוטין → השדה במאסטר nav מחליף.

### 6b. שדה החיפוש בהדר
- היה: הוסר → חזר עם action="search-results.html"
- 7 הקבצים: `<form class="nav-search" action="search-results.html" method="get">` עם `<input name="q">`
- Enter → ניווט אוטומטי ל-`search-results.html?q=<value>` (cards view = default)

### 6c. URL params — convention
| Param | Meaning | Used by |
|-------|---------|---------|
| `?q=<text>` | Text query | Nav search, search-results, node-chart |
| `?node=<id>` | Center on specific node | node-chart, search-results (round-trip) |
| `?from=browse` | Came from browse flow | search-results (hides view-toggle) |

---

## 7. החלטות UX מהותיות שנעשו בסשן

### 7a. Hover-reveal vs drill-down
**ההחלטה:** קוביית dim לא navigates יותר — היא **hover-reveals את sub-domains כתגיות לחיצות**.
**רציונל:** מ-3 ניווטים (home → dim → dom) ל-1 ניווט (home → dom directly). חוסך page transitions, שומר על "אותה קובייה, פרספקטיבה אחרת".

### 7b. Filter on right (inline-start in RTL)
**ההחלטה:** הפילטר עבר מ-inline-end ל-inline-start (LEFT → RIGHT ב-RTL).
**רציונל:** ה-inline-end נשמר ל-AI panel גלובלי. כשה-AI נפתח, הוא לא חוסם את הפילטר.

### 7c. View toggle ב-header (לא bottom-fixed)
**ההחלטה:** ה-toggle (cards/map) ב-search-header במקום צף-תחתון.
**רציונל:** הסתכמות מבנית — ה-toolbar העליון = "מה אני רואה ואיך". `margin-inline-start: auto` דוחף ל-end. שתי הכפתורים = `inline-grid 1fr 1fr` (זהה ברוחב).

### 7d. Cards view = default
**ההחלטה:** Enter בנאב search → cards (לא map).
**רציונל:** cards מוכרים יותר. Map הוא תצוגה מיוחדת ("network of relationships"). Default = familiar; advanced = optional.

### 7e. Map = view of search results
**ההחלטה:** הערך ש-user חיפש = המרכז של המפה.
**רציונל:** אחידות. אין מסך התחלה נפרד למפה — תמיד צמוד לתוצאות.

---

## 8. רכיבים שנמחקו / dead code

- `.ai-ask-card` ב-indicator-card.html (HTML + CSS + askIndicator JS)
- `.empty-state` הגדול ב-node-chart.html (search-empty card)
- View-toggle bottom-fixed (היה אחרי `</main>` בשני המסכים)
- "פילטרים פעילים" bar בשני המסכים (החלפו ב-tag pill counts)
- `<form class="nav-search">` (הוסר → חזר → נשאר)
- Active filter pills bar (browse + search-results)

---

## 9. רכיבים שנוספו

| Component | File | Purpose |
|-----------|------|---------|
| `assets/tag-bar.js` | new | Notion-style category pills + dropdown |
| `.cube-hover` layer | browse.html | Hover-reveal sub-domain tags |
| `.view-toggle` | both | Cards/map segmented control |
| `.search-empty-hint` | node-chart.html | Small inline hint (replaces big card) |
| `.show-on-map-btn` | indicator-card.html | Cross-link to map |
| TAGS_REGISTRY | browse + search-results | 32-tag taxonomy |

---

## 10. גיבויים נשמרו ב-`_versions/`

הקבצים גובו לפני שינויים גדולים:
- `browse_*.html` (גרסאות 79-88+)
- `search-results_*.html` (גרסאות 38-48+)
- `indicator-card_*.html` (גרסאות 34-36)

---

## 11. בעיות פתוחות לעתיד

1. **Domain matching** ב-search-results לא מדויק — ה-tag href משתמש ב-`?q=<dom.name>` (text search). פתרון נכון: `?domain=<id>` עם פילטר ייעודי.
2. **Mobile/touch**: hover-reveal לא עובד במגע. צריך tap-to-expand fallback.
3. **Dim count growth**: 100-300 מדדים יסקיילו, אבל אם יוסיפו רמה 4 (sub-sub-domains) המבנה יצטרך עדכון.
4. **Dead CSS**: `.search-empty-*` rules הוסרו, אבל יש עוד dead code (e.g., `.domain-chip` ב-search-results) שלא ניקיתי.
5. **Cache-bust**: `?v=2` ב-tag-bar.js — אם משנים שוב, צריך לבמפ ל-`v=3`.
6. **Accessibility audit**: `aria-current`, `role` attributes נוספו במקומות מסוימים. סקירה מעמיקה לא בוצעה.

---

## 12. דפוסים שנקבעו / Conventions

### CSS
- **Logical properties** (`inset-inline-start/end`, `margin-block-end`) — RTL-friendly
- **App-shell layout**: `body { display: flex; flex-direction: column; height: 100%; overflow: hidden }` + `min-height: 0` על children שצריכים internal scroll
- **`inline-grid 1fr 1fr`** ל-equal-width segmented controls
- **`margin-inline-start: auto`** ל-end-anchoring ב-flex
- **`[hidden] { display: none }`** override כש-`display` מוגדר ב-CSS

### HTML
- **`<button>` אסור** להכיל `<a>` (HTML constraint) → השתמש ב-`<div role="group">` כשצריך
- **Forms שמנווטים**: `<form action="...html" method="get"><input name="q"></form>` — Enter מנווט אוטומטית

### JS
- **DOM-API rendering (no innerHTML)** — XSS-safe pattern בכל הקומפוננטות
- **URL params כ-state**: shareable, refresh-resilient
- **Self-injecting components**: ICCard, TagBar — קוראים את ה-host's data, מזריקים CSS+DOM משלהם

### URL state
- `?q=` = query
- `?node=` = node ID (round-trip preservation)
- `?from=browse` = origin marker (UI variant)

---

## 13. תיקון באג: מפה ריקה לאחר חיפוש (סשן המשך)

### הבעיה
כשהמשתמש חיפש מ-`home`/`search-results` (למשל "מדד עוני") ועבר ל"מפה סמנטית" דרך ה-view-toggle, המפה היתה ריקה.

### שורש הבעיה
שני מקורות נתונים מנותקים:
- `search-results.html` → `SEARCH_INDICATORS`: 6 מדדים על welfare/edu/social/resilience/employ
- `node-chart.html` → `DATA`: עץ קטלוג של תחום הבריאות בלבד (BMI, תזונה, דנטל...)

אין חפיפה. `searchNodes('מדד עוני')` ב-node-chart מחזיר `[]` → לא מתבצע centering → המפה ריקה.

### הפתרון
הזרקת התוצאות לתוך DATA בעת הצורך, כך שהמפה תהיה "תצוגה אחרת" של אותן תוצאות:

**1. SEARCH_RESULTS (העתק של SEARCH_INDICATORS)** הוסף ל-node-chart.html (שיכפול מכוון לפרוטוטיפ, כמו TAGS_REGISTRY).

**2. `injectSearchResultsIntoData()` — חד-פעמית:**
- מפעילה (active=true) את domain nodes הקיימים: welfare, edu, employ, resilience
- מוסיפה את `social` (domain חדש שלא היה)
- מוסיפה 6 indicator nodes עם prefix `r.` (כדי לא להתנגש עם `i.bmi` וכו')
- מקשרת כל indicator → domain שלו (hierarchical)
- מוסיפה complementary links בין מדדים באותו domain

**3. `showSearchResultsGraph(query)`:**
- אופסת STATE
- מוסיפה את כל ה-5 תחומים + 6 מדדים ל-`STATE.visibleNodeIds`
- מסמנת תחומים כ-expanded (כדי לא להראות "+" עליהם)
- ממרכזת על best-match (exact > startsWith > includes — name + snippet)
- אם אין match → ממרכזת על card-1

**4. `deepLinkFromUrl()` שדרוג:**
- `?q=<text>` → תמיד `showSearchResultsGraph(q)` (לא יותר searchNodes על health-tree)
- `?node=i.*` → `centerOnSearchResult` (round-trip מ-indicator-card)
- `?node=r.*` → `showSearchResultsGraph('')` + `centerNode` + `selectNode` עליו (round-trip מ-cards-view)

### תוצאות צפויות
- חיפוש → cards (6 מדדים) → טוגל למפה → גרף עם 6 מדדים + 5 תחומים, ממורכז על best-match
- מפה → כרטיסיות → מפה: שומר על המרכז (`?node=r.card-N`)
- ה-health-tree עדיין זמין לפי-בחירה ב-browse flow ולהעמקה דרך indicator-card

### קבצים שונו
- `D-UX-Design/prototypes/node-chart.html` — הוספת SEARCH_RESULTS + 2 פונקציות חדשות + עדכון `deepLinkFromUrl`
- `_versions/node-chart_71_*.html` — גיבוי

---

**Status:** הפרוטוטיפים במצב יציב לתצוגה ולמשוב. דורש קמפיין הג'וינט הבא להרחיב את הdata + tagging.
