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
    if (!['admin', 'sa'].includes(req.usuario.rol)) return res.status(403).json({ error: 'Acceso restringido.' });
    next();
  }

  function staffOnly(req, res, next) {
    if (!['asesor', 'sa'].includes(req.usuario.rol)) return res.status(403).json({ error: 'Acceso restringido al equipo de asesorías.' });
    next();
  }

  function saOnly(req, res, next) {
    if (req.usuario.rol !== 'sa') return res.status(403).json({ error: 'Acceso exclusivo para el SA.' });
    next();
  }

  return { authenticate, adminOnly, staffOnly, saOnly };
}

module.exports = createAuthMiddleware;
