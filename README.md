# Frontend

Minimal React (Vite) dashboard for the events platform.

## Setup
```
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

Demo login (mock mode): `demo@example.com` / `demo`.

## Mock vs live
The app starts in **mock mode** by default — all API calls hit an in-memory store in `src/mock.js` so you can develop the UI without backends. To call the real services, set `VITE_USE_MOCK=false` in `.env`. The `api` import from `src/api.js` swaps implementations transparently — page code is identical in both modes.

## Service endpoints (defaults)
| Var | Service | Default |
|-----|---------|---------|
| `VITE_REG_URL`   | registration-service (auth + bookings) | `http://localhost:8003` |
| `VITE_USER_URL`  | user-service (profiles)                | `http://localhost:8001` |
| `VITE_EVENT_URL` | event-service                          | `http://localhost:8002` |
| `VITE_NOTIF_URL` | notification-service                   | `http://localhost:8004` |

## Pages
- `/login`, `/signup` — auth via registration-service
- `/events` — public event list; `/events/:id` — detail + book
- `/events/new` — create event (organizer JWT)
- `/bookings` — current user's bookings (cancel)
- `/notifications` — recent platform notifications (auto-refresh 10s)
- `/profile` — view + edit profile (user-service)

## Notes for backend integration
- JWT is read from `access_token` (or `token`) on `/auth/login` and `/auth/signup` responses.
- All authed requests send `Authorization: Bearer <token>`.
- The API client (`src/api.js`) is the single integration surface — adjust paths/payloads here if your handlers diverge from `WORK.md`.
- Backends must enable CORS for `http://localhost:5173`.
