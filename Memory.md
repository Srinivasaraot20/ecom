# Memory.md — Development Progress and AI Context

## Purpose
This file is the project handoff note for an AI coding assistant. Update it as implementation progresses so a new chat or tool can continue without losing important context.

## Project
Mini E-Commerce Ordering Application for an AI Full Stack Developer technical assignment.

## Requirements Source
- `PRD.md`: functional and acceptance requirements.
- `Architecture.md`: application boundaries and API contracts.
- `Rules.md`: coding and verification rules.
- `Phases.md`: implementation sequence.
- `Design.md`: UI/UX guidelines.

## Fixed Product Data
| ID | Product | Price (INR) | Initial stock |
|---|---|---:|---:|
| mouse | Wireless Mouse | 799 | 10 |
| keyboard | Mechanical Keyboard | 2499 | 5 |
| hub | USB-C Hub | 1299 | 15 |
| speaker | Bluetooth Speaker | 1999 | 0 |
| stand | Laptop Stand | 899 | 8 |

Use integer INR amounts. Bluetooth Speaker must be displayed as out of stock and cannot be purchased.

## Current Status
**Status:** P0 core features and P1 high-value enhancements implemented and verified. All acceptance criteria checked.

## Progress Log
Update this section during development:
- [x] Inspect workspace and existing files.
- [x] Set up client and server.
- [x] Implement product endpoint and seed data (existing).
- [x] Implement order creation, validation, stock updates, and order lookup (existing).
- [x] Implement product listing and search.
- [x] Implement cart, stock boundaries, totals, and localStorage.
- [x] Implement checkout and confirmation/error states.
- [x] Test responsive behavior and core acceptance cases.
- [x] Run all acceptance tests (25/25 passing: 15 server, 10 client).
- [ ] Write final README and capture demo/screenshots.

## Decisions Made
- Use React + Vite and Express to keep the stack simple.
- Keep cart persistence in localStorage; do not treat it as inventory authority.
- Use integer INR values for calculations.
- Use a lightweight data store appropriate to the assignment and document its limitations.
- Design.md reference websites (Amazon India, Flipkart) used only for UX interaction patterns, not as templates.
- No brand assets, logos, exact layouts, or proprietary graphics copied from reference sites.
- Order lookup flow (GET /api/orders/:id) implemented in UI confirmation view.
- Search is case-insensitive with clear functionality and no-results state.
- Price filters (min/max) and in-stock filter work together with search.
- Sort by price (low-to-high, high-to-low, in-stock-first) works with filtering.
- Active filter chips display and allow individual removal; Clear All resets all filters.
- Cart count in header, toast notifications for "Added to cart" feedback.
- Order confirmation includes order ID, items, quantities, line totals, and server-calculated total.
- Order confirmation can be reopened with "View order details" using order ID.
- Failed checkout preserves cart and shows actionable error message.
- Checkout pending state disables button and shows "Placing order..." with spinner.
- No fake reviews, ratings, discounts, delivery claims, or unsupported specifications appear.

## Errors and Fixes
Record only real errors encountered:
| Date | Error | Root cause | Fix | Retested? |
|---|---|---|---|---|
| - | - | - | - | - |

## AI Usage Record
Fill in after implementation:
- AI coding tools actually used:
- Prompts actually used:
- AI-generated or AI-assisted parts:
- Manual changes and reviews:
- Tests actually executed:
  - Server: 15/15 tests pass (GET /api/products, POST /api/orders, validation, stock management, order lookup, error handling)
  - Client: 10/10 tests pass (cart operations, localStorage, formatting, addToCart, setQuantity, removeFromCart, getCartSummary, toOrderItems, formatINR)

## Known Limitations
- In-memory storage resets on server restart; not suitable for production without a proper database.
- No authentication, payments, shipping/taxes, or deployment implemented (out of scope).
- Reference websites (Amazon India, Flipkart) used only for UX pattern inspiration; no brand assets or exact layouts copied.
- P2 optional features (quick-view modal, wishlist, comparison, recently viewed) not implemented to prioritize reliable P0/P1 functionality.

## Next Action
Application is complete with all P0 and P1 requirements verified. All 25 acceptance tests pass. Source code is ready for submission.