const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const createAuthMiddleware = require('./http/middleware/auth');
const authRoutes = require('./http/routes/authRoutes');
const commercialRoutes = require('./http/routes/commercialRoutes');
const adminRoutes = require('./http/routes/adminRoutes');
const staffRoutes = require('./http/routes/staffRoutes');

module.exports = (container) => {
  const app = express();
  const { authenticate, adminOnly, staffOnly, saOnly } = createAuthMiddleware({
    secret: container.config.jwtSecret,
    users: container.repositories.users,
    issuer: container.config.jwtIssuer,
    audience: container.config.jwtAudience
  });
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({ origin: container.config.frontendUrl, methods: ['GET','POST','PUT','PATCH','OPTIONS'] }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    next();
  });
  app.get('/', (_req, res) => res.redirect(302, '/fmv-infrasec.html'));
  app.use(express.static(container.config.root, { extensions: ['html'] }));
  app.get('/health', async (_req, res) => {
    try {
      await container.db.query('SELECT 1');
      res.json({ status: 'ok', postgres: 'online', timestamp: new Date().toISOString() });
    } catch (_) {
      res.status(503).json({ status: 'degraded', postgres: 'offline' });
    }
  });
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), authRoutes(container.controllers.auth));
  app.use('/api/admin', adminRoutes(container.controllers.admin, authenticate, adminOnly));
  app.use('/api/staff', staffRoutes(container.controllers.staff, authenticate, staffOnly, saOnly));
  app.use('/api', commercialRoutes(container.controllers.commercial, authenticate));
  app.use((req, res) => res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` }));
  app.use((error, _req, res, _next) => {
    const status = error.status || (error.code === '23505' ? 409 : 500);
    if (status >= 500) console.error('[API]', error);
    const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Error interno.' : error.message;
    res.status(status).json({ error: message });
  });
  return app;
};
