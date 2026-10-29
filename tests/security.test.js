const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const createApp = require('../src/app');
const { isStrongPassword } = require('../src/core/passwordPolicy');
const fs = require('node:fs');

function controller() {
  return new Proxy({}, {
    get: () => async (_req, res) => res.json({ ok: true })
  });
}

function container() {
  return {
    config: {
      root: path.resolve(__dirname, '..'),
      frontendUrl: 'http://localhost:4100',
      jwtSecret: 'test-only-secret-with-at-least-32-characters',
      jwtIssuer: 'fmv-infrasec',
      jwtAudience: 'fmv-comercial'
    },
    db: { query: async () => ({ rows: [{ ok: 1 }] }) },
    repositories: {
      users: { authorizationState: async () => null }
    },
    controllers: {
      auth: controller(), commercial: controller(), admin: controller(), staff: controller()
    }
  };
}

test('exige contraseñas resistentes', () => {
  for (const weak of ['Corta1!', 'solo-minusculas-123!', 'SIN-MINUSCULAS-123!', 'SinNumeros!!', 'SinSimbolo123A']) {
    assert.equal(isStrongPassword(weak), false, `debió rechazar: ${weak}`);
  }
  assert.equal(isStrongPassword('Una-Clave-Segura-2026!'), true);
});

test('todas las páginas públicas declaran el favicon corporativo', () => {
  for (const page of [
    'fmv-infrasec.html', 'portal-comercial.html', 'admin-comercial.html',
    'gestion-asesorias.html', 'fmv-guia-instalacion.html'
  ]) {
    const html = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf8');
    assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/assets\/brand\/favicon\.svg">/);
  }
});

test('solo publica páginas y activos expresamente permitidos', async (t) => {
  const server = createApp(container()).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const base = `http://127.0.0.1:${server.address().port}`;

  for (const route of ['/fmv-infrasec.html', '/portal-comercial.html', '/assets/brand/logo-temporal.svg', '/assets/brand/favicon.svg']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, `${route} debe ser pública`);
  }

  for (const route of ['/src/app.js', '/sql/init.sql', '/package.json', '/docker-compose.yml', '/.env.example']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 404, `${route} no debe ser pública`);
  }

  const response = await fetch(`${base}/fmv-infrasec.html`);
  assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/);
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
});
