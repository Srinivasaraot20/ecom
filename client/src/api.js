const FALLBACK_API_BASE_URL = 'http://localhost:4000/api';
const REQUEST_TIMEOUT_MS = 15000;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The server took too long to respond. Please try again.', 'TIMEOUT');
    }
    throw new ApiError(
      'Could not reach the store server. Check that the API is running and try again.',
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  if ((response.headers.get('content-type') || '').includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || `The server returned an error (${response.status}).`,
      data?.error?.code || 'HTTP_ERROR',
      response.status
    );
  }

  return data;
}

export async function fetchProducts() {
  const data = await request('/products');
  if (!Array.isArray(data?.products)) {
    throw new ApiError('The server returned an unexpected product response.', 'INVALID_RESPONSE');
  }
  return data.products;
}

export async function createOrder(items) {
  const data = await request('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });

  if (!data?.order?.id || !Array.isArray(data.order.items)) {
    throw new ApiError('The server returned an unexpected order response.', 'INVALID_RESPONSE');
  }

  return data.order;
}

export async function fetchOrder(orderId) {
  const data = await request(`/orders/${encodeURIComponent(orderId)}`);
  if (!data?.order) {
    throw new ApiError('The server returned an unexpected order response.', 'INVALID_RESPONSE');
  }
  return data.order;
}
