# Phases.md — Project Development Phases

## Guiding Principle
The assignment has a 90-minute time limit. Prioritize working end-to-end functionality over visual perfection. At the end of each phase, run a quick verification before continuing.

## Phase 0 — Inspect and Plan (3 minutes)
- Inspect the current workspace and assignment.
- Read `PRD.md`, `Architecture.md`, `Rules.md`, and `Design.md`.
- Confirm Node.js and npm are available.
- Identify existing work to preserve.
**Exit criteria:** A short implementation plan and no unresolved blocking questions.

## Phase 1 — Project Setup (7 minutes)
- Create React + Vite client.
- Create Node.js + Express server.
- Add minimal scripts and `.gitignore`.
- Configure the client API base URL and local CORS.
**Exit criteria:** Client and server start successfully.

## Phase 2 — Product API (8 minutes)
- Seed the exact five products.
- Implement `GET /api/products`.
- Return consistent JSON.
**Exit criteria:** Endpoint returns correct product names, prices, and stock.

## Phase 3 — Order API and Validation (17 minutes)
- Implement `POST /api/orders`.
- Validate body, product IDs, and positive integer quantities.
- Calculate prices and totals on the server.
- Reject insufficient stock and invalid requests without partial stock changes.
- Reduce stock only after successful validation.
- Generate unique order IDs and save order snapshots.
- Implement `GET /api/orders/:id`.
**Exit criteria:** Valid order succeeds; invalid orders fail safely; order lookup works.

## Phase 4 — Product UI and Search (10 minutes)
- Fetch and display products.
- Add case-insensitive search.
- Display price and availability.
- Disable Add to Cart for out-of-stock products.
- Add loading and error states.
**Exit criteria:** Catalogue and search work with the real API.

## Phase 5 — Cart (15 minutes)
- Add/remove products and change quantities.
- Enforce stock boundaries.
- Calculate line subtotals and grand total.
- Persist cart to localStorage and restore it safely.
**Exit criteria:** Cart interactions and refresh persistence work.

## Phase 6 — Checkout and Confirmation (10 minutes)
- Submit order to the API.
- Prevent repeated pending submissions.
- Display order ID, items, quantities, and total.
- Clear cart only after success; preserve it after failure.
**Exit criteria:** Complete user-to-server order flow works.

## Phase 7 — Responsive Polish and Verification (12 minutes)
- Check mobile layout and accessibility basics.
- Test API success and error cases.
- Test fake client prices, invalid quantities, insufficient stock, and unknown order ID.
- Run production build if time permits.
**Exit criteria:** Core acceptance tests pass or remaining issues are documented honestly.

## Phase 8 — README and Submission (8 minutes)
- Write setup/run commands.
- Document API endpoints.
- Record actual AI tool use, prompts, errors, fixes, limitations, and future improvements.
- Capture screenshots or a short demo if time permits.
- Check source code and `.gitignore`.
**Exit criteria:** Source code and honest documentation are ready to submit.

## If Time Runs Short
Prioritize in this order:
1. Product API and display.
2. Order API validation and stock integrity.
3. Cart operations and totals.
4. Checkout confirmation and error handling.
5. localStorage persistence.
6. README and screenshots.
7. Visual polish.

Do not claim incomplete features are complete.
