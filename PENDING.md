# PENDING Tasks (Blockers & Waiting List)
This file tracks tasks that one developer is waiting for the other developer to complete in order to finish their phase.

## 🔴 Frontend (HajiAlirezaei) is waiting for:
**Current Status:** UI and state management for Phase 3 (Menu/Cart) and Phase 4 (Kitchen/Cashier Dashboards) are fully built using Mock Data.

**Tasks the Backend (HamidiFard) needs to complete to unblock the Frontend:**
1. **[Phase 3]:** Build `GET /api/menu` to fetch real food items.
2. **[Phase 3]:** Build `POST /api/orders` so the frontend Cart can submit customer orders to the database.
3. **[Phase 4]:** Build `GET /api/orders` for the Kitchen and Cashier to fetch the live queue.
4. **[Phase 4]:** Build `PATCH /api/orders/:id/status` so the staff can move orders from Pending -> Preparing -> Ready -> Completed.

**Blocker Reason:** I cannot test the actual checkout flow or make the dashboards update across different screens until these endpoints are connected to the MongoDB database.

---

## 🟢 Backend (HamidiFard) is waiting for:
* *(Currently, the Backend is not waiting for the Frontend. Backend needs to implement the above APIs!)*