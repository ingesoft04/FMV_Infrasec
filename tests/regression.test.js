const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:4100';

async function obtener(ruta) {
  const response = await fetch(`${BASE}/${ruta}`);
  assert.equal(response.status, 200, `${ruta} debe responder HTTP 200`);
  return response;
}

test('sitio principal conserva contenido, navegación y recursos visuales', async () => {
  const inicio = await obtener('');
  assert.equal(
    inicio.url,
    `${BASE}/fmv-infrasec.html`,
    'la raíz debe abrir automáticamente la página principal'
  );

  const response = await obtener('fmv-infrasec.html');
  const html = await response.text();
  assert.match(response.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
  assert.match(response.headers.get('content-security-policy') || '', /script-src-attr 'unsafe-inline'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-powered-by'), null);

  for (const texto of [
    'Tecnología segura',
    'Quiénes somos',
    'Lo que hacemos',
    'Núcleo de seguridad',
    'Cómo trabajamos',
    'Sectores que atendemos',
    'Arquitectura del sistema',
    '¿Listo para empezar?'
  ]) assert.match(html, new RegExp(texto, 'i'), `falta el contenido: ${texto}`);

  assert.match(html, /cursor:\s*auto/);
  assert.doesNotMatch(html, /cursor:\s*none/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.match(html, /--font-heading:\s*"Segoe UI Variable Display"/);
  assert.match(html, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-weight:\s*700/s);
  assert.match(html, /\.reveal\s*\{[^}]*opacity:\s*1/s);
  assert.match(html, /Sistema de lectura/);
  assert.match(html, /\.cta-section h2\s*\{[^}]*font-size:\s*clamp\(2rem/s);
  assert.match(html, /\.services-grid\s*\{[^}]*gap:\s*1rem/s);
  assert.match(html, /assets\/images\/hero-ciberseguridad\.png/);
  assert.match(html, /assets\/images\/equipo-consultoria\.png/);
  assert.match(html, /assets\/brand\/logo-temporal\.svg/);
  assert.match(html, /<\/script>\s*<\/body>\s*<\/html>\s*$/);
});

test('portales, imágenes y API continúan disponibles', async () => {
  const rutas = [
    'portal-comercial.html',
    'admin-comercial.html',
    'gestion-asesorias.html',
    'assets/images/hero-ciberseguridad.png',
    'assets/images/equipo-consultoria.png',
    'assets/brand/logo-temporal.svg',
    'health',
    'api/productos',
    'api/consultores'
  ];
  await Promise.all(rutas.map(obtener));
});

test('el portal interno separa las funciones del asesor y del SA', async () => {
  const response = await obtener('gestion-asesorias.html');
  const html = await response.text();
  assert.match(html, /Agenda y control de <em>asesorías<\/em>/);
  assert.match(html, /Cada asesor visualiza únicamente las citas que tiene asignadas/);
  assert.match(html, /Administración de usuarios/);
  assert.match(html, /Crear usuario/);
  assert.match(html, /Deshabilitar/);
  assert.match(html, /\/staff\/asesorias/);
  assert.match(html, /\/staff\/usuarios/);

  for (const route of ['api/staff/asesorias', 'api/staff/usuarios']) {
    const unauthorized = await fetch(`${BASE}/${route}`);
    assert.equal(unauthorized.status, 401, `${route} debe exigir autenticación`);
  }
});

test('la política de contraseña rechaza claves débiles', async () => {
  const response = await fetch(`${BASE}/api/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Prueba',
      empresa: 'FMV',
      email: 'debil@example.invalid',
      password: '12345678'
    })
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /contraseña segura de mínimo 10 caracteres/i);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('los portales sensibles no persisten JWT en localStorage', async () => {
  for (const page of ['portal-comercial.html', 'admin-comercial.html', 'gestion-asesorias.html']) {
    const response = await obtener(page);
    const html = await response.text();
    assert.doesNotMatch(html, /localStorage/);
    assert.match(html, /sessionStorage/);
  }
  const admin = await (await obtener('admin-comercial.html')).text();
  assert.match(admin, /Sistema visual legible del CRM/);
  assert.match(admin, /html\{font-size:17px\}/);
});

test('el portal comercial conserva una presentación centrada y legible', async () => {
  const response = await obtener('portal-comercial.html');
  const html = await response.text();
  assert.match(html, /Sistema de lectura y centrado del portal comercial/);
  assert.match(html, /\.wrap\s*\{[^}]*width:\s*min\(1360px,[^}]*margin-inline:\s*auto/s);
  assert.match(html, /\.layout\s*\{[^}]*width:\s*min\(1080px,\s*100%\)[^}]*margin-inline:\s*auto[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(html, /#authCard\s*\{[^}]*width:\s*min\(620px,\s*100%\)[^}]*margin-inline:\s*auto/s);
  assert.match(html, /\.layout > section > \.card\s*\{[^}]*width:\s*100%[^}]*margin-inline:\s*auto/s);
  assert.match(html, /\.field input,\s*\.field select,\s*\.field textarea\s*\{[^}]*min-height:\s*50px/s);
  assert.match(html, /@media \(max-width:\s*620px\)/);
});
