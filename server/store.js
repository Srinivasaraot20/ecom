import { SEED_PRODUCTS } from './data/seedProducts.js';

/**
 * Creates an isolated in-memory data store.
 * Every call returns fresh stock and an empty order history, which keeps tests
 * independent. Data intentionally resets when the server process restarts.
 */
export function createStore() {
  const products = SEED_PRODUCTS.map((product) => ({ ...product }));
  const orders = new Map();

  return {
    listProducts() {
      return products.map((product) => ({ ...product }));
    },

    findProduct(productId) {
      return products.find((product) => product.id === productId) ?? null;
    },

    saveOrder(order) {
      orders.set(order.id, order);
    },

    findOrder(orderId) {
      return orders.get(orderId) ?? null;
    },
  };
}
