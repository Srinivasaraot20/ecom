import { randomUUID } from 'node:crypto';
import { Router } from 'express';

const MAX_ITEMS_PER_ORDER = 50;

function fail(status, code, message) {
  return { ok: false, status, code, message };
}

function formatStockMessage(product, available) {
  const unit = available === 1 ? 'unit' : 'units';
  const verb = available === 1 ? 'is' : 'are';
  return `Only ${available} ${unit} of ${product.name} ${verb} available.`;
}

/**
 * Validates the whole order against current server data without mutating
 * anything. Returns server-priced line items only after every check passes.
 */
export function validateOrderPayload(body, store) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fail(400, 'INVALID_ORDER', 'Request body must be a JSON object with an items array.');
  }

  const { items } = body;

  if (!Array.isArray(items)) {
    return fail(400, 'INVALID_ORDER', 'Request body must include an items array.');
  }

  if (items.length === 0) {
    return fail(400, 'EMPTY_ORDER', 'Order must contain at least one item.');
  }

  if (items.length > MAX_ITEMS_PER_ORDER) {
    return fail(400, 'INVALID_ORDER', `An order cannot contain more than ${MAX_ITEMS_PER_ORDER} line items.`);
  }

  const validated = [];
  const seenProductIds = new Set();

  for (const item of items) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return fail(400, 'INVALID_ITEM', 'Each order item must be an object with productId and quantity.');
    }

    const { productId, quantity } = item;

    if (typeof productId !== 'string' || productId.trim() === '') {
      return fail(400, 'INVALID_PRODUCT_ID', 'Each order item must include a non-empty productId string.');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail(400, 'INVALID_QUANTITY', 'Quantity must be a positive integer.');
    }

    if (seenProductIds.has(productId)) {
      return fail(400, 'DUPLICATE_PRODUCT', `Product "${productId}" appears more than once in the order.`);
    }
    seenProductIds.add(productId);

    const product = store.findProduct(productId);
    if (!product) {
      return fail(400, 'UNKNOWN_PRODUCT', `Unknown product ID "${productId}".`);
    }

    validated.push({ product, quantity });
  }

  for (const { product, quantity } of validated) {
    if (product.stock < quantity) {
      return fail(409, 'INSUFFICIENT_STOCK', formatStockMessage(product, product.stock));
    }
  }

  return { ok: true, items: validated };
}

export function createOrdersRouter(store) {
  const router = Router();

  router.post('/', (req, res) => {
    const validation = validateOrderPayload(req.body, store);

    if (!validation.ok) {
      return res.status(validation.status).json({
        error: { code: validation.code, message: validation.message },
      });
    }

    const orderItems = validation.items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    }));

    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    // Stock changes and order storage happen only after every item passed
    // validation. The handler is synchronous, so a second request cannot
    // interleave between these statements in a single Node process.
    for (const { product, quantity } of validation.items) {
      product.stock -= quantity;
    }

    const order = {
      id: `ord_${randomUUID()}`,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
    };

    store.saveOrder(order);

    return res.status(201).json({ order });
  });

  router.get('/:id', (req, res) => {
    const order = store.findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: { code: 'ORDER_NOT_FOUND', message: 'No order exists with that ID.' },
      });
    }

    return res.json({ order });
  });

  return router;
}
