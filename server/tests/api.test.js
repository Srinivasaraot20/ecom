import assert from 'node:assert/strict';
import { once } from 'node:events';
import { afterEach, beforeEach, test } from 'node:test';
import { createApp } from '../app.js';
import { createStore } from '../store.js';

let server;
let baseUrl;

beforeEach(async () => {
  server = createApp(createStore()).listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { status: response.status, body };
}

function placeOrder(items, extra = {}) {
  return request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, ...extra }),
  });
}

async function getProducts() {
  const { body } = await request('/api/products');
  return body.products;
}

async function stockOf(productId) {
  const products = await getProducts();
  return products.find((product) => product.id === productId).stock;
}

test('GET /api/products returns the five seeded products with exact prices and stock', async () => {
  const { status, body } = await request('/api/products');

  assert.equal(status, 200);
  assert.deepEqual(
    body.products.map(({ id, name, price, stock }) => ({ id, name, price, stock })),
    [
      { id: 'mouse', name: 'Wireless Mouse', price: 799, stock: 10 },
      { id: 'keyboard', name: 'Mechanical Keyboard', price: 2499, stock: 5 },
      { id: 'hub', name: 'USB-C Hub', price: 1299, stock: 15 },
      { id: 'speaker', name: 'Bluetooth Speaker', price: 1999, stock: 0 },
      { id: 'stand', name: 'Laptop Stand', price: 899, stock: 8 },
    ]
  );
});

test('POST /api/orders creates a server-priced order and reduces stock', async () => {
  const { status, body } = await placeOrder([
    { productId: 'mouse', quantity: 2 },
    { productId: 'stand', quantity: 1 },
  ]);

  assert.equal(status, 201);
  assert.match(body.order.id, /^ord_[0-9a-f-]{36}$/);
  assert.equal(body.order.total, 799 * 2 + 899);
  assert.equal(body.order.items.length, 2);
  assert.deepEqual(
    body.order.items.map(({ productId, name, unitPrice, quantity, lineTotal }) => ({
      productId,
      name,
      unitPrice,
      quantity,
      lineTotal,
    })),
    [
      { productId: 'mouse', name: 'Wireless Mouse', unitPrice: 799, quantity: 2, lineTotal: 1598 },
      { productId: 'stand', name: 'Laptop Stand', unitPrice: 899, quantity: 1, lineTotal: 899 },
    ]
  );
  assert.ok(!Number.isNaN(Date.parse(body.order.createdAt)));

  assert.equal(await stockOf('mouse'), 8);
  assert.equal(await stockOf('stand'), 7);
});

test('client-supplied prices and totals are ignored', async () => {
  const { status, body } = await placeOrder(
    [{ productId: 'mouse', quantity: 2, unitPrice: 1, lineTotal: 2 }],
    { total: 2, clientTotal: 2 }
  );

  assert.equal(status, 201);
  assert.equal(body.order.items[0].unitPrice, 799);
  assert.equal(body.order.items[0].lineTotal, 1598);
  assert.equal(body.order.total, 1598);
});

test('unknown product IDs are rejected without changing stock', async () => {
  const { status, body } = await placeOrder([
    { productId: 'mouse', quantity: 1 },
    { productId: 'not-a-product', quantity: 1 },
  ]);

  assert.equal(status, 400);
  assert.equal(body.error.code, 'UNKNOWN_PRODUCT');
  assert.equal(await stockOf('mouse'), 10);
});

test('invalid quantities are rejected without changing stock', async () => {
  const invalidQuantities = [0, -1, 1.5, '2', null, true];

  for (const quantity of invalidQuantities) {
    const { status, body } = await placeOrder([{ productId: 'mouse', quantity }]);
    assert.equal(status, 400, `quantity ${JSON.stringify(quantity)} should be rejected`);
    assert.equal(body.error.code, 'INVALID_QUANTITY');
    assert.equal(await stockOf('mouse'), 10);
  }

  const missingQuantity = await placeOrder([{ productId: 'mouse' }]);
  assert.equal(missingQuantity.status, 400);
  assert.equal(missingQuantity.body.error.code, 'INVALID_QUANTITY');
});

