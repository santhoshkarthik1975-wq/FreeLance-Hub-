import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './src/backend/routes/api.ts';
import { connectDatabase, getDbStatus } from './src/backend/config/db.ts';
import { errorHandler } from './src/backend/middleware/errorHandler.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security headers with relaxed CSP for Vite & Google fonts
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Explicit CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'freelance_hub_cookie_secret'));

// Root health check
app.get('/health', (_req, res) => {
  const db = getDbStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: db.connected,
      type: db.type,
      databaseName: db.databaseName,
      message: db.message,
    },
    version: '1.0.0',
    service: 'Freelance Hub',
  });
});

// Mount /api/v1 router and /api alias
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Centralized error handler for API requests
app.use('/api', errorHandler);
app.use('/api/v1', errorHandler);

async function startServer() {
  // Connect to database (with automatic fallback for cloud preview)
  await connectDatabase();

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted.');
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Freelance Hub] 🚀 Server running at http://0.0.0.0:${PORT}`);
    console.log(`[Freelance Hub] Health endpoint: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('[Freelance Hub] Fatal startup error:', err);
  process.exit(1);
});
