const AppError = require('../core/AppError');

const placeholders = [
  'cambie', 'change-me', 'replace-me', 'reemplazar', 'desarrollo-local',
  'fmv_local', 'adminfmv2026', 'cambiarsa2026'
];

function isPlaceholder(value) {
  const normalized = String(value || '').toLowerCase();
  return !normalized || placeholders.some((item) => normalized.includes(item));
}

function isStrongSecret(value, minimum = 16) {
  return typeof value === 'string' && value.length >= minimum && !isPlaceholder(value);
}

function isStrongPassword(value) {
  return isStrongSecret(value, 12)
    && /[a-z]/.test(value) && /[A-Z]/.test(value)
    && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'postgres:', 'postgresql:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
}

module.exports = function validateConfiguration(config, environment = process.env) {
  if (environment.NODE_ENV !== 'production') return;

  const errors = [];
  if (!isStrongSecret(environment.POSTGRES_PASSWORD, 16)) {
    errors.push('POSTGRES_PASSWORD debe tener al menos 16 caracteres y no ser un valor de ejemplo');
  }
  if (!validUrl(environment.DATABASE_URL) || isPlaceholder(environment.DATABASE_URL)) {
    errors.push('DATABASE_URL debe ser una URL PostgreSQL real sin valores de ejemplo');
  }
  if (!isStrongSecret(config.jwtSecret, 32)) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres y no ser un valor de ejemplo');
  }
  if (config.bootstrapUsers) {
    if (!config.adminEmail || !config.adminEmail.includes('@')) errors.push('ADMIN_EMAIL es obligatorio al crear usuarios iniciales');
    if (!isStrongPassword(config.adminPassword)) errors.push('ADMIN_PASSWORD no cumple la política de seguridad');
    if (!config.saEmail || !config.saEmail.includes('@')) errors.push('SA_EMAIL es obligatorio al crear usuarios iniciales');
    if (!isStrongPassword(config.saPassword)) errors.push('SA_PASSWORD no cumple la política de seguridad');
  }
  if (!validUrl(config.frontendUrl)) errors.push('FRONTEND_URL debe ser una URL válida');
  if (!validUrl(config.baseUrl)) errors.push('APP_BASE_URL debe ser una URL válida');
  if (config.paymentProvider !== 'local' && !isStrongSecret(environment.PAYMENT_WEBHOOK_SECRET, 24)) {
    errors.push('PAYMENT_WEBHOOK_SECRET debe tener al menos 24 caracteres para pagos externos');
  }
  if (errors.length) throw new AppError(`Configuración insegura:\n- ${errors.join('\n- ')}`, 500);
};

module.exports.isPlaceholder = isPlaceholder;
module.exports.isStrongSecret = isStrongSecret;
module.exports.isStrongPassword = isStrongPassword;
