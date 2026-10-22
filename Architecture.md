# Architecture.md — Application Architecture

## 1. Overview
Use a small client-server architecture:
- **React + Vite client** renders products, search, cart, checkout, and confirmation.
- **Node.js + Express server** owns the product catalogue, stock validation, order totals, and order records.
- **Browser localStorage** persists only the customer's cart between refreshes.
- **Server-side JSON or in-memory storage** stores products and orders.

The backend is the source of truth for price, stock, and order success.

## 2. Request Flow
1. React requests `GET /api/products`.
2. Express returns the current product catalogue.
3. The customer searches and adds products to the local cart.
4. Cart changes update the UI and localStorage.
5. Checkout sends product IDs and quantities to `POST /api/orders`.
6. Express validates the entire request against current server data.
7. If valid, Express calculates totals, reduces stock, stores the order, and returns its ID and details.
8. React clears the cart only after a successful response and displays confirmation.
9. Order details can be retrieved with `GET /api/orders/:id`.

## 3. Responsibilities

### Frontend
- `App.jsx`: top-level state and page composition.
- `api.js`: fetch wrapper and API error handling.
- `ProductList.jsx`: catalogue display and search.
- `ProductCard.jsx`: product availability and Add to Cart action.
- `Cart.jsx`: quantity changes, removal, and totals.
- `OrderConfirmation.jsx`: order result.
- `styles.css`: responsive presentation.

### Backend
- `server.js`: Express setup, middleware, routes, and error handling.
- Product route: catalogue retrieval.
- Order route: order creation, validation, stock updates, and order lookup.
- Data module/file: seeded products and saved orders.

Keep business logic separate from presentation where practical, but avoid overengineering for this short assignment.

## 4. API Contracts

### GET `/api/products`
Success: `200 OK`
```json
{
  "products": [
    { "id": "mouse", "name": "Wireless Mouse", "price": 799, "stock": 10 }
  ]
}
```
The example shows one item for brevity; return all five products.

### POST `/api/orders`
Request:
```json
{
  "items": [
    { "productId": "mouse", "quantity": 2 }
  ]
}
```
Success: `201 Created`
```json
{
  "order": {
    "id": "unique-order-id",
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
}
```

### GET `/api/orders/:id`
- `200 OK` with `{ "order": { ... } }` when found.
- `404 Not Found` with a consistent error object when absent.

### Error format
```json
{
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be a positive integer."
  }
}
```

## 5. Validation and Inventory Safety
- Validate request shape, IDs, and positive integer quantities.
- Use server product prices, never client-supplied totals.
- Validate all requested items before mutating any stock.
- Reject insufficient stock with `409 Conflict`.
- Update stock and save the order as one logical operation.
- Prevent duplicate UI submission while a request is pending.
- If using in-memory storage, data resets on server restart and does not support multi-process inventory coordination. If using JSON storage, write carefully and document that a simple file store is not a production-grade transactional database.

## 6. Environment and Local Development
- Client and server use separate `package.json` files.
- Client calls the backend using a configurable API base URL, with a documented local default.
- Enable CORS for the local client origin only as needed.
- Keep secrets out of source control; no secrets should be needed for this assignment.

## 7. Architecture Decisions
- React + Vite provides quick local startup.
- Express keeps the API small and easy to explain.
- localStorage is suitable for the browser cart, not authoritative stock.
- Server-side calculations prevent client tampering with prices.
- Minimal dependencies reduce setup risk during the 90-minute assignment.
