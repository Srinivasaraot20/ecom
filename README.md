# Orbit Supply — Mini E-Commerce Storefront

A responsive desk-accessories storefront built around the **Orbit Supply** brand. The project focuses on a clean white-and-blue shopping experience, searchable product discovery, live inventory, cart management, and server-validated order placement.

> **Important:** This README documents the intended project workflow and the API contract reflected in the current project brief. Before publishing, verify the actual scripts, ports, environment variables, routes, and database configuration against the repository's `package.json`, backend source, and environment files. Do not commit API keys, passwords, or other secrets.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Goals](#goals)
- [Features](#features)
- [User Journey](#user-journey)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Contract](#api-contract)
- [Product Catalogue](#product-catalogue)
- [Cart and Pricing Rules](#cart-and-pricing-rules)
- [Checkout and Order Validation](#checkout-and-order-validation)
- [UI and Responsive Design](#ui-and-responsive-design)
- [Accessibility](#accessibility)
- [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
- [Testing and Build Verification](#testing-and-build-verification)
- [Security Notes](#security-notes)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**Orbit Supply** is a small e-commerce demonstration store for desk essentials such as computer mice, keyboards, USB-C hubs, speakers, and laptop stands. The frontend is designed to be straightforward, responsive, and easy to navigate on both desktop and mobile screens.

The intended experience combines familiar marketplace patterns—prominent search, category navigation, product filters, product cards, a persistent cart, and a clear checkout flow—while retaining an original Orbit Supply visual identity.

### Brand and visual direction

- **Brand:** Orbit Supply
- **Tagline:** Desk essentials
- **Primary colour:** `#155DFC`
- **Page style:** White surfaces, light blue-gray backgrounds, subtle borders, rounded cards, and readable dark text
- **Design priority:** Usability, clear product information, responsive layout, and reliable backend behaviour
- **Reference influence:** Common shopping usability patterns from large e-commerce marketplaces; do not copy their logos, assets, or proprietary layouts

## Goals

1. Make the product catalogue easy to browse and search.
2. Show accurate product prices and stock availability.
3. Prevent users from adding unavailable products or exceeding available stock.
4. Keep cart quantities and totals understandable.
5. Validate prices, stock, and order totals on the server.
6. Provide clear loading, empty, success, and failure states.
7. Deliver a mobile-first interface without horizontal overflow.
8. Keep the code maintainable through reusable UI components and clear API boundaries.

## Features

### Product discovery

- Product catalogue loaded from the backend API.
- Search by product name.
- Category navigation.
- Sort by recommendation/default order, price ascending, and price descending.
- Optional “in stock only” filter.
- Minimum and maximum price filters.
- Clear feedback when no products match.
- Loading and retry states when the catalogue cannot be retrieved.

### Product cards

Each card should display, when supplied by the backend:

- Product image and accessible alternative text.
- Product name and short description.
- Price formatted in Indian rupees (INR).
- Availability and stock count.
- Add-to-cart action.
- A disabled purchase action when the product is out of stock.

Do not display invented ratings, reviews, discounts, delivery promises, or “best seller” claims unless the application has real data supporting them.

### Shopping cart

- Add a product to the cart.
- Increase and decrease item quantities.
- Remove individual items.
- Clear the cart after confirmation if a confirmation interaction is implemented.
- Show line subtotals, cart subtotal, shipping, and total.
- Prevent quantities from exceeding available stock.
- Persist the cart locally if the current implementation supports it.
- Keep cart totals derived from current cart state; never hard-code the example total from a screenshot.

### Checkout and order confirmation

- Collect only the delivery details required by the application.
- Show an order summary before submission.
- Prevent duplicate submissions while a request is pending.
- Ask the backend to validate stock and calculate the final total.
- Show a success page only after a confirmed successful response.
- Display the returned order identifier and server-calculated total.
- Preserve the cart and show an actionable error if order creation fails.

### Future/optional features

These should be treated as roadmap items unless they already exist in the repository:

- Product detail pages.
- Wishlist.
- Account registration and sign-in.
- Customer order history and order tracking.
- Address book.
- Product image gallery.
- Related products.
- Admin inventory management.
- Coupons, reviews, and ratings backed by real data.

---

## User Journey

1. The visitor opens the storefront.
2. The frontend requests the current product catalogue.
3. The visitor searches, filters, sorts, or browses categories.
4. The visitor adds an available product to the cart.
5. The cart shows selected products, quantities, and calculated totals.
6. The visitor proceeds to checkout and provides required information.
7. The frontend submits the order request.
8. The backend validates the request, checks current stock, calculates the total, and creates the order if valid.
9. The frontend displays the server-confirmed result.
10. If the request fails, the frontend explains the problem and allows the user to recover.

---

## Technology Stack

The project brief identifies the following architecture:

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | UI components and client-side state |
| Frontend tooling | Vite | Development server and production build |
| Styling | CSS / project styling system | Responsive layout, colours, spacing, and interaction states |
| Backend | Express API | Product and order endpoints |
| Data source | Existing backend storage | Authoritative product, stock, and order data |
| Browser storage | `localStorage`, if implemented | Optional cart persistence |

**Verify the actual repository before treating this table as a complete dependency inventory.** The exact database, icon library, CSS framework, test runner, and package versions must be taken from the installed project files.

## Architecture

The application should keep a clear separation between the user interface and business rules.

```text
Browser
  |
  v
React + Vite storefront
  |-- Header and category navigation
  |-- Hero banner
  |-- Search, filters, and sorting
  |-- Product grid and product cards
  |-- Cart panel or cart page
  |-- Checkout form
  |-- Order confirmation
  |
  | HTTP requests
  v
Express API
  |-- GET  /api/products
  |-- POST /api/orders
  |-- GET  /api/orders/:id  (if implemented)
  |
  v
Existing data store
  |-- Products and stock
  |-- Orders
```

The frontend may provide a convenient display of prices and stock, but the backend must remain authoritative for order creation. Client-side checks improve usability; they do not replace server-side validation.

## Project Structure

The exact structure depends on the current repository. A maintainable arrangement could look like this:

```text
orbit-supply/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── CategoryNavigation.jsx
│       │   ├── HeroBanner.jsx
│       │   ├── ProductCard.jsx
│       │   ├── ProductFilters.jsx
│       │   └── CartPanel.jsx
│       ├── pages/
│       │   ├── ProductListingPage.jsx
│       │   ├── ProductDetailsPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderConfirmationPage.jsx
│       │   ├── OrdersPage.jsx
│       │   ├── WishlistPage.jsx
│       │   └── AccountPage.jsx
│       ├── services/
│       │   └── api.js
│       ├── hooks/
│       ├── context/
│       ├── styles/
│       └── assets/
└── backend/
    ├── package.json
    └── src/
        ├── server.js
        ├── routes/
        ├── controllers/
        ├── services/
        ├── middleware/
        └── data/
```

This is a **suggested structure, not a claim about the current files**. Do not move or duplicate files just to match this example. Adapt documentation to the repository's actual structure.

---

## Requirements

- A supported Node.js LTS release compatible with the project's installed dependencies.
- npm, or the package manager already used by the repository.
- A modern browser.
- The project source code and its dependency lockfiles.
- Any required backend data store configured by the existing application.

Check installed versions:

```bash
node --version
npm --version
```

Use the Node.js version specified by the repository or deployment platform if one is already documented.

## Installation and Setup

### 1. Open the project folder

```bash
cd path/to/orbit-supply
```

Replace the example path with the actual project location.

### 2. Install dependencies

If the root folder contains the applicable `package.json`:

```bash
npm install
```

If the frontend and backend have separate package files, install dependencies in each application directory:

```bash
cd frontend
npm install

cd ../backend
npm install
```

Run commands only for directories that actually exist in your repository. Prefer the package manager and lockfile already used by the project.

### 3. Configure environment variables

Review the backend and frontend configuration before creating environment files. Never copy real secrets into `.env.example` or commit a populated `.env` file.

An example frontend Vite configuration may look like this:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

This value is an example only. Use the backend's actual port and base URL. Vite exposes variables prefixed with `VITE_` to browser code, so **never put private API keys, database credentials, or secrets in a `VITE_` variable**.

The backend may require a separate `.env` file for its port, database connection, and other server-side settings. Document those keys based on the actual backend source.

## Running the Application

The exact npm scripts are defined by each `package.json`. Inspect them first:

```bash
npm run
```

For a typical split frontend/backend project, the commands may be similar to the following.

### Start the backend

```bash
cd backend
npm run dev
```

Use this command only if the backend's `package.json` defines a `dev` script. Otherwise, use the script that is actually provided.

### Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Vite commonly prints a local address such as `http://localhost:5173`. Open the exact URL printed in the terminal.

### Verify the API separately

If the backend is expected to expose the product route, test it using a browser or an HTTP client:

```text
GET http://localhost:3000/api/products
```

Replace port `3000` with the configured backend port. A successful response should contain the product data in the shape expected by the frontend.

**Do not assume the app is working simply because Vite starts.** The frontend and backend are separate processes in a split setup, and both must be running and configured to communicate.

---

## API Contract

The following routes are the expected contract reflected in the current project brief. Confirm their implementation and exact response shapes in the backend source.

### `GET /api/products`

Returns the current catalogue.

Example response shape (illustrative):

```json
{
  "products": [
    {
      "id": "mouse",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse for comfortable work.",
      "price": 799,
      "stock": 10,
      "category": "keyboards-mice",
      "imageUrl": "/images/wireless-mouse.webp"
    }
  ]
}
```

The real API may return an array directly or use different field names. Match the frontend to the actual response instead of blindly adopting this sample.

Expected behaviour:

- Return current products and stock.
- Use consistent field types and identifiers.
- Return a meaningful HTTP error status if retrieval fails.
- Avoid exposing internal errors or stack traces to customers.

### `POST /api/orders`

Creates an order after server-side validation.

Illustrative request:

```json
{
  "items": [
    {
      "productId": "mouse",
      "quantity": 1
    }
  ]
}
```

The server should look up each product using its trusted data source, verify that the requested quantity is a positive integer, ensure stock is sufficient, calculate prices and totals on the server, and create the order only if validation succeeds.

Illustrative success response:

```json
{
  "order": {
    "id": "server-generated-order-id",
    "items": [
      {
        "productId": "mouse",
        "name": "Wireless Mouse",
        "unitPrice": 799,
        "quantity": 1,
        "lineTotal": 799
      }
    ],
    "total": 799,
    "status": "confirmed"
  }
}
```

This response is an example of a useful contract, not a guarantee that the current API uses these exact fields.

### `GET /api/orders/:id`

This route is optional and must be documented as available only if the backend implements it. If provided, it should return an order belonging to the authenticated or otherwise authorized customer.

### API error behaviour

The frontend should handle:

- Network failures and unreachable backend.
- Non-success HTTP responses.
- Invalid or unexpected response data.
- Product stock changes between catalogue loading and checkout.
- Invalid checkout input.
- Duplicate checkout attempts.
- Expired or unauthorized access, if accounts are implemented.

Do not replace a failed live request with fake products without clearly indicating that the data is a demo or fallback.

---

## Product Catalogue

The initial reference catalogue contains five desk accessories:

| Product | Reference price | Reference stock | Category |
|---|---:|---:|---|
| Wireless Mouse | ₹799 | 10 | Keyboards & mice |
| Mechanical Keyboard | ₹2,499 | 5 | Keyboards & mice |
| USB-C Hub | ₹1,299 | 15 | Laptop accessories |
| Bluetooth Speaker | ₹1,999 | 0 | Audio |
| Laptop Stand | ₹899 | 8 | Laptop accessories |

These are the values in the supplied UI brief. The live backend remains the source of truth; do not hard-code this table into the application if products are fetched from the API.

### Filtering and sorting

- Search should match relevant product text and handle empty input.
- Category filters should be composable with search and other filters.
- “In stock only” should exclude products with no available stock.
- Price filters should reject invalid negative values and handle a minimum greater than the maximum.
- Sorting should be deterministic and should not mutate the original source array unexpectedly.
- A “clear filters” action should reset all active filter values.
- The product count should reflect the visible results when filters are applied.

### Product imagery

- Use consistent image aspect ratios and predictable card heights.
- Provide meaningful `alt` text.
- Use optimized image assets where possible.
- Prevent images from stretching or breaking card layouts.
- Do not claim that product images represent exact supplied models unless verified.

---

## Cart and Pricing Rules

1. The cart should identify products using stable product IDs, not display names.
2. Quantity must be a positive integer.
3. A user must not be able to increase a quantity above currently known stock.
4. The server must re-check stock during order creation because inventory can change after the page loads.
5. Calculate each line subtotal as `unit price × quantity`.
6. Calculate the cart subtotal from the line subtotals.
7. Show shipping charges only according to the actual application rules. If shipping is free, make that rule explicit and consistent.
8. Calculate the final order total on the server.
9. Never trust a client-submitted total or unit price.
10. Clear the cart only after receiving a confirmed successful order response.

Use `Intl.NumberFormat` for INR display:

```javascript
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

inrFormatter.format(799);
```

For money calculations, avoid relying on floating-point arithmetic for fractional currency values if the application later supports paise. Use integer paise or a suitable decimal-money strategy where needed.

---

## Checkout and Order Validation

A reliable checkout should follow this sequence:

1. Validate required form fields in the browser for immediate feedback.
2. Disable the submit button while the request is in progress.
3. Send product IDs and quantities rather than trusting client prices.
4. Validate product existence, stock, quantity, and current price on the server.
5. Calculate the total using trusted server data.
6. Save the order and update stock atomically where the data store supports transactions.
7. Return a success response only after the order is actually created.
8. Show the server-generated order ID and confirmed total.
9. Preserve the cart and explain the failure if the request is rejected.

If inventory can be modified by concurrent orders, stock validation and decrement should be performed atomically or in a transaction to prevent overselling.

---

## UI and Responsive Design

### Main visual components

- Brand header with search, wishlist/account links if implemented, and cart count.
- Category navigation.
- Hero banner with the text “Small upgrades. Better workdays.”
- Product catalogue heading and result count.
- Search and filter controls.
- Responsive product grid.
- Cart panel or cart page.
- Footer with real navigation destinations.

### Responsive behaviour

Test at least these viewport widths:

| Width | Target |
|---:|---|
| 320px | Very narrow mobile |
| 375px | Common mobile width |
| 430px | Large mobile |
| 768px | Tablet |
| 1024px | Small desktop/laptop |
| 1440px | Wide desktop |

Guidelines:

- Use CSS Grid and Flexbox rather than fixed page widths.
- Use `minmax(0, 1fr)` where grid children might otherwise overflow.
- Use responsive font sizing and spacing.
- On mobile, stack or rearrange the cart and catalogue.
- Keep the hero text readable; do not shrink the entire desktop banner into a tiny image.
- Use a mobile-specific banner crop or stacked hero layout if needed.
- Keep buttons and inputs easy to tap.
- Ensure long product names and order IDs wrap without causing horizontal scrolling.
- Verify keyboard focus and error messages on narrow screens as well as desktop.

### Banner behaviour

The hero should preserve the desktop split composition where space allows. On mobile, use a layout that keeps the heading, subtitle, desk image, and feature indicators readable. Avoid fixed heights that crop important content, and do not stretch the source image.

---

## Accessibility

- Use semantic landmarks, headings, buttons, forms, and labels.
- Give search, quantity controls, wishlist actions, and icon-only buttons accessible names.
- Maintain visible keyboard focus.
- Use text as well as colour to communicate stock and errors.
- Announce important loading, error, and checkout results where practical.
- Ensure sufficient contrast.
- Respect the user's reduced-motion preference.
- Ensure interactive controls are reachable and usable without a mouse.

---

## Error Handling and Troubleshooting

### 1. “We couldn't load the products”

**Likely areas to investigate:**

- Is the backend process running?
- Does the frontend use the correct API base URL and port?
- Does the product route exist?
- Does the route return the response shape expected by React?
- Is a CORS policy blocking the request?
- Is an environment variable missing or incorrectly named?
- Is the backend returning an error status?

**Diagnostic workflow:**

1. Check the frontend browser console and Network panel.
2. Inspect the failed product request URL and HTTP status.
3. Test the product endpoint directly with a browser or HTTP client.
4. Read the backend terminal for the matching request and error.
5. Correct the actual cause rather than hiding the error UI.
6. Retry the request and confirm products load from the backend.

### 2. CORS error

If frontend and backend use different origins, the backend must allow the intended frontend origin. Configure CORS in the backend using the actual local and deployed origins. Do not disable browser security or allow every origin indiscriminately in production.

### 3. Wrong API port

Check the port printed by the backend and compare it with the frontend API base URL. Update the relevant environment configuration instead of hard-coding inconsistent URLs across components.

### 4. Checkout fails because stock changed

This can be expected when another order changes inventory. Show a clear message, refresh the catalogue or cart stock, and allow the customer to review the updated quantities.

### 5. Blank page

- Check browser console errors.
- Check the Vite terminal for compile errors.
- Verify the entry file and root component.
- Confirm imports and asset paths are valid.
- Check that asynchronous API errors are handled rather than crashing rendering.
- Run the production build to identify compile-time problems.

### 6. Mobile banner is unreadable

- Inspect the rendered image dimensions and CSS.
- Check whether the desktop composition is simply being scaled down.
- Introduce a mobile-specific crop or stacked layout.
- Verify heading and feature labels at 320px and 375px.
- Check for overflow and avoid fixed heights that clip text.

---

## Testing and Build Verification

Run the test scripts actually provided by the repository. The following commands are common examples; a command may not exist if the project does not define it.

```bash
npm run
npm run build
npm test
```

If frontend and backend are separate packages, run the applicable build and test commands in each directory.

### Functional test checklist

- [ ] Product catalogue loads from the live API.
- [ ] API failure displays a useful retry state.
- [ ] Search returns the expected matching products.
- [ ] Category filtering works.
- [ ] In-stock filtering excludes zero-stock products.
- [ ] Minimum and maximum price filters work together.
- [ ] Sorting works for each supported option.
- [ ] Out-of-stock products cannot be added to the cart.
- [ ] Quantity cannot exceed available stock.
- [ ] Cart subtotal and total update correctly.
- [ ] Removing an item updates the cart.
- [ ] Refresh behaviour matches the intended cart persistence.
- [ ] Checkout prevents duplicate submissions.
- [ ] The server validates stock and calculates the total.
- [ ] A success page appears only after confirmed order creation.
- [ ] Failed checkout preserves the cart and explains the error.
- [ ] Layout works at 320px, 375px, 430px, 768px, 1024px, and 1440px.
- [ ] No horizontal overflow is present.
- [ ] Keyboard focus and accessible labels are usable.

Record which checks were actually performed. Do not mark tests as passing just because they are listed here.

---

## Security Notes

- Never commit `.env` files containing secrets.
- Never expose private API keys or database credentials in frontend code.
- Validate and normalize all server inputs.
- Calculate prices and totals on the backend.
- Check stock at order time.
- Add authentication and authorization before exposing customer-specific orders or account details.
- Avoid returning stack traces or internal configuration to users.
- Use HTTPS in production.
- Configure CORS for trusted origins.
- Apply appropriate rate limits and request-size limits to public endpoints.
- Do not store payment card data in this demo. Use a compliant payment provider if online payments are added.
- Treat local storage as user-controlled data; never trust it for prices, stock, permissions, or order confirmation.

---

## Development Workflow

1. Read the project requirements and architecture documents before making changes.
2. Inspect the existing source code and installed agent skills.
3. Reproduce the issue before editing.
4. Identify the responsible component or API layer.
5. Make the smallest coherent change that preserves working behaviour.
6. Run linting, tests, and the production build when available.
7. Test important user flows in a browser when browser tools are available.
8. Update this README when setup commands, routes, features, or architecture change.
9. Report actual files changed, tests executed, and remaining limitations.

### Documentation that may accompany this project

- `PRD.md` — product requirements and scope.
- `Architecture.md` — system architecture and folder structure.
- `Rules.md` — coding rules and agent boundaries.
- `Phases.md` — staged implementation plan.
- `Design.md` — UI and responsive design guidelines.
- `Memory.md` — current development progress and next steps.
- `README.md` — project overview, setup, API contract, usage, and troubleshooting.

Keep each document focused on its purpose and update related documents when a change affects them.

---

## Roadmap

Potential future improvements, subject to project scope:

- [ ] Complete and verify all product-listing interactions.
- [ ] Complete responsive banner behaviour.
- [ ] Add product detail pages.
- [ ] Add a wishlist backed by appropriate state or storage.
- [ ] Add account authentication if required.
- [ ] Add order history and order detail views.
- [ ] Add server-side pagination if the catalogue grows.
- [ ] Add product image optimization and loading placeholders.
- [ ] Add automated API and UI tests.
- [ ] Add structured logging and production monitoring.
- [ ] Add an admin interface for catalogue and stock management if needed.

Do not present roadmap items as implemented features until they are complete and verified.

## Contributing

When contributing:

1. Follow the existing code style and project architecture.
2. Keep changes focused and reusable.
3. Avoid introducing dependencies without a clear reason.
4. Preserve the server as the source of truth for product availability and order totals.
5. Test relevant desktop and mobile states.
6. Update documentation to reflect actual behaviour.
7. Never commit secrets, generated credentials, or private customer information.

## License

No license has been specified in this README. Add the correct license only after the project owner chooses one. Until then, do not assume that the project is open source or that reuse is permitted.
