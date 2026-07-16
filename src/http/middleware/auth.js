const jwt = require('jsonwebtoken');

function createAuthMiddleware(secret) {
  function authenticate(req, res, next) {
    try {
      const header = req.headers.authorization || '';
      req.usuario = jwt.verify(header.startsWith('Bearer ') ? header.slice(7) : '', secret);
      next();
    } catch (_) {
      res.status(401).json({ error: 'Sesión inválida o vencida.' });
    }
  }

  function adminOnly(req, res, next) {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'Acceso restringido.' });
    next();
  }

  return { authenticate, adminOnly };
}

module.exports = createAuthMiddleware;
