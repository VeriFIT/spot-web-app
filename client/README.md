# Spot Web App (Client)

This is the React client for the Spot LTL web tool. It was migrated from Create React App to [Vite](https://vitejs.dev/).

## Development

From the `client/` directory:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run start
   ```
   The app runs on http://localhost:3000/app/ and proxies `/api` requests to the Flask server at http://localhost:5000 (configured in `vite.config.ts`).

3. Start the API server (from the repository root):
   ```bash
   ./server/spotapi.py
   ```
   (Requires Spot with Python bindings installed.)

## Build

```bash
npm run build
```

Build output goes to `client/build/`. For deployment, copy this directory to `/var/www/html/app/` (the app is served at https://spot.lre.epita.fr/app/).

The mode is a path segment (`/app/translate`, `/app/rewrite`, …), so the web server must serve `app/index.html` for any path under `/app/` that is not a file — with nginx, `try_files $uri /app/index.html;`. Without that fallback, opening or reloading a link other than `/app/` returns a 404.

The formulas, the mode and the result-affecting options of both panels live in that URL, so a link or a reload restores the whole page. The primary panel owns the bare parameters (`f`, `g`, `acc`, …); the duplicate panel opened by the copy button owns the same names prefixed `p2-`, and `p2-mode` is what says the second panel is open at all. `expert` and `hideoptions` are display-only and stay out of the URL.

The build is split into chunks: React and MUI each get one (`codeSplitting` in `vite.config.ts`), the app code and the help panel get their own. Only the first three load with the page; the help chunk is fetched the first time the help button is pressed.

## Lint, types and format

```bash
npm run lint          # ESLint (React, hooks, jsx-a11y; TypeScript files too)
npm run typecheck     # tsc --noEmit
npm run format        # Prettier, writes in place
npm run format:check  # Prettier, check only (used by CI)
```

## Tests

```bash
npm run test          # Vitest, single run (used by CI)
npm run test:watch    # Vitest, watch mode
```

Tests live next to the code as `*.test.ts(x)`. `vitest.config.ts` sets the jsdom
environment. `src/api/client.test.ts` pins the query-string
contract with `spotapi.py`; `src/hooks/useApiQuery.test.ts` covers aborting, stale
responses and error handling; `src/LtlApp.test.tsx` renders the tabs against a mocked
`fetch`: the rewrite tab covers the delayed spinner, the error states and the option
controls, the formula input covers committing an edit and showing parse errors, and the
study, compare and translate tabs each check their request and what they render.

Every source module is TypeScript: components are `.tsx`, everything else `.ts`,
`src/api/types.ts` gives the JSON answers of `spotapi.py` their shape, and
`tsconfig.json` checks them in strict mode (no `allowJs` escape hatch). All four tabs go
through `src/api/client.ts` for their requests and through
`useApiQuery`/`useDelayedFlag` for their results.

Those answers are also checked at runtime, in `src/api/validate.ts`: a field that does
not match its declared type rejects the whole response with a message naming the
endpoint and the field, which the panel shows in place of a result. Add a field to
`spotapi.py`, and its declaration in `types.ts` and its check in `validate.ts` have to
follow.

## Help prose

The text of the help panel is not written in JSX: each section is a Markdown document
under `src/features/help/sections/`, compiled by `@mdx-js/rollup` (see the plugin in
`vite.config.ts`; `src/mdx.d.ts` types the `*.mdx` imports). `Help.tsx` gives the
documents the components they can use — `Ltl` for a formula chip, `OpTable`/`Op` for a
table of notations, `Terms`/`Term` for a definition list — and maps Markdown paragraphs
and `###` sub-headings onto `Typography`. Adding a section is a new `.mdx` file plus an
entry in `SECTIONS`.

Prettier skips those files (`.prettierignore`): its MDX printer pulls inline JSX out of
the surrounding paragraph, which would split the sentences of the prose into separate
blocks. They are laid out by hand.

The panel is loaded on demand — `React.lazy` in `App.tsx`, with a placeholder the size
of the panel until the chunk arrives — so the prose ships in its own file and editing a
section does not touch the bundle the formula panels load.

## Notes

- The app is always served under the `/app/` base path, and all API requests go to the
  relative `/api/` path: the dev server proxies it to port 5000, and in production the
  same server that serves the pages serves the API, so no URL has to be configured.
- Node.js 22+ is required; `.nvmrc` pins the 24.x LTS line.
- Absolute paths to `/spot.css` and `/spot2.svg` are used and expected to be served from the site root.
