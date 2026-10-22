import { useState } from 'react';
import { formatINR, fetchOrder } from '../cart.js';
import ProductIcon from './ProductIcon.jsx';
import { PRODUCT_IMAGES } from '../productImages.js';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export default function OrderConfirmation({ order, onContinue, onViewOrderError }) {
  const [viewingOrder, setViewingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  async function handleViewDetails() {
    setViewingOrder(true);
    try {
      const details = await fetchOrder(order.id);
      setOrderDetails(details);
    } catch (error) {
      setViewingOrder(false);
      if (onViewOrderError) {
        onViewOrderError(error.message);
      }
    }
  }

  function handleCloseViewDetails() {
    setViewingOrder(false);
    setOrderDetails(null);
  }

  return (
    <section className="confirmation" aria-labelledby="confirmation-heading">
      <div className="success-icon-wrapper" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <p className="confirmation-kicker">Order confirmed</p>
      <h1 id="confirmation-heading" className="confirmation-title">Thanks — your order is in!</h1>
      <p className="confirmation-lede">
        The server verified stock and confirmed your order. Keep the order ID below for your records.
      </p>

      <div className="order-identity-card">
        <div className="order-identity-row">
          <span className="order-label">Order ID:</span>
          <code
            className="order-id"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(order.id);
              }
            }}
            title="Click to copy order ID"
          >
            {order.id}
          </code>
        </div>
        <div className="order-identity-row">
          <span className="order-label">Placed:</span>
          <span className="order-date-value">{formatOrderDate(order.createdAt)}</span>
        </div>
      </div>

      {viewingOrder && orderDetails && (
        <div className="order-identity-card details-view">
          <div className="order-identity-row">
            <span className="order-label">Verified Server Status:</span>
            <span className="verified-status-badge">Confirmed</span>
            <button
              type="button"
              className="order-detail-close"
              onClick={handleCloseViewDetails}
              aria-label="Close verified order view"
            >
              ✕
            </button>
          </div>
          <div className="order-identity-row">
            <span className="order-label">Server Order ID:</span>
            <code>{orderDetails.id}</code>
          </div>
        </div>
      )}

      <h2 className="order-items-heading">Ordered items</h2>
      <ul className="order-items" aria-label="Ordered products">
        {order.items.map((item) => {
          const imageUrl = PRODUCT_IMAGES[item.productId];
          return (
            <li className="order-item" key={item.productId}>
              <div className="order-item-left">
                <div className="order-item-thumb">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="order-item-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <ProductIcon productId={item.productId} />
                  )}
                </div>
                <div>
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-detail">
                    {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                </div>
              </div>
              <span className="order-item-total">{formatINR(item.lineTotal)}</span>
            </li>
          );
        })}
      </ul>

      <div className="order-summary-box">
        <div className="order-summary-row">
          <span>Subtotal</span>
          <span>{formatINR(order.total)}</span>
        </div>
        <div className="order-summary-row">
          <span>Shipping</span>
          <span className="shipping-badge">FREE</span>
        </div>
        <div className="order-summary-row order-total-row">
          <span>Server total</span>
          <strong>{formatINR(order.total)}</strong>
        </div>
      </div>

      <div className="confirmation-actions">
        <button
          type="button"
          className="button button-primary confirm-continue"
          onClick={onContinue}
        >
          Continue shopping
        </button>
        {order.id && (
          <button
            type="button"
            className="button button-secondary"
            onClick={handleViewDetails}
            aria-label="View order details from server"
          >
            View order details
          </button>
        )}
      </div>
    </section>
  );
}
