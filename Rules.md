# Rules.md — AI Coding Rules and Guidelines

## 1. Source of Truth
- Follow `PRD.md` for requirements and `Architecture.md` for system boundaries.
- Preserve the exact five product names, prices, IDs, and initial stock.
- If requirements conflict, stop and identify the conflict instead of silently changing product behavior.
- Do not add out-of-scope authentication, payments, or deployment work.

## 2. Working Style
- Inspect existing files before creating or overwriting anything.
- Make the smallest coherent implementation that meets the requirements.
- Build real working code, not just plans, pseudocode, mockups, or placeholder handlers.
- Keep code clear enough for a junior developer to explain in an interview.
- Prefer simple functions and components over unnecessary abstractions.
- Do not add dependencies unless they solve a clear requirement.
- Never delete user work without checking its purpose.

## 3. Frontend Rules
- Fetch products from the backend; do not hard-code a separate frontend catalogue as the production data source.
- Use `localStorage` only for cart persistence.
- Validate and safely parse saved cart data.
- Show loading, empty, success, and error states.
- Disable purchasing when stock is zero.
- Enforce stock limits in the UI for usability, while recognizing the backend remains authoritative.
- Disable checkout while a request is pending.
- Clear the cart only after confirmed order success.
- Use accessible labels, semantic HTML, and visible focus states.
- Keep the UI responsive on small screens.

## 4. Backend Rules
- The backend owns prices, stock, and order totals.
- Never trust client-provided price, subtotal, or grand total.
- Validate all order items before changing inventory.
- Accept only known product IDs and positive integer quantities.
- Reject empty orders and insufficient stock.
- Failed requests must not partially change stock.
- Generate unique order IDs.
- Store order snapshots with product name and unit price.
- Return consistent JSON errors and appropriate status codes.
- Do not expose stack traces or internal paths in API responses.
- Document persistence and concurrency limitations honestly.

## 5. Code Quality
- Use meaningful variable and function names.
- Keep API access in a dedicated client helper where practical.
- Avoid duplicated business rules.
- Keep formatting consistent.
- Remove debug logs and unused imports before final delivery.
- Do not leave core TODOs, fake success responses, or dead buttons.
- Do not claim features work unless verified.

## 6. Error Handling
- Inspect the actual error before changing code.
- Fix the underlying cause rather than hiding the error.
- After a fix, rerun the failing command or test.
- Give users actionable messages without leaking internals.
- Handle network failures, malformed JSON, unknown order IDs, and stock conflicts.

## 7. Testing Rules
- Verify product API output and initial stock.
- Test valid and invalid order creation.
- Confirm stock remains unchanged after rejected orders.
- Test that server prices override client-supplied values.
- Test order lookup for existing and missing IDs.
- Test cart quantity boundaries and localStorage refresh behavior.
- Test checkout pending/error/success states.
- Run a frontend build if practical.
- Distinguish tests actually executed from tests merely recommended.

## 8. AI Honesty
- Record which AI tool was actually used.
- Include real prompts, actual errors, and actual fixes in README.
- Never invent test results, screenshots, AI tools, or debugging history.
- Explain generated code and important design decisions so the developer can defend them in an interview.
