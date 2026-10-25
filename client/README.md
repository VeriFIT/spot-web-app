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
   The app runs on http://localhost:3000/app/ and proxies `/api` requests to the Flask server at http://localhost:5000 (configured in `vite.config.js`).

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

## Environment variables

Environment variables are defined in `.env.development` and `.env.production` and must be prefixed with `VITE_` (Vite exposes them via `import.meta.env`):

- `VITE_API_PORT` - Port suffix for the API (e.g. `:5000` in dev, empty in prod)
- `VITE_API_ENDPOINT` - API path (e.g. `/api/`)

## Lint and format

```bash
npm run lint          # ESLint (React, hooks, jsx-a11y)
npm run format        # Prettier, writes in place
npm run format:check  # Prettier, check only (used by CI)
```

## Notes

- The app is always served under the `/app/` base path.
- Node.js 22+ is required; `.nvmrc` pins the 24.x LTS line.
- Absolute paths to `/spot.css` and `/spot2.svg` are used and expected to be served from the site root.