test('empty and malformed order bodies are rejected', async () => {
  const bodies = [
    {},
    { items: [] },
    { items: 'mouse' },
    [],
  ];

  for (const payload of bodies) {
    const { status, body } = await request('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(status, 400, `payload ${JSON.stringify(payload)} should be rejected`);
    assert.ok(['INVALID_ORDER', 'EMPTY_ORDER'].includes(body.error.code));
  }
});

test('duplicate product IDs are rejected', async () => {
  const { status, body } = await placeOrder([
    { productId: 'mouse', quantity: 1 },
    { productId: 'mouse', quantity: 2 },
  ]);

  assert.equal(status, 400);
  assert.equal(body.error.code, 'DUPLICATE_PRODUCT');
  assert.equal(await stockOf('mouse'), 10);
});

test('insufficient stock is rejected with 409 and no stock change', async () => {
  const keyboard = await placeOrder([{ productId: 'keyboard', quantity: 6 }]);
  assert.equal(keyboard.status, 409);
  assert.equal(keyboard.body.error.code, 'INSUFFICIENT_STOCK');
  assert.match(keyboard.body.error.message, /Only 5 units of Mechanical Keyboard are available/);

  const speaker = await placeOrder([{ productId: 'speaker', quantity: 1 }]);
  assert.equal(speaker.status, 409);
  assert.equal(speaker.body.error.code, 'INSUFFICIENT_STOCK');

  assert.equal(await stockOf('keyboard'), 5);
  assert.equal(await stockOf('speaker'), 0);
});

test('a failed item prevents every stock change in the same order', async () => {
  const { status } = await placeOrder([
    { productId: 'mouse', quantity: 2 },
    { productId: 'keyboard', quantity: 6 },
  ]);

  assert.equal(status, 409);
  assert.equal(await stockOf('mouse'), 10);
  assert.equal(await stockOf('keyboard'), 5);
});

test('an order can consume exactly the available stock', async () => {
  const { status, body } = await placeOrder([{ productId: 'keyboard', quantity: 5 }]);

  assert.equal(status, 201);
  assert.equal(body.order.total, 2499 * 5);
  assert.equal(await stockOf('keyboard'), 0);

  const retry = await placeOrder([{ productId: 'keyboard', quantity: 1 }]);
  assert.equal(retry.status, 409);
});

test('GET /api/orders/:id returns an existing order snapshot', async () => {
  const created = await placeOrder([{ productId: 'hub', quantity: 3 }]);
  const { status, body } = await request(`/api/orders/${created.body.order.id}`);

  assert.equal(status, 200);
  assert.deepEqual(body.order, created.body.order);
});

test('GET /api/orders/:id returns 404 for an unknown order', async () => {
  const { status, body } = await request('/api/orders/ord_does-not-exist');

  assert.equal(status, 404);
  assert.equal(body.error.code, 'ORDER_NOT_FOUND');
});

test('malformed JSON returns a consistent 400 error', async () => {
  const { status, body } = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"items": [',
  });

  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_JSON');
});

test('concurrent orders cannot oversell remaining stock', async () => {
  const attempts = Array.from({ length: 6 }, () =>
    placeOrder([{ productId: 'keyboard', quantity: 1 }])
  );
  const results = await Promise.all(attempts);

  const successCount = results.filter((result) => result.status === 201).length;
  const conflictCount = results.filter((result) => result.status === 409).length;

  assert.equal(successCount, 5);
  assert.equal(conflictCount, 1);
  assert.equal(await stockOf('keyboard'), 0);
});

test('unknown API routes return a JSON 404', async () => {
  const { status, body } = await request('/api/unknown');

  assert.equal(status, 404);
  assert.equal(body.error.code, 'NOT_FOUND');
});
