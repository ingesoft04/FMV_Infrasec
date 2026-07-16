const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:4100';

async function obtener(ruta) {
  const response = await fetch(`${BASE}/${ruta}`);
  assert.equal(response.status, 200, `${ruta} debe responder HTTP 200`);
  return response;
}

test('sitio principal conserva contenido, navegación y recursos visuales', async () => {
  const response = await obtener('fmv-infrasec.html');
  const html = await response.text();

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
  assert.match(html, /\.reveal\s*\{[^}]*opacity:\s*1/s);
  assert.match(html, /assets\/images\/hero-ciberseguridad\.png/);
  assert.match(html, /assets\/images\/equipo-consultoria\.png/);
  assert.match(html, /assets\/brand\/logo-temporal\.svg/);
  assert.match(html, /<\/script>\s*<\/body>\s*<\/html>\s*$/);
});

test('portales, imágenes y API continúan disponibles', async () => {
  const rutas = [
    'portal-comercial.html',
    'admin-comercial.html',
    'assets/images/hero-ciberseguridad.png',
    'assets/images/equipo-consultoria.png',
    'assets/brand/logo-temporal.svg',
    'health',
    'api/productos',
    'api/consultores'
  ];
  await Promise.all(rutas.map(obtener));
});
