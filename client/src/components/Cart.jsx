import { forwardRef } from 'react';
import { formatINR, getCartSummary } from '../cart.js';
import ProductIcon from './ProductIcon.jsx';
import { PRODUCT_IMAGES } from '../productImages.js';

function EmptyCartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width="36"
      height="36"
    >
      <circle cx="8" cy="21" r="1.5" />
      <circle cx="19" cy="21" r="1.5" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

const Cart = forwardRef(function Cart(
  {
    cart,
    products,
    catalogueStatus,
    checkoutStatus,
    checkoutError,
    onIncrease,
    onDecrease,
    onRemove,
    onClearCart,
    onCheckout,
    onBrowse,
  },
  ref
) {
  const summary = getCartSummary(cart, products);
  const pending = checkoutStatus === 'submitting';
  const hasItems = summary.lines.length > 0;

  return (
    <aside
      className="cart-panel"
      id="cart"
      aria-labelledby="cart-heading"
      aria-busy={pending}
      ref={ref}
      tabIndex={-1}
    >
      <div className="cart-head">
        <div className="cart-head-title">
          <h2 id="cart-heading">Your cart</h2>
          <span className="cart-count-badge" aria-label={`${summary.itemCount} items in cart`}>
            {summary.itemCount}
          </span>
        </div>
        {hasItems && onClearCart && (
          <button
            type="button"
            className="clear-cart-link"
            onClick={onClearCart}
            disabled={pending}
            aria-label="Clear all items from cart"
          >
            Clear cart
          </button>
        )}
      </div>

      {catalogueStatus === 'loading' && (
        <div className="cart-empty">
          <p>Loading your cart…</p>
        </div>
      )}

      {catalogueStatus === 'error' && (
        <div className="cart-empty">
          <p>Your cart will appear once the product catalogue loads.</p>
        </div>
      )}

      {catalogueStatus === 'ready' && !hasItems && (
        <div className="cart-empty">
          <span className="empty-cart-icon" aria-hidden="true">
            <EmptyCartIcon />
          </span>
          <h3>Your cart is empty</h3>
          <p>Your cart is empty. Add a desk essential to get started.</p>
          <a
            className="button button-secondary cart-browse-link"
            href="#products-heading"
            onClick={onBrowse}
          >
            Browse products
          </a>
        </div>
      )}

      {catalogueStatus === 'ready' && hasItems && (
        <>
          <ul className="cart-lines" aria-label="Cart line items">
            {summary.lines.map(({ product, quantity, lineTotal }) => {
              const atMaximum = quantity >= product.stock;
              const imageUrl = PRODUCT_IMAGES[product.id];

              return (
                <li className="cart-line" key={product.id}>
                  <div className="cart-line-thumb" data-product={product.id}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="cart-line-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ProductIcon productId={product.id} />
                    )}
                  </div>

                  <div className="cart-line-details">
                    <div className="cart-line-header">
                      <p className="cart-line-name">{product.name}</p>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => onRemove(product.id)}
                        disabled={pending}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        ✕
                      </button>
                    </div>

                    <p className="cart-line-unit">{formatINR(product.price)} each</p>

                    <div className="cart-line-actions">
                      <div
                        className="quantity-stepper"
                        role="group"
                        aria-label={`Quantity control for ${product.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => onDecrease(product.id)}
                          disabled={pending || quantity <= 1}
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span className="quantity-value" aria-label={`Current quantity: ${quantity}`}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrease(product.id)}
                          disabled={pending || atMaximum}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>

                      <span className="cart-line-total">{formatINR(lineTotal)}</span>
                    </div>

                    {atMaximum && (
                      <p className="cart-stock-note">Max stock reached ({product.stock})</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cart-foot">
            <div className="cart-summary-breakdown">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatINR(summary.total)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span className="shipping-badge">FREE</span>
              </div>
              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <strong>{formatINR(summary.total)}</strong>
              </div>
            </div>

            <p className="cart-fineprint">
              Final price and stock are verified by the server at checkout.
            </p>

            {checkoutError && (
              <p className="alert alert-error" role="alert">
                {checkoutError}
              </p>
            )}

            <button
              type="button"
              className="button button-primary checkout-button"
              onClick={onCheckout}
              disabled={pending || !hasItems}
              aria-busy={pending}
              aria-label="Place order"
            >
              {pending ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Placing order…
                </>
              ) : (
                'Place order'
              )}
            </button>
          </div>
        </>
      )}
    </aside>
  );
});

export default Cart;
