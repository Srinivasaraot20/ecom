import { useCallback, useEffect, useRef, useState } from 'react';
import { createOrder, fetchProducts } from './api.js';
import {
  addToCart,
  clearCart,
  loadCart,
  reconcileCart,
  removeFromCart,
  saveCart,
  setQuantity,
  toOrderItems,
  formatINR,
} from './cart.js';
import ProductList from './components/ProductList.jsx';
import Cart from './components/Cart.jsx';
import OrderConfirmation from './components/OrderConfirmation.jsx';
import Toast from './components/Toast.jsx';

// Brand Planet Mark SVG
function BrandLogo() {
  return (
    <div className="brand-logo-box" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="4.2" fill="#FFFFFF" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="#FFFFFF" strokeWidth="1.8" transform="rotate(-30 12 12)" />
      </svg>
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function HeaderCartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
      <circle cx="8" cy="21" r="1.5" />
      <circle cx="19" cy="21" r="1.5" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

// Category icons
function CategoryIcon({ id }) {
  switch (id) {
    case 'all':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'work-from-home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'keyboards-mice':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
        </svg>
      );
    case 'laptop-accessories':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
          <rect x="4" y="6" width="16" height="10" rx="1" />
          <path d="M2 18h20" />
        </svg>
      );
    case 'audio':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    default:
      return null;
  }
}

// Hero benefit icons
function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const CATEGORIES = [
  { id: 'all', label: 'All products' },
  { id: 'work-from-home', label: 'Work from home' },
  { id: 'keyboards-mice', label: 'Keyboards & mice' },
  { id: 'laptop-accessories', label: 'Laptop accessories' },
  { id: 'audio', label: 'Audio' },
];

function cartsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

