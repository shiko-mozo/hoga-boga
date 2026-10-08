# Admin Template

A reusable admin dashboard: a sidebar with collapsible groups, a KPI row, performance rings, status bars, an hourly chart, a leaderboard, a quick summary, and recent activity lists. The layout is modelled on a ride/delivery operations panel. It contains no real data.

There is no build step: open `index.html` in a browser.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Layout shell, Tailwind v4 (browser build) theme tokens, component classes |
| `data.js` | Mock data: nav tree, KPIs, charts, lists. Replace with your API. |
| `app.js` | Rendering, i18n (EN/AR), theme and language toggles, search, filters |

## Features

- Dark and light themes, saved per browser
- English and Arabic, with full RTL layout that mirrors the sidebar and spacing
- Collapsible nav groups that auto-expand to the active route (hash-based)
- Responsive: a mobile drawer with backdrop and <kbd>Esc</kbd> to close
- Global search (<kbd>/</kbd> to focus) that filters recent rides and users
- Status filter chips on Recent Rides
- KPI deltas, live indicator, "x / total" values
- Every user string is HTML-escaped before rendering

## Customising

- **Brand colours**: edit the `@theme` block in `index.html` (`--color-brand`, `--color-ink-*`).
- **Menu**: edit `nav` in `data.js`. An item with `children` becomes a group. Icons are [Lucide](https://lucide.dev/icons) names.
- **Labels**: add keys to `STR.en` / `STR.ar` in `app.js`.
- **Live data**: replace `window.ADMIN_DATA` with a `fetch()` in the refresh handler (`#refreshBtn` in `app.js`), then call `renderAll()`.
- **Production**: the Tailwind browser build is for prototyping. For production, move the classes into a Tailwind CLI/Vite build.
