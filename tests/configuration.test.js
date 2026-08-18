const test = require('node:test');
const assert = require('node:assert/strict');
const validateConfiguration = require('../src/config/validate');

function secureConfiguration() {
  return {
    jwtSecret: 'a-secure-random-jwt-secret-with-32-chars-2026',
    adminEmail: 'admin@example.com',
    adminPassword: 'Admin-Segura-2026!',
    saEmail: 'sa@example.com',
    saPassword: 'Super-Segura-2026!',
    frontendUrl: 'https://example.com',
    baseUrl: 'https://example.com',
    paymentProvider: 'local'
  };
}

test('acepta una configuración de producción segura', () => {
  assert.doesNotThrow(() => validateConfiguration(secureConfiguration(), {
    NODE_ENV: 'production',
    POSTGRES_PASSWORD: 'postgres-segura-2026',
    DATABASE_URL: 'postgres://fmv:secreto@postgres:5432/fmv'
  }));
});

test('rechaza secretos ausentes, débiles o predeterminados', () => {
  const config = secureConfiguration();
  config.bootstrapUsers = true;
  config.jwtSecret = 'desarrollo-local-cambie-esta-clave-32-caracteres';
  config.adminPassword = 'AdminFMV2026!';
  assert.throws(
    () => validateConfiguration(config, {
      NODE_ENV: 'production',
      POSTGRES_PASSWORD: 'fmv_local',
      DATABASE_URL: 'postgres://fmv:fmv_local@postgres:5432/fmv'
    }),
    /POSTGRES_PASSWORD[\s\S]*DATABASE_URL[\s\S]*JWT_SECRET[\s\S]*ADMIN_PASSWORD/
  );
});

test('no exige secretos productivos durante pruebas o desarrollo', () => {
  assert.doesNotThrow(() => validateConfiguration({}, { NODE_ENV: 'test' }));
});

test('permite retirar claves iniciales después del bootstrap', () => {
  const config = secureConfiguration();
  config.bootstrapUsers = false;
  delete config.adminEmail;
  delete config.adminPassword;
  delete config.saEmail;
  delete config.saPassword;
  assert.doesNotThrow(() => validateConfiguration(config, {
    NODE_ENV: 'production',
    POSTGRES_PASSWORD: 'postgres-segura-2026',
    DATABASE_URL: 'postgres://fmv:secreto@postgres:5432/fmv'
  }));
});
