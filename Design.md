# Design.md — UI/UX Design Guidelines

## 1. Design Goal
Create a clean, modern storefront that is easy to use and quick to understand. Correct functionality is more important than decorative effects because the assignment is time-limited.

## 2. Layout
- Mobile-first responsive design.
- Simple top header with store name and cart item count.
- Search field near the top of the product area.
- Responsive product grid that becomes a single column on narrow screens.
- Cart section or panel with items, quantity controls, line totals, and grand total.
- Clear checkout action.
- Dedicated success confirmation after an order is placed.

## 3. Product Cards
Each product card should show:
- Product name.
- Price formatted in INR.
- Stock count or clear availability status.
- Add to Cart button.
- Disabled button and visible “Out of stock” status for zero-stock products.

Keep card heights and spacing consistent. Do not hide essential product information behind hover-only interactions.

## 4. Cart Experience
- Show product name, unit price, quantity, and line subtotal.
- Provide clear decrease, increase, and remove controls.
- Disable increase when available stock is reached.
- Keep grand total visually easy to find.
- Show an explanatory empty-cart state.
- During checkout, show a pending state and disable repeat submissions.

## 5. Order Confirmation
After a successful order, display:
- A clear success heading.
- Unique order ID.
- Ordered product names.
- Quantities and unit prices.
- Final server-calculated total.
- A way to return to browsing or start a new cart.

Do not display a success state for failed or unconfirmed API requests.

## 6. Visual System
Use a restrained palette and consistent spacing. Suggested starting tokens (adjust if needed):
- Page background: `#f8fafc`
- Surface/card: `#ffffff`
- Primary text: `#172033`
- Secondary text: `#64748b`
- Primary action: `#2563eb`
- Success: `#15803d`
- Error: `#b91c1c`
- Border: `#e2e8f0`
- Border radius: 10–14px
- Spacing scale: 4, 8, 12, 16, 24, 32px

Use a readable system font stack. Maintain consistent button styles, input heights, border radii, and spacing.

## 7. Responsive Rules
- Avoid fixed page widths.
- Use CSS grid/flex layouts with sensible minimum widths.
- On small screens, stack cart and product sections if needed.
- Buttons should be easy to tap.
- Ensure product names, INR values, and order IDs wrap without horizontal overflow.
- Test around 320px, 375px, 768px, and desktop widths if possible.

## 8. Accessibility
- Use semantic headings, buttons, forms, and labels.
- Give search and quantity controls accessible names.
- Ensure visible keyboard focus.
- Do not rely on color alone to communicate stock or error status.
- Use adequate contrast.
- Announce important errors and checkout results accessibly where practical.

## 9. Interaction States
Design and implement:
- Initial loading.
- API failure.
- No search matches.
- Empty cart.
- Out-of-stock product.
- Maximum quantity reached.
- Checkout pending.
- Order success.
- Order failure.

## 10. Avoid
- Excessive animations.
- Decorative elements that distract from ordering.
- Fake buttons or interactions.
- Success messages unsupported by the backend.
- Desktop-only layouts.
- Visual polish that risks breaking core functionality.
