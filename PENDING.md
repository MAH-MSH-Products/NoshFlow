# PENDING Tasks (Blockers & Waiting List)
This file tracks tasks that one developer is waiting for the other developer to complete in order to finish their phase.

## 🔴 Frontend (HajiAlirezaei) is waiting for:
**Current Status:** Phase 3 (Menu UI, Food Cards, and global Shopping Cart state) is complete using Mock Data. The code is committed in the `feature/fe-menu` branch.

**Tasks the Backend (HamidiFard) needs to complete to finalize Phase 3:**
1. **[Phase 3 - Database]:** Create the `MenuItems` and `Orders` collections in the database.
2. **[Phase 3 - API]:** Build the `GET /api/menu` endpoint so I can fetch the real food items instead of using my local `mockMenu.js`.
3. **[Phase 3 - API]:** Build the `POST /api/orders` endpoint so I can send the user's cart data when they click "Proceed to Checkout".

**Blocker Reason:** I cannot build the checkout flow or display real restaurant data until these endpoints are ready. My branch `feature/fe-menu` is paused until then.

---

## 🟢 Backend (HamidiFard) is waiting for:
* *(Currently, the Backend is not waiting for the Frontend. Ready for Phase 3/4!)*