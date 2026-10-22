import { Router } from 'express';

export function createProductsRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({ products: store.listProducts() });
  });

  return router;
}
