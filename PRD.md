# PRD.md — Project Requirements Document

## 1. Project Overview
**Project:** Mini E-Commerce Ordering Application  
**Purpose:** Build a working, mobile-responsive e-commerce app using AI-assisted development.  
**Users:** Customers who browse products, manage a cart, and place orders.

The application includes product listing/search, cart management, backend order APIs, stock validation, order confirmation, and documentation. Authentication, payments, and deployment are out of scope.

## 2. Goals and Success Criteria
- Show all five required products with correct INR prices and stock.
- Search products by name.
- Add, remove, and change cart quantities within stock limits.
- Persist cart contents through refresh using `localStorage`.
- Fetch products and submit orders through the Express API.
- Validate product IDs and quantities on the backend.
- Calculate totals on the server and reject invalid or out-of-stock orders.
- Reduce stock only after a valid order succeeds.
- Generate a unique order ID and support order lookup.
- Display clear confirmation and error states.
- Prevent duplicate checkout clicks while a request is pending.
- Include a README with setup, AI-use notes, encountered errors, and improvements.

## 3. Technology Stack
- Frontend: React + Vite
- Language: JavaScript
- Backend: Node.js + Express
- Styling: CSS with responsive media queries
- Cart persistence: browser `localStorage`
- Backend data: in-memory or JSON file
- API: JSON over HTTP
- Tools: npm and Git

## 4. Product Catalogue
Seed these exact products:

| ID | Product | Price (INR) | Initial stock |
|---|---|---:|---:|
| mouse | Wireless Mouse | 799 | 10 |
| keyboard | Mechanical Keyboard | 2499 | 5 |
| hub | USB-C Hub | 1299 | 15 |
| speaker | Bluetooth Speaker | 1999 | 0 |
| stand | Laptop Stand | 899 | 8 |

Use integer INR amounts. Bluetooth Speaker must be displayed as out of stock and cannot be purchased.

## 5. Functional Requirements

### 5.1 Product Listing and Search
- Fetch catalogue from `GET /api/products`.
- Display name, INR price, availability, stock, and Add to Cart.
- Search by product name, case-insensitively.
- Disable Add to Cart for zero-stock products.
- Show loading, empty-search, and API-error states.
- Support mobile, tablet, and desktop screens.

### 5.2 Shopping Cart
- Add and remove products.
- Increase and decrease quantities.
- Do not allow quantities below one or above known available stock.
- Calculate line subtotals and grand total dynamically.
- Persist and restore the cart using `localStorage`.
- Validate stored cart data and handle malformed data safely.
- Reconcile cart quantities if current server stock changes.
- Show a clear empty-cart state.

### 5.3 Backend API

#### `GET /api/products`
Return current product data and stock in JSON.

#### `POST /api/orders`
Example request:
```json
{
  "items": [
    { "productId": "mouse", "quantity": 2 },
    { "productId": "stand", "quantity": 1 }
  ]
}
```
Requirements:
- Reject empty or malformed item lists.
- Validate product IDs and positive integer quantities.
- Reject unknown IDs and insufficient stock.
- Reject duplicate product IDs or normalize them consistently.
- Calculate prices and totals using server catalogue data; never trust client prices/totals.
- Validate every item before changing any stock.
- Reduce stock and save the order only after validation succeeds.
- Generate a unique order ID.
- Save an order snapshot containing product names, unit prices, quantities, line totals, total, and timestamp.
- Use appropriate HTTP status codes, such as 201 success, 400 invalid input, 404 missing resource, and 409 stock conflict.
- Prevent overselling to the extent supported by the chosen storage strategy.
- Document in-memory storage limitations, including restart persistence.

#### `GET /api/orders/:id`
Return the matching order or a 404 response if it does not exist.

### 5.4 Order Confirmation
- Submit via `POST /api/orders`.
- Disable checkout while the request is pending.
- Prevent rapid duplicate submissions from the same UI action.
- On success, show order ID, products, quantities, and total.
- Clear cart only after confirmed API success.
- On failure, preserve cart and show a useful message.

