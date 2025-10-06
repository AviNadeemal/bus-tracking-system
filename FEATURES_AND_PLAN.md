## Bus Tracking System — Features & Development Plan

This document lists proposed features (4–5), a phased development plan with step-by-step tasks, acceptance criteria, an embedded TODO checklist, and brief engineering notes to guide implementation for the university project.

---

## Proposed Features (5)

1. Real-time Bus Location Tracking
   - Accept GPS coordinates from bus devices (or simulated clients) and stream updates to connected frontends.
   - Backend: WebSocket (socket.io) or REST polling endpoint to receive coordinates.
   - Frontend: Map rendering (e.g., Leaflet or Google Maps) showing moving bus markers.

2. Route Management and Map Display
   - Admin API and UI to create/edit routes and stops.
   - Store routes as ordered list of stops (lat/lng) and render route polylines on the map.

3. ETA and Arrival Predictions
   - Backend service to compute ETAs for buses to upcoming stops (basic average-speed or distance-based algorithm).
   - Frontend shows ETA per stop and highlights soon-arriving buses.

4. Admin Panel (Buses, Drivers, Assignments)
   - CRUD endpoints to manage buses, drivers, and assign buses to routes.
   - Simple web UI for administrators to view current assignments and status.

5. Notifications & Alerts (Optional / Stretch)
   - Allow users to subscribe to arrival alerts for a stop (push, email, or simple in-app notifications).

---

## Development Phases (high level)

Phase 0 — Discovery & Setup (1 day)
- Inspect current repo: backend (`/backend`) and frontend (`/frontend`).
- Ensure `npm install` works in both and add missing dev scripts.
- Create this `FEATURES_AND_PLAN.md` and an initial `todo` (done).

Deliverables
- Repo can be started locally for quick verification.

Phase 1 — Core Backend APIs (1–2 days)
- Build REST endpoints for: buses, drivers, routes, stops, and locations ingestion.
- Design minimal DB schema (use existing `db.js` if present) and implement CRUD.

Acceptance criteria
- Endpoints return JSON, basic tests (curl/postman) succeed.

Phase 2 — Real-time Tracking (1–2 days)
- Add WebSocket support (socket.io) to push location updates to frontends.
- Implement a location ingestion endpoint for bus device simulation.

Acceptance criteria
- Frontend can subscribe and see live bus marker movement on map.

Phase 3 — Route Management & Map UI (2 days)
- Backend APIs to create routes and stops.
- Frontend UI to display list of routes, render polylines and stops on the map.

Acceptance criteria
- Admin can create a route; the route appears on the map.

Phase 4 — ETA Calculation & UI (1–2 days)
- Implement a simple ETA service (distance/speed or last-known speed estimate).
- Expose endpoint for upcoming-arrivals at a stop.

Acceptance criteria
- Frontend displays ETA per stop and updates as bus moves.

Phase 5 — Admin Panel & Assignment (1–2 days)
- Add admin UI for buses and drivers; allow assigning a bus to a route.

Acceptance criteria
- Admin can create bus/driver and assign to route; assignment reflected in live view.

Phase 6 — Tests, Docs, Polish (1–2 days)
- Add simple unit tests for critical backend logic and API smoke tests.
- Write `README.md` updates with setup steps for dev and run.

Phase 7 — Optional Notifications & Deployment (stretch)
- Add alerts and a simple deployment guide.

---

## Step-by-step Implementation Checklist (tasks grouped by phase)

- [x] Phase 0: Create `FEATURES_AND_PLAN.md` (this file)
- [ ] Phase 1: Backend CRUD endpoints
  - [ ] `GET /api/buses`, `POST /api/buses`, `PUT /api/buses/:id`, `DELETE /api/buses/:id`
  - [ ] Same CRUD for `drivers`, `routes`, `stops`
  - [ ] Location ingestion endpoint `POST /api/locations` (or `POST /api/buses/:id/location`)
- [ ] Phase 2: Real-time tracking
  - [ ] Add `socket.io` server in `backend/index.js` and client in `frontend`.
  - [ ] Emit `locationUpdate` events with payload { busId, lat, lng, timestamp }
- [ ] Phase 3: Route UI
  - [ ] Add admin route creation UI and map polyline rendering in `frontend/src` (component: `RoutesManager`)
- [ ] Phase 4: ETA service
  - [ ] Backend service to compute ETA; endpoint `GET /api/stops/:id/eta`
  - [ ] Frontend display in `StopDetails` component
- [ ] Phase 5: Admin panel
  - [ ] Basic UI pages for buses/drivers/assignments in `frontend/src/admin`
- [ ] Phase 6: Tests & docs
  - [ ] Add tests under `backend/tests` and `frontend/src/__tests__`
  - [ ] Update root `README.md` with run instructions

---

## Acceptance Criteria (overall)

- App starts locally: `npm install && npm start` in both `backend` and `frontend` (or equivalent scripts).
- Buses can send locations and frontends render them live on a map.
- Routes and stops can be created and are visible on the map.
- ETA calculations are reasonably accurate for demo purposes.
- Admin can manage buses and drivers.

---

## Engineering Contract (short)

- Inputs: GPS coordinates (lat,lng,timestamp), route definitions (ordered stops), bus metadata (id, capacity).
- Outputs: Live location stream, route polylines, ETA values per stop, CRUD API responses.
- Error modes: malformed coordinates, unavailable bus, missing route — return 4xx; server errors 5xx.
- Success: JSON responses with 2xx; socket emits validated payloads.

---

## Edge Cases to handle

- Missing or stale location updates — show last-known and mark stale after X minutes.
- Overlapping bus IDs or duplicate device reporting — deduplicate on `busId`.
- Route without stops — disallow creation.
- Very high frequency updates — rate-limit ingestion or sample incoming stream.

---

## Minimal Tests to add (suggestions)

- Backend: test location ingestion -> stores/forwards to socket; test route creation -> returns route id.
- ETA logic: small unit test with fixed points and speeds.

---

## Notes & Next Steps

1. Run both apps locally and verify current state. Update `backend/package.json` and `frontend/package.json` scripts if needed.
2. Start with Phase 1 (APIs) and Phase 2 (real-time) as they unlock the core demo.
3. Keep changes minimal and well-scoped for the university deadline.

---

If you'd like, I can now proceed to implement Phase 1 endpoints and wire a basic socket flow — tell me which phase to start on or say "implement Phase 1" and I'll continue.
