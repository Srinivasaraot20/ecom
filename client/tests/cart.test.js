import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addToCart,
  formatINR,
  getCartSummary,
  loadCart,
  parseStoredCart,
  reconcileCart,
  removeFromCart,
  saveCart,
  setQuantity,
  toOrderItems,
} from '../src/cart.js';

const products = [
  { id: 'mouse', name: 'Wireless Mouse', price: 799, stock: 10 },
  { id: 'keyboard', name: 'Mechanical Keyboard', price: 2499, stock: 5 },
  { id: 'hub', name: 'USB-C Hub', price: 1299, stock: 15 },
  { id: 'speaker', name: 'Bluetooth Speaker', price: 1999, stock: 0 },
  { id: 'stand', name: 'Laptop Stand', price: 899, stock: 8 },
];

function createFakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.hasOwn(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

test('parseStoredCart safely handles malformed and invalid data', () => {
  assert.deepEqual(parseStoredCart(null), []);
  assert.deepEqual(parseStoredCart('not json'), []);
  assert.deepEqual(parseStoredCart('{"productId":"mouse"}'), []);
  assert.deepEqual(
    parseStoredCart(
      JSON.stringify([
        { productId: 'mouse', quantity: 2 },
        { productId: 'speaker', quantity: 0 },
        { productId: '', quantity: 1 },
        { productId: 'hub', quantity: 1.5 },
        { productId: 'stand', quantity: '2' },
        null,
      ])
    ),
    [{ productId: 'mouse', quantity: 2 }]
  );
});

test('saveCart and loadCart round-trip valid cart data', () => {
  const storage = createFakeStorage();
  const cart = [{ productId: 'mouse', quantity: 2 }];

  saveCart(cart, storage);

  assert.deepEqual(loadCart(storage), cart);
});

test('loadCart returns an empty cart when storage fails or is empty', () => {
  assert.deepEqual(loadCart(createFakeStorage()), []);
  const brokenStorage = {
    getItem() {
      throw new Error('storage unavailable');
    },
  };
  assert.deepEqual(loadCart(brokenStorage), []);
});

test('reconcileCart drops unknown and out-of-stock products and clamps quantities', () => {
  const cart = [
    { productId: 'mouse', quantity: 99 },
    { productId: 'speaker', quantity: 1 },
    { productId: 'ghost', quantity: 1 },
    { productId: 'stand', quantity: 2 },
  ];

  assert.deepEqual(reconcileCart(cart, products), [
    { productId: 'mouse', quantity: 10 },
    { productId: 'stand', quantity: 2 },
  ]);
});

test('addToCart adds, increments, and respects stock limits', () => {
  assert.deepEqual(addToCart([], products[0]), [{ productId: 'mouse', quantity: 1 }]);
  assert.deepEqual(addToCart([{ productId: 'mouse', quantity: 2 }], products[0]), [
    { productId: 'mouse', quantity: 3 },
  ]);
  assert.deepEqual(addToCart([{ productId: 'keyboard', quantity: 5 }], products[1]), [
    { productId: 'keyboard', quantity: 5 },
  ]);
  assert.deepEqual(addToCart([], products[3]), []);
});

test('setQuantity clamps to stock and removes items at zero', () => {
  const cart = [{ productId: 'mouse', quantity: 2 }];

  assert.deepEqual(setQuantity(cart, 'mouse', 4, products[0]), [
    { productId: 'mouse', quantity: 4 },
  ]);
  assert.deepEqual(setQuantity(cart, 'mouse', 50, products[0]), [
    { productId: 'mouse', quantity: 10 },
  ]);
  assert.deepEqual(setQuantity(cart, 'mouse', 0, products[0]), []);
  assert.deepEqual(setQuantity(cart, 'mouse', -3, products[0]), []);
});

test('removeFromCart removes only the requested line', () => {
  const cart = [
    { productId: 'mouse', quantity: 2 },
    { productId: 'hub', quantity: 1 },
  ];

  assert.deepEqual(removeFromCart(cart, 'mouse'), [{ productId: 'hub', quantity: 1 }]);
  assert.deepEqual(removeFromCart(cart, 'ghost'), cart);
});

test('getCartSummary returns line totals, item count, and grand total', () => {
  const summary = getCartSummary(
    [
      { productId: 'mouse', quantity: 2 },
      { productId: 'speaker', quantity: 1 },
      { productId: 'stand', quantity: 1 },
    ],
    products
  );

  assert.equal(summary.lines.length, 2);
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.total, 799 * 2 + 899);
  assert.equal(summary.lines[0].lineTotal, 1598);
});

test('toOrderItems sends only product IDs and quantities', () => {
  assert.deepEqual(
    toOrderItems([
      { productId: 'mouse', quantity: 2, name: 'Wireless Mouse', price: 1 },
      { productId: 'stand', quantity: 1 },
    ]),
    [
      { productId: 'mouse', quantity: 2 },
      { productId: 'stand', quantity: 1 },
    ]
  );
});

test('formatINR formats integer rupee values clearly', () => {
  assert.equal(formatINR(799), '₹799');
  assert.equal(formatINR(2499), '₹2,499');
  assert.equal(formatINR(0), '₹0');
});
