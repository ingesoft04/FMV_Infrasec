const jwt = require('jsonwebtoken');

function createAuthMiddleware({ secret, users, issuer, audience }) {
  async function authenticate(req, res, next) {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : '';
      const payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer,
        audience
      });
      const current = await users.authorizationState(payload.id);
      if (!current?.activo || current.rol !== payload.rol) throw new Error('Cuenta revocada.');
      req.usuario = { ...payload, nombre: current.nombre, rol: current.rol };
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
