# קטלוג מדדים חברתיים — הג'וינט

> כלי חשיבה (Guided Thinking Tool) לבחירת מדדים חברתיים.
> שלב נוכחי: **D — פרוטוטיפים אינטראקטיביים** (HTML/CSS/JS, RTL עברית).

## מבנה הריפו

| תיקייה | תוכן |
|---|---|
| `A-Product-Brief/` | Brief המוצר |
| `B-Trigger-Map/` | מפת טריגרים + פרסונות |
| `C-UX-Scenarios/` | תרחישי UX |
| `D-UX-Design/` | עיצוב + פרוטוטיפים אינטראקטיביים |
| `_progress/` | יומן עיצוב (`00-design-log.md`) |
| `CLAUDE.md` | הוראות פרויקט קנוניות (לקריאה ראשונה) |
| `summary.md` | סיכום סשנים גדולים |

## הפרוטוטיפים — `D-UX-Design/prototypes/`

7 מסכים אינטראקטיביים:

1. **`home.html`** — דף בית עם נקודות כניסה (חיפוש, עיון, AI)
2. **`search-results.html`** — תוצאות חיפוש בכרטיסיות + סינון + תיוג סמנטי
3. **`browse.html`** — Hub של 5 ממדי חיים עם hover-reveal לתת-תחומים
4. **`indicator-card.html`** — כרטיס מדד מלא (הגדרה, מתודולוגיה, תוכניות)
5. **`comparison.html`** — השוואת 2-3 מדדים זה לצד זה
6. **`node-chart.html`** — מפה סמנטית (D3 force graph) של הקטלוג
7. **`ai-chat.html`** — צ'אט עם AI לחקירת מדדים

### הפעלה
פתיחה ישירה בדפדפן (אין dependencies, אין build):
```
open D-UX-Design/prototypes/home.html
```

או דרך שרת מקומי:
```
cd D-UX-Design/prototypes && python3 -m http.server 8080
```

## תלויות

- **D3.js** (CDN) — רק במפה הסמנטית
- **Google Fonts: Heebo** — טיפוגרפיה עברית

אין framework, אין build pipeline. וניל בלבד.

## ארגון / סוכן

| | |
|---|---|
| **לקוח** | הג'וינט |
| **עיצוב** | Yossi @ UXpert |
| **שיטה** | WDS (Whiteport Design System) — Saga → Freya → Mimir |