## 6. UI/UX Requirements
- Clean, responsive storefront.
- Header, search, product cards/grid, INR prices, stock labels, cart count, quantity controls, checkout, and order confirmation.
- Semantic HTML, accessible labels, visible keyboard focus, sufficient contrast.
- No horizontal overflow on narrow mobile screens.
- Include loading, empty, success, and error states.
- Keep styling lightweight and avoid unnecessary animations.

## 7. Suggested Structure
```text
mini-ecommerce/
├── client/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── components/
│       │   ├── ProductList.jsx
│       │   ├── ProductCard.jsx
│       │   ├── Cart.jsx
│       │   └── OrderConfirmation.jsx
│       └── styles.css
├── server/
│   ├── server.js
│   ├── routes/
│   │   ├── products.js
│   │   └── orders.js
│   └── data/
│       └── store.json
├── PRD.md
├── Architecture.md
├── Rules.md
├── Phases.md
├── Design.md
├── Memory.md
├── README.md
└── .gitignore
```

## 8. Data Models

### Product
```json
{ "id": "mouse", "name": "Wireless Mouse", "price": 799, "stock": 10 }
```

### Order
```json
{
  "id": "order-unique-id",
  "items": [
    {
      "productId": "mouse",
      "name": "Wireless Mouse",
      "unitPrice": 799,
      "quantity": 2,
      "lineTotal": 1598
    }
  ],
  "total": 1598,
  "createdAt": "ISO-8601 timestamp"
}
```
Store a snapshot of names and prices so later catalogue changes do not rewrite old orders.

## 9. Validation and Error Handling
- Server-side validation is authoritative.
- Never trust browser-provided price or total.
- Use consistent errors, for example:
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 1 unit of Wireless Mouse is available."
  }
}
```
- Handle network errors, malformed requests, bad localStorage data, unknown order IDs, and stock conflicts.
- Log diagnostic details on the server without exposing stack traces to the client.
- Failed orders must not partially reduce stock.
- Configure CORS only for the required development origin.

## 10. Non-Functional Requirements
- Mobile-first responsive UI.
- Readable, modular code.
- Predictable API responses.
- App runs locally using documented commands.
- Add simple automated tests or a repeatable manual checklist.
- No authentication, payment, or deployment required.

## 11. Acceptance Tests
1. `GET /api/products` returns five products with exact initial prices and stock.
2. Search for “mouse” shows Wireless Mouse, case-insensitively.
3. Bluetooth Speaker cannot be added.
4. Add/remove and quantity changes update totals correctly.
5. Quantity cannot exceed stock.
6. Cart survives a browser refresh.
7. A valid order returns 201, a unique ID, server totals, and reduces stock.
8. Unknown product IDs are rejected without stock changes.
9. Invalid quantities (zero, negative, fractional, missing, malformed) are rejected without stock changes.
10. Insufficient stock is rejected without stock changes.
11. Fake client prices/totals are ignored.
12. Existing order lookup succeeds; unknown order lookup returns 404.
13. Repeated checkout clicks do not duplicate an in-flight UI submission.
14. Failed checkout preserves the cart.
15. Layout works on narrow mobile screens.
16. README setup commands work from a clean checkout.

## 12. Development Plan
1. Set up frontend/backend.
2. Implement product API and seed data.
3. Implement and test order validation and stock management.
4. Build product listing/search.
5. Build cart, stock limits, totals, and localStorage.
6. Connect checkout and confirmation/error states.
7. Run acceptance tests and prepare README/screenshots.

## 13. README and AI Documentation
Document the actual AI tools used, 2–3 prompts actually used, which portions were AI-assisted, real errors and fixes, run instructions, tests, limitations, and possible improvements. Do not fabricate tool usage or debugging history.

## 14. Out of Scope
Authentication, payments, shipping/taxes/coupons/returns, admin dashboard, production deployment, and a production database unless added as optional improvements.

## 15. Definition of Done
Core acceptance tests pass, frontend and backend run with documented commands, source code is ready to submit, and documentation honestly describes the implementation and remaining limitations.