let toastIdCounter = 0;
function makeToastId() {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}`;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [catalogueStatus, setCatalogueStatus] = useState('loading');
  const [catalogueError, setCatalogueError] = useState('');
  const [query, setQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(() => loadCart());
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [checkoutError, setCheckoutError] = useState('');
  const [order, setOrder] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const submittingRef = useRef(false);
  const cartSectionRef = useRef(null);

  function pushToast(message, type = 'success') {
    const id = makeToastId();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function loadProducts({ silent = false } = {}) {
    if (!silent) {
      setCatalogueStatus('loading');
      setCatalogueError('');
    }

    try {
      const catalogue = await fetchProducts();
      setProducts(catalogue);
      setCatalogueStatus('ready');
      setCatalogueError('');
    } catch (error) {
      if (!silent) {
        setCatalogueError(error.message);
        setCatalogueStatus('error');
      }
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    if (catalogueStatus !== 'ready' || products.length === 0) return;

    setCart((previous) => {
      const next = reconcileCart(previous, products);
      return cartsMatch(previous, next) ? previous : next;
    });
  }, [products, catalogueStatus]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  const cartTotalAmount = cart.reduce((sum, entry) => {
    const prod = products.find((p) => p.id === entry.productId);
    return sum + (prod ? prod.price * entry.quantity : 0);
  }, 0);

  function handleAdd(product) {
    if (product.stock <= 0) return;

    const existing = cart.find((entry) => entry.productId === product.id);
    const currentQty = existing?.quantity ?? 0;

    if (currentQty >= product.stock) {
      pushToast(`${product.name} — maximum available stock is already in your cart.`, 'error');
      setAnnouncement(`Maximum available stock for ${product.name} is already in your cart.`);
      return;
    }

    const nextQty = currentQty + 1;
    setCart((previous) => addToCart(previous, product));
    pushToast(`${product.name} added to cart.`);
    setAnnouncement(`${product.name} added to cart. ${nextQty} in cart.`);
  }

  function handleIncrease(productId) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;
    setCart((previous) => addToCart(previous, product));
  }

  function handleDecrease(productId) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;

    setCart((previous) => {
      const current = previous.find((entry) => entry.productId === productId);
      if (!current) return previous;
      return setQuantity(previous, productId, current.quantity - 1, product);
    });
  }

  function handleRemove(productId) {
    setCart((previous) => removeFromCart(previous, productId));
  }

  function handleClearCart() {
    setCart(clearCart());
    pushToast('Cart cleared.');
  }

  async function handleCheckout() {
    if (submittingRef.current || cart.length === 0) return;

    submittingRef.current = true;
    setCheckoutStatus('submitting');
    setCheckoutError('');

    try {
      const createdOrder = await createOrder(toOrderItems(cart));
      setOrder(createdOrder);
      setCart(clearCart());
      setCheckoutStatus('idle');
      setAnnouncement('Order placed successfully.');
      window.scrollTo({ top: 0, behavior: 'auto' });
      loadProducts({ silent: true });
    } catch (error) {
      setCheckoutError(error.message);
      setCheckoutStatus('idle');
      setAnnouncement(`Checkout failed. ${error.message}`);
      pushToast(error.message, 'error');
      if (error.code === 'INSUFFICIENT_STOCK') {
        loadProducts({ silent: true });
      }
    } finally {
      submittingRef.current = false;
    }
  }

  function handleContinueShopping() {
    setOrder(null);
    setQuery('');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('all');
    setCheckoutError('');
    setCheckoutStatus('idle');
    setIsMobileMenuOpen(false);
    setAnnouncement('Ready to shop again.');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleBrandClick(event) {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    if (order) {
      handleContinueShopping();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleClearAll() {
    setQuery('');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('all');
  }

  function scrollToCart() {
    setIsMobileMenuOpen(false);
    cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Top Header Bar */}
      <header className="site-header">
        <div className="container header-top-bar">
          {/* Brand Left */}
          <a className="brand" href="/" onClick={handleBrandClick} aria-label="Orbit Supply home">
            <BrandLogo />
            <div className="brand-text">
              <span className="brand-name">Orbit Supply</span>
              <span className="brand-tagline">Desk essentials</span>
            </div>
          </a>

          {/* Centered Wide Search in Header */}
          <div className="header-search-container" role="search">
            <div className="header-search-wrapper">
              <SearchIcon />
              <input
                type="search"
                className="header-search-input"
                placeholder="Search products, accessories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products, accessories..."
              />
              {query && (
                <button
                  type="button"
                  className="header-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className="button button-primary header-search-button"
              aria-label="Search"
            >
              Search
            </button>
          </div>

          {/* Actions Right: Cart + Hamburger Menu Toggle */}
          <div className="header-actions">
            {order ? (
              <button
                type="button"
                className="button button-secondary header-back-btn"
                onClick={handleContinueShopping}
              >
                Back to shop
              </button>
            ) : (
              <a
                className="header-cart-action header-cart-link"
                href="#cart"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToCart();
                }}
                aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              >
                <div className="cart-icon-wrap">
                  <HeaderCartIcon />
                  <span className="header-cart-count" aria-hidden="true">
                    {cartCount}
                  </span>
                </div>
                <div className="header-cart-text">
                  <span className="header-cart-label">Cart</span>
                  <span className="header-cart-total">{formatINR(cartTotalAmount)}</span>
                </div>
              </a>
            )}

            {/* Hamburger Button for mobile drawer navigation */}
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="mobile-menu-header">
            <div className="brand">
              <BrandLogo />
              <div className="brand-text">
                <span className="brand-name">Orbit Supply</span>
                <span className="brand-tagline">Desk essentials</span>
              </div>
            </div>
            <button
              type="button"
              className="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mobile-menu-body">
            <span className="mobile-menu-heading">Categories</span>
            <ul className="mobile-nav-list">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={`mobile-nav-item ${selectedCategory === cat.id ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <CategoryIcon id={cat.id} />
                    <span>{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mobile-menu-divider" />

            <span className="mobile-menu-heading">Quick Actions</span>
            <ul className="mobile-nav-list">
              <li>
                <button
                  type="button"
                  className="mobile-nav-item"
                  onClick={scrollToCart}
                >
                  <HeaderCartIcon />
                  <span>View Cart ({cartCount})</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="mobile-nav-item"
                  onClick={() => {
                    handleClearAll();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span>Reset All Filters</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Desktop Category Navigation Bar */}
        <nav className="category-nav-bar" aria-label="Category navigation">
          <div className="container category-nav-container">
            <ul className="category-nav-list">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={`category-nav-item ${selectedCategory === cat.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-current={selectedCategory === cat.id ? 'page' : undefined}
                  >
                    <CategoryIcon id={cat.id} />
                    <span>{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      {order ? (
        <main className="container page-main" id="main">
          <OrderConfirmation
            order={order}
            onContinue={handleContinueShopping}
            onViewOrderError={(msg) => setCheckoutError(msg)}
          />
        </main>
      ) : (
        <>
          {/* Responsive Banner Hero Section */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <div className="container hero-container">
              {/* Desktop Banner View (>= 1024px) */}
              <div className="hero-banner-wrapper hero-desktop-banner">
                <img
                  src="/banner.png"
                  alt="Small upgrades. Better workdays. Useful desk essentials, ready for your setup."
                  className="hero-banner-image"
                />
              </div>

              {/* Mobile & Tablet Dedicated Responsive Banner (< 1024px) */}
              <div className="hero-mobile-banner">
                <div className="hero-mobile-content">
                  <h1 id="hero-heading" className="hero-mobile-title">
                    <span className="hero-mobile-line1">Small upgrades.</span>
                    <span className="hero-mobile-line2">Better workdays.</span>
                  </h1>
                  <p className="hero-mobile-subtitle">
                    Useful desk essentials, ready for your setup.
                  </p>

                  <div className="hero-mobile-features" role="list" aria-label="Store benefits">
                    <div className="hero-feature-pill" role="listitem">
                      <TruckIcon />
                      <span>Easy browsing</span>
                    </div>
                    <div className="hero-feature-pill" role="listitem">
                      <PackageIcon />
                      <span>Live stock checks</span>
                    </div>
                    <div className="hero-feature-pill" role="listitem">
                      <ShieldCheckIcon />
                      <span>Secure order validation</span>
                    </div>
                  </div>
                </div>

                <div className="hero-mobile-image-wrap">
                  <img
                    src="/banner.png"
                    alt="Desk accessories setup"
                    className="hero-mobile-img"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Storefront Layout: Catalogue (left) + Sticky Cart (right) */}
          <main className="container store-layout" id="main">
            <div className="storefront-left-col">
              <ProductList
                products={products}
                status={catalogueStatus}
                error={catalogueError}
                query={query}
                onQueryChange={setQuery}
                onClearSearch={() => setQuery('')}
                onRetry={() => loadProducts()}
                onAdd={handleAdd}
                cart={cart}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onClearAll={handleClearAll}
                selectedCategory={selectedCategory}
              />
            </div>

            <div className="storefront-right-col">
              <Cart
                ref={cartSectionRef}
                cart={cart}
                products={products}
                catalogueStatus={catalogueStatus}
                checkoutStatus={checkoutStatus}
                checkoutError={checkoutError}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onClearCart={handleClearCart}
                onCheckout={handleCheckout}
                onBrowse={scrollToCart}
              />
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-brand-section">
            <div className="footer-brand">
              <BrandLogo />
              <span className="footer-brand-name">Orbit Supply</span>
            </div>
            <p className="footer-tagline">Simple. Useful. Reliable desk accessories.</p>
          </div>

          <div className="footer-links-section">
            <div className="footer-links-group">
              <span className="footer-heading">Information</span>
              <ul className="footer-links">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); pushToast('About page coming soon!', 'info'); }}>About</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); pushToast('Contact: support@orbitsupply.local', 'info'); }}>Contact</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); pushToast('Privacy policy: local demo site', 'info'); }}>Privacy</a></li>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); pushToast('Terms of service: local demo site', 'info'); }}>Terms</a></li>
              </ul>
            </div>

            <div className="footer-links-group">
              <span className="footer-heading">Connect</span>
              <ul className="footer-links">
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} Orbit Supply. All rights reserved.</p>
        </div>
      </footer>

      {/* Screen-reader-only live region for state announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
