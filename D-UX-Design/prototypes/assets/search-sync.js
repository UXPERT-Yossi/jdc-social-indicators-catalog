/* ─────────────────────────────────────────────────────────────────────────
   search-sync.js — Keep all search inputs in sync with ?q= in the URL.

   Why this exists:
   Every prototype page that contains a search field MUST reflect the user's
   current query. The nav-search input (small, top-right) and the main search
   field (big, inside .search-header) are TWO views of the same state — both
   need to show what the user is searching for, on every page they land on.

   What it does:
   1. Reads ?q= from window.location.search
   2. Sets the value on every known search input:
      - .nav-search-input  (in <nav> of every page)
      - #search-input      (big field in search-results.html)
      - #searchTopInput    (big field in node-chart.html)
   3. Only overwrites empty fields — preserves any value the user typed
      after page load (e.g., refining the query).
   4. Re-syncs after history navigation (popstate) so back/forward keeps
      the field in step with the URL.

   Load order: include this BEFORE ai-fab.js (which is the universal trailing
   script). Position late enough that all inputs exist in the DOM.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* Centralized list of known search-input selectors. Add new ones here when
     a new page introduces another field — single source of truth. */
  var SELECTORS = [
    '.nav-search-input',
    '#search-input',
    '#searchTopInput'
  ];

  function currentQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    } catch (e) {
      return '';
    }
  }

  /* Set value on every matching input, but only when the input is empty.
     This avoids stomping on whatever the user has just typed if the script
     runs after their first keystroke (race-safe). */
  function applySync(query) {
    if (!query) return;
    SELECTORS.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      nodes.forEach(function (inp) {
        /* Only fill if empty AND not currently focused — focused fields are
           "owned" by the user; never overwrite. */
        if (!inp.value && document.activeElement !== inp) {
          inp.value = query;
        }
      });
    });
  }

  function run() { applySync(currentQuery()); }

  /* Run immediately (covers the common case: script tag is below the inputs)
     AND on DOMContentLoaded (covers the rare case: script loaded earlier than
     the inputs were parsed). Idempotent — running twice is safe. */
  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }

  /* Re-sync on browser back/forward so the URL and the field stay in lockstep
     across history navigation (the URL changes without a full page reload
     for in-page history.pushState calls — currently unused, but futureproof). */
  window.addEventListener('popstate', run);
})();
