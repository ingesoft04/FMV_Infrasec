const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', 'src');

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  }).filter((file) => file.endsWith('.js'));
}

test('el punto de entrada solo compone y arranca la aplicación', () => {
  const source = fs.readFileSync(path.join(ROOT, 'index.js'), 'utf8');
  assert.ok(source.split(/\r?\n/).length <= 35);
  assert.doesNotMatch(source, /app\.(get|post|patch|delete)/);
  assert.doesNotMatch(source, /SELECT|INSERT|UPDATE|DELETE FROM/);
});

test('el SQL de negocio permanece encapsulado en repositorios', () => {
  const allowed = [
    `${path.sep}repositories${path.sep}`,
    `${path.sep}bootstrap${path.sep}`,
    `${path.sep}app.js`
  ];
  for (const file of files(ROOT)) {
    if (allowed.some((segment) => file.includes(segment))) continue;
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\b(SELECT|INSERT INTO|UPDATE\s+\w+|DELETE FROM)\b/i, `SQL fuera de repositorios: ${file}`);
    assert.doesNotMatch(source, /\bpool\.query\b/, `dependencia directa de PostgreSQL: ${file}`);
  }
});

test('las rutas delegan en controladores y no contienen reglas de negocio', () => {
  const routeDir = path.join(ROOT, 'http', 'routes');
  for (const file of files(routeDir)) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\bdb\b|\bpool\b|\bSELECT\s+|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b/i);
    assert.match(source, /controller\./);
  }
});

test('la composición inyecta repositorios, adaptadores y servicios', () => {
  const source = fs.readFileSync(path.join(ROOT, 'container.js'), 'utf8');
  for (const concept of ['repositories', 'adapters', 'services', 'controllers']) {
    assert.match(source, new RegExp(`\\b${concept}\\b`));
  }
});

test('la autorización revalida usuario activo, rol y parámetros JWT', () => {
  const middleware = fs.readFileSync(path.join(ROOT, 'http', 'middleware', 'auth.js'), 'utf8');
  assert.match(middleware, /users\.authorizationState\(payload\.id\)/);
  assert.match(middleware, /!current\?\.activo/);
  assert.match(middleware, /current\.rol !== payload\.rol/);
  assert.match(middleware, /algorithms:\s*\['HS256'\]/);

  const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  assert.match(app, /contentSecurityPolicy/);
  assert.match(app, /frameAncestors:\s*\["'none'"\]/);
  assert.match(app, /Cache-Control',\s*'no-store'/);
});
