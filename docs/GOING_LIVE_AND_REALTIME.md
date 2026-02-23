# Going Live & Real-Time Activities

How to deploy MedConnect and add real-time features (alerts, live updates, chat).

---

## 1. Going live (deploy the static site)

### Option A: Netlify (recommended)

Your repo is already set up: `netlify.toml` uses `npm run build` and publish directory `out`.

1. **Push your code** to GitHub/GitLab/Bitbucket.
2. In [Netlify](https://app.netlify.com): **Add new site → Import an existing project** and connect the repo.
3. Netlify will use the build settings from `netlify.toml`. Click **Deploy**.
4. After deploy, set **Environment variables** in Netlify (Site settings → Environment variables):
   - `NEXT_PUBLIC_API_URL` = your backend API base URL (e.g. `https://api.yourdomain.com`) when you have a backend. Leave unset for static-only.

Your site will be live at `https://<your-site>.netlify.app` (or your custom domain).

### Option B: Deploy `out` manually

1. Run locally: `npm run build`.
2. Upload the contents of the **`out`** folder to any static host (Netlify, Vercel, S3 + CloudFront, GitHub Pages, etc.).
3. Ensure the host serves `index.html` for client-side routes (e.g. Netlify/Vercel do this by default; S3/CloudFront need redirect rules for SPA).

### Option C: Vercel

- Import the repo in Vercel. For **static export** you must keep `output: "export"` in `next.config.ts`. Vercel will run `next build` and you can set **Output Directory** to `out`, or use Vercel’s default and adjust if needed.

---

## 2. Real-time activities — options

The current app is a **static export**: no Node server in production. Real-time (live alerts, chat, presence) needs one of the following.

### Option 1: Backend API + polling (simplest)

- **Backend:** Any REST API (Node, Python, etc.) implementing the contracts in `docs/API_ENDPOINTS.md`.
- **Real-time effect:** Frontend polls the API on a timer (e.g. every 5–10s for alerts, queue, delivery status).
- **Setup:** Set `NEXT_PUBLIC_API_URL` to your API. The app already uses `src/services/api/client.ts` and module services (e.g. `sendEmergencyAlert`, `getAlerts`). Add polling in specific pages (e.g. dispatch, nurse jobs) with `setInterval` or a small hook.
- **Pros:** Works with static hosting, no WebSockets. **Cons:** Not instant; more requests.

### Option 2: Backend + WebSockets

- **Backend:** Add a WebSocket server (e.g. Node + `ws` or Socket.io) alongside your REST API. On events (new emergency, job assigned, delivery update), the server pushes to connected clients.
- **Frontend:** Open a WebSocket to `wss://api.yourdomain.com` (or your WS URL). Subscribe to channels (e.g. `emergency`, `nurse-jobs`, `dispatch`) and update UI on messages.
- **Deploy:** Backend and WebSocket server must run on a host that supports long-lived connections (e.g. Railway, Render, Fly.io, or a VPS). Static site stays on Netlify; only `NEXT_PUBLIC_API_URL` (and optionally `NEXT_PUBLIC_WS_URL`) point to the backend.
- **Pros:** True real-time. **Cons:** Need to run and maintain a server.

### Option 3: Third-party real-time (Supabase, Pusher, Ably)

- **Supabase Realtime:** Add Supabase; use Realtime for presence and broadcast (e.g. new alerts, job updates). Backend (or Edge Functions) writes to Supabase; frontend subscribes to channels. Good if you use Supabase for DB/auth.
- **Pusher / Ably:** Hosted WebSocket-like APIs. Backend sends events via their HTTP API; frontend uses their client SDK to subscribe. No need to run your own WebSocket server.
- **Setup:** Create project, get API keys. In the app: add their client library, connect when the app loads (or on specific pages), subscribe to channels (e.g. `emergency`, `dispatch`). Keep using your REST API for CRUD; use these only for push.
- **Pros:** Real-time without operating a WebSocket server. **Cons:** Vendor dependency and (often) cost at scale.

### Option 4: Hybrid (REST + optional real-time)

- **Default:** Use only REST + polling so the app works everywhere.
- **When available:** If you set `NEXT_PUBLIC_WS_URL` (or a feature flag), the app opens a WebSocket or uses Pusher/Supabase and updates UI in real time. If not set, fall back to polling.

---

## 3. What’s already wired in the app

- **Emergency:** `EmergencyButton` and the emergency module call `POST /api/emergency/alert` when `NEXT_PUBLIC_API_URL` is set (with optional geolocation). Backend should notify admins and contacts; for real-time dashboards, backend can also push via WebSocket or a third-party service.
- **API client:** `src/services/api/client.ts` uses `NEXT_PUBLIC_API_URL`. Add `Authorization: Bearer <token>` when you add auth (see comment in file).
- **Modules:** `src/modules/*/services.ts` call the API; pages can use these and add polling or real-time subscriptions on top.

---

## 4. Suggested next steps

1. **Go live:** Deploy to Netlify (or upload `out`) so the site is public.
2. **Backend:** Implement the REST API from `API_ENDPOINTS.md` (auth, emergency, diagnosis, nurse, pharmacy, etc.). Deploy it and set `NEXT_PUBLIC_API_URL`.
3. **Real-time:** Start with **polling** on key screens (e.g. `/dispatch`, `/nurse`, emergency admin). When you need instant updates, add either your own WebSocket server or a service like Supabase Realtime / Pusher and subscribe in the same screens.

Once the backend is up and the URL is set, the app will use it for emergency alerts and any other API calls you’ve wired; real-time can be added incrementally without changing the static deploy.
