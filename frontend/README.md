# Frontend (Next.js) — PetroStock

Quick notes to run the frontend and switch between mock mode and a real backend.

Prerequisites
- Node.js (tested with Node 22.x) and npm

Install

```bash
cd frontend
npm install --legacy-peer-deps
```

Run development server

```bash
npm run dev
```

Build for production

```bash
npm run build
npm run start
```

Mock vs Real API
- By default the app uses a built-in mock layer. To connect to a real backend:
  1. Edit `frontend/lib/api.js` and set `MODE_MOCK = false`.
  2. Ensure `NEXT_PUBLIC_API_URL` points to your backend in `.env.local` (e.g. `http://localhost:8000`).
  3. Start the backend and make sure CORS allows `http://localhost:3000`.

API endpoints expected (when `MODE_MOCK = false`):
- `GET /kpi/`
- `GET /stocks/alertes/`
- `GET /stocks/{depot_id}`
- `GET /previsions/{produit_id}`
- `GET /anomalies/`
- `GET|POST /commandes/`
- `GET|POST /incidents/`
- `GET /factures/`

Notes
- If API field names differ from the mock objects, update pages in `frontend/pages/` accordingly.
- To toggle mock data without editing code, consider converting `MODE_MOCK` to read from an env var.
