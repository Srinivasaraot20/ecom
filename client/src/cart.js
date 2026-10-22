export const CART_STORAGE_KEY = 'mini-ecommerce:cart:v1';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatINR(amount) {
  return inrFormatter.format(amount);
}

export function clearCart() {
  const storage = getDefaultStorage();
  try {
    storage?.removeItem(CART_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  return [];
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function normalizeCartEntry(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return null;

  const { productId, quantity } = entry;
  if (typeof productId !== 'string' || productId.trim() === '') return null;
  if (!Number.isSafeInteger(quantity) || quantity <= 0) return null;

  return { productId, quantity };
}

function normalizeCart(cart) {
  if (!Array.isArray(cart)) return [];

  const byId = new Map();
  for (const entry of cart) {
    const normalized = normalizeCartEntry(entry);
    if (!normalized) continue;

    const existing = byId.get(normalized.productId);
    if (existing) {
      existing.quantity += normalized.quantity;
    } else {
      byId.set(normalized.productId, normalized);
    }
  }

  return [...byId.values()];
}

export function parseStoredCart(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return [];

  try {
    return normalizeCart(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function loadCart(storage = getDefaultStorage()) {
  if (!storage) return [];

  try {
    return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveCart(cart, storage = getDefaultStorage()) {
  if (!storage) return;

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCart(cart)));
  } catch {
    // A full or unavailable storage must not break ordering.
  }
}

export function reconcileCart(cart, products) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const byId = new Map();

  for (const entry of normalizeCart(cart)) {
    const product = productById.get(entry.productId);
    if (!product || !Number.isSafeInteger(product.stock) || product.stock <= 0) continue;

    const quantity = Math.min(entry.quantity, product.stock);
    if (quantity <= 0) continue;

    const existing = byId.get(entry.productId);
    byId.set(entry.productId, {
      productId: entry.productId,
      quantity: Math.min((existing?.quantity ?? 0) + quantity, product.stock),
    });
  }

  return [...byId.values()];
}

export function addToCart(cart, product) {
  if (!product || !Number.isSafeInteger(product.stock) || product.stock <= 0) {
    return normalizeCart(cart);
  }

  const current = normalizeCart(cart);
  const existing = current.find((entry) => entry.productId === product.id);

  if (!existing) {
    return [...current, { productId: product.id, quantity: 1 }];
  }

  return current.map((entry) =>
    entry.productId === product.id
      ? { ...entry, quantity: Math.min(entry.quantity + 1, product.stock) }
      : entry
  );
}

export function setQuantity(cart, productId, quantity, product) {
  const current = normalizeCart(cart);

  if (quantity <= 0) {
    return removeFromCart(current, productId);
  }

  if (!product || !Number.isSafeInteger(product.stock) || product.stock <= 0) {
    return removeFromCart(current, productId);
  }

  if (!current.some((entry) => entry.productId === productId)) {
    return current;
  }

  const nextQuantity = Math.min(Math.floor(quantity), product.stock);
  if (nextQuantity <= 0) {
    return removeFromCart(current, productId);
  }

  return current.map((entry) =>
    entry.productId === productId ? { ...entry, quantity: nextQuantity } : entry
  );
}

export function removeFromCart(cart, productId) {
  return normalizeCart(cart).filter((entry) => entry.productId !== productId);
}

export function getCartSummary(cart, products) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const lines = [];

  for (const entry of normalizeCart(cart)) {
    const product = productById.get(entry.productId);
    if (!product || !Number.isSafeInteger(product.stock) || product.stock <= 0) continue;

    const quantity = Math.min(entry.quantity, product.stock);
    const lineTotal = product.price * quantity;
    lines.push({ product, quantity, lineTotal });
  }

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}

export function toOrderItems(cart) {
  return normalizeCart(cart).map(({ productId, quantity }) => ({ productId, quantity }));
}

const FALLBACK_API_BASE_URL = 'http://localhost:4000/api';
const REQUEST_TIMEOUT_MS = 15000;

export function fetchOrder(orderId) {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(/\/+$/, '');

  return fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`).then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      const error = data?.error?.message || `The server returned an error (${response.status}).`;
      throw new Error(error);
    }
    return data.order;
  });
}
