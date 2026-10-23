import { useState } from 'react';
import ProductIcon from './ProductIcon.jsx';
import { PRODUCT_IMAGES } from '../productImages.js';

export default function ProductCard({
  product,
  cartQuantity,
  onAdd,
}) {
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = product.stock === 0;
  const atMaximum = product.stock > 0 && cartQuantity >= product.stock;
  const imageUrl = PRODUCT_IMAGES[product.id];

  let buttonLabel = 'Add to cart';
  let canAdd = true;

  if (isOutOfStock) {
    buttonLabel = 'Out of stock';
    canAdd = false;
  } else if (atMaximum) {
    buttonLabel = 'Maximum in cart';
    canAdd = false;
  } else if (justAdded) {
    buttonLabel = 'Added to cart';
  }

  const handleAddClick = () => {
    if (!canAdd) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    onAdd(product);
  };

  return (
    <article
      className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      data-testid={`product-card-${product.id}`}
    >
      <div className="product-media" data-product={product.id}>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            width="600"
            height="450"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ProductIcon productId={product.id} />
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-meta">
          <p className="product-price">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(product.price)}
          </p>

          <p className={`stock-status ${isOutOfStock ? 'is-out' : 'is-in'}`}>
            <span className="stock-dot" aria-hidden="true" />
            <span className="stock-count">
              {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="button button-primary product-add"
          onClick={handleAddClick}
          disabled={!canAdd}
        >
          {buttonLabel}
          <span className="sr-only"> — {product.name}</span>
        </button>
      </div>
    </article>
  );
}
