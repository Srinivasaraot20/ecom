import { useState } from 'react';
import ProductCard from './ProductCard.jsx';

function SearchIcon() {
  return (
    <svg
      className="search-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function LoadingGrid() {
  return (
    <>
      <p className="sr-only" role="status">
        Loading products…
      </p>
      <div className="product-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-media" />
            <div className="skeleton-body">
              <div className="skeleton-line is-short" />
              <div className="skeleton-line is-title" />
              <div className="skeleton-line" />
              <div className="skeleton-button" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function parsePriceInput(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

export default function ProductList({
  products,
  status,
  error,
  query,
  onQueryChange,
  onClearSearch,
  onRetry,
  onAdd,
  cart,
  inStockOnly = false,
  onToggleInStock = () => {},
  minPrice = '',
  maxPrice = '',
  onMinPriceChange = () => {},
  onMaxPriceChange = () => {},
  onClearAll = () => {},
  selectedCategory = 'all',
}) {
  const [sort, setSort] = useState('recommended');

  const normalizedQuery = query.trim().toLowerCase();
  const parsedMin = parsePriceInput(minPrice);
  const parsedMax = parsePriceInput(maxPrice);
  const priceRangeInvalid = parsedMin !== null && parsedMax !== null && parsedMin > parsedMax;

  // Category mapping
  // Map categories from JSON: 'work-from-home', 'keyboards-mice', 'laptop-accessories', 'audio'
  const filteredProducts = [...products]
    .filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const prodCat = (product.category || '').toLowerCase();
        if (selectedCategory === 'keyboards-mice') {
          if (!prodCat.includes('input') && !prodCat.includes('keyboard') && !prodCat.includes('mice') && !prodCat.includes('mouse')) {
            return false;
          }
        } else if (selectedCategory === 'laptop-accessories') {
          if (!prodCat.includes('connectivity') && !prodCat.includes('desk') && !prodCat.includes('stand') && !prodCat.includes('hub') && !prodCat.includes('laptop')) {
            return false;
          }
        } else if (selectedCategory === 'audio') {
          if (!prodCat.includes('audio') && !prodCat.includes('speaker')) {
            return false;
          }
        } else if (selectedCategory === 'work-from-home') {
          // All products fit work from home
        }
      }

      const matchesQuery = !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery);
      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesMin = parsedMin === null || product.price >= parsedMin;
      const matchesMax = parsedMax === null || product.price <= parsedMax;
      return matchesQuery && matchesStock && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0; // recommended preserves seeded order
    });

  const cartQuantities = new Map(cart.map((entry) => [entry.productId, entry.quantity]));

  const hasActiveFilters =
    normalizedQuery !== '' || inStockOnly || parsedMin !== null || parsedMax !== null || selectedCategory !== 'all';

  return (
    <section className="catalogue-section" aria-labelledby="products-heading">
      <div className="catalogue-header">
        <div className="catalogue-title-area">
          <h2 id="products-heading" className="section-heading">Explore desk essentials</h2>
          {status === 'ready' && (
            <span className="product-count-badge" aria-label={`${filteredProducts.length} products available`}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="catalogue-controls" role="region" aria-label="Product filters and sorting">
          <div className="search-control">
            <label htmlFor="search-input" className="sr-only">
              Search products by name
            </label>
            <div className="search-field">
              <SearchIcon />
              <input
                id="search-input"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search by product name..."
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={onClearSearch}
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
              />
              <span>In stock only</span>
            </label>

            <div className="price-inputs">
              <div className="price-input-wrapper">
                <span className="price-prefix" aria-hidden="true">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                  min="0"
                  step="1"
                  aria-label="Minimum price in rupees"
                  className={`price-input ${priceRangeInvalid ? 'is-invalid' : ''}`}
                />
              </div>
              <span className="price-separator" aria-hidden="true">–</span>
              <div className="price-input-wrapper">
                <span className="price-prefix" aria-hidden="true">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => onMaxPriceChange(e.target.value)}
                  min="0"
                  step="1"
                  aria-label="Maximum price in rupees"
                  className={`price-input ${priceRangeInvalid ? 'is-invalid' : ''}`}
                />
              </div>
            </div>

            <div className="sort-control">
              <label htmlFor="sort-select" className="sr-only">
                Sort products
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select"
                aria-label="Sort products by"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invalid price warning */}
        {priceRangeInvalid && (
          <p className="filter-warning" role="alert">
            Minimum price cannot exceed maximum price.
          </p>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filters-chips" aria-label="Active filters">
            {query && (
              <span className="filter-chip">
                Search: "{query}"
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label={`Remove search filter for ${query}`}
                >
                  ✕
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="filter-chip">
                In stock only
                <button
                  type="button"
                  onClick={() => onToggleInStock(false)}
                  aria-label="Remove in-stock filter"
                >
                  ✕
                </button>
              </span>
            )}
            {parsedMin !== null && (
              <span className="filter-chip">
                Min: ₹{parsedMin}
                <button
                  type="button"
                  onClick={() => onMinPriceChange('')}
                  aria-label="Remove minimum price filter"
                >
                  ✕
                </button>
              </span>
            )}
            {parsedMax !== null && (
              <span className="filter-chip">
                Max: ₹{parsedMax}
                <button
                  type="button"
                  onClick={() => onMaxPriceChange('')}
                  aria-label="Remove maximum price filter"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={onClearAll}
              aria-label="Clear all active filters"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Catalogue states */}
      {status === 'loading' && <LoadingGrid />}

      {status === 'error' && (
        <div className="catalogue-state is-error" role="alert">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h3>Unable to connect to the store catalogue</h3>
          <p>{error || 'Could not reach the store server. Check that the API is running and try again.'}</p>
          <button type="button" className="button button-primary retry-btn" onClick={onRetry}>
            Retry connection
          </button>
        </div>
      )}

      {status === 'ready' && filteredProducts.length === 0 && (
        <div className="catalogue-state is-empty" role="status">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h3>No products match your search</h3>
          <p>No products match your search. Try another name or clear your filters.</p>
          <button type="button" className="button button-secondary clear-filters-btn" onClick={onClearAll}>
            Clear all filters
          </button>
        </div>
      )}

      {status === 'ready' && filteredProducts.length > 0 && (
        <div className="product-grid" data-testid="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={cartQuantities.get(product.id) ?? 0}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}
