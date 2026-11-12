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
  assert.match(html, /assets\/brand\/logo-dark-background\.webp/);
  assert.match(html, /mix-blend-mode:\s*screen/);
  assert.match(html, /data-toggle-cards="services"/);
  assert.match(html, /data-toggle-cards="industries"/);
  assert.match(html, /class="disclosure-block/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /href="#arquitectura"[^>]*>Arquitectura/);
  assert.doesNotMatch(html, /class="stats-bar"/);
  assert.match(html, /https:\/\/wa\.me\/573025286029/);
  assert.match(html, /aria-label="Escribir a FMV InfraSec por WhatsApp"/);
  assert.match(html, /Información técnica y capacidades avanzadas/);
  assert.match(html, /className = 'technical-panel'/);
  assert.match(html, /class="service-icon"><svg/);
  assert.doesNotMatch(html, /class="service-icon">[🔐🧩🏗📋⚙🤖]/u);
  assert.match(html, /<\/script>\s*<\/body>\s*<\/html>\s*$/);
});

test('portales, imágenes y API continúan disponibles', async () => {
  const rutas = [
    'portal-comercial.html',
    'admin-comercial.html',
    'gestion-asesorias.html',
    'assets/images/hero-ciberseguridad.png',
    'assets/images/equipo-consultoria.png',
    'assets/brand/logo-dark-background.webp',
    'assets/brand/logo-light-background.webp',
    'health',
    'api/productos',
    'api/consultores',
    'api/metodos-pago'
  ];
  await Promise.all(rutas.map(obtener));
});

test('el catálogo de modelos, filtros y demostraciones están conectados', async () => {
  const main = await (await obtener('fmv-infrasec.html')).text();
  assert.match(main, /id="modelos"/);
  assert.match(main, /Encuentra un diseño para tu negocio/);
  assert.match(main, /href="\/modelos"/);

  const catalog = await (await obtener('modelos')).text();
  assert.match(catalog, /data-models-search/);
  assert.match(catalog, /data-models-filter/);
  assert.match(catalog, /data-models-catalog/);

  const data = await (await obtener('assets/models/models.js')).text();
  for (const value of ['Psicología', 'Joyería', 'Restaurante', 'Serviteca', 'Maquillaje', 'Espacio Sereno']) {
    assert.match(data, new RegExp(value));
  }
  for (const slug of ['psicologia', 'joyeria', 'restaurante', 'serviteca', 'maquillaje']) {
    const demo = await (await obtener(`modelos/${slug}`)).text();
    assert.match(demo, /Este es un modelo demostrativo/);
    assert.match(demo, /Quiero este modelo/);
    assert.match(demo, /Volver a todos los modelos/);
  }
  const portal = await (await obtener('portal-comercial.html?modelo=psicologia')).text();
  assert.match(portal, /portal-interest\.js/);
});

test('archivos internos del servidor no quedan expuestos públicamente', async () => {
  for (const route of ['src/app.js', 'sql/init.sql', 'package.json', 'docker-compose.yml', '.env.example']) {
    const response = await fetch(`${BASE}/${route}`);
    assert.equal(response.status, 404, `${route} no debe quedar disponible públicamente`);
  }
});

test('los métodos de pago siguen disponibles en el CRM y el portal no solicita datos sensibles', async () => {
  const methods = await (await obtener('api/metodos-pago')).json();
  assert.deepEqual(methods.metodos.map((method) => method.id), ['pse','tarjeta','transferencia','nequi','daviplata','efectivo']);

  const portal = await (await obtener('portal-comercial.html')).text();
  assert.match(portal, /No incluya contraseñas, números de tarjeta ni información confidencial/);
  assert.doesNotMatch(portal, /CVV|fecha de vencimiento|número completo de tarjeta/);

  const admin = await (await obtener('admin-comercial.html')).text();
  assert.match(admin, />Valores</);
  assert.match(admin, /en_validacion/);
  assert.match(admin, /Motivo del rechazo/);
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

test('el portal comercial recibe datos sin crear una cuenta y entrega seguimiento', async () => {
  const response = await obtener('portal-comercial.html');
  const html = await response.text();
  for (const field of ['contactName', 'contactEmail', 'contactPhone', 'contactComment']) assert.match(html, new RegExp(`id="${field}"`));
  assert.match(html, /\/api\/solicitudes-contacto/);
  assert.match(html, /Número de seguimiento/);
  assert.doesNotMatch(html, /auth\/registro|type="password"|Crear cuenta/);
  assert.match(html, /@media\(max-width:620px\)/);
});
