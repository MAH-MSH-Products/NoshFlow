# PENDING Tasks (Blockers & Waiting List)
This file tracks tasks that one developer is waiting for the other developer to complete in order to finish their phase.

## 🔴 Frontend (HajiAlirezaei) is waiting for:
**Current Status:** Phase 1 (React and Tailwind setup) and the UI for Phase 2 (Login and Register forms with Routing and mock data) are completed. The code is committed in the `feature/fe-auth` branch.

**Tasks the Backend (HamidiFard) needs to complete to finalize Phases 1 & 2:**
1. **[Phase 1]:** Set up the Node.js/Express server and successfully connect to the MongoDB database.
2. **[Phase 2 - Database]:** Create the `Users` and `Roles` collections in the database.
3. **[Phase 2 - API]:** Build the `/register` and `/login` endpoints. User passwords must be hashed using `bcrypt`.
4. **[Phase 2 - Token]:** In response to a successful login request, the server must generate and send a valid JWT.

**Blocker Reason:** I need these APIs to replace the mock data with actual `fetch` requests and successfully store the received JWT in the browser. Only then can I merge the `feature/fe-auth` branch into `develop`.

---

## 🟢 Backend (HamidiFard) is waiting for:
* *(Currently, the Backend is not waiting for the Frontend. The Backend needs to initiate and complete the development for Phases 1 and 2).*