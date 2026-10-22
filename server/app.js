import cors from 'cors';
import express from 'express';
import { createStore } from './store.js';
import { createProductsRouter } from './routes/products.js';
import { createOrdersRouter } from './routes/orders.js';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];

function parseAllowedOrigins() {
  const configured = process.env.CLIENT_ORIGIN;
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function createApp(store = createStore()) {
  const app = express();
  const allowedOrigins = parseAllowedOrigins();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    })
  );

  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/products', createProductsRouter(store));
  app.use('/api/orders', createOrdersRouter(store));

  app.use((req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'The requested resource does not exist.' },
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({
        error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' },
      });
      return;
    }

    if (err.type === 'entity.too.large') {
      res.status(413).json({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' },
      });
      return;
    }

    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' },
    });
  });

  return app;
}
