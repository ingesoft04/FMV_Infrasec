const path = require('path');

module.exports = Object.freeze({
  port: Number(process.env.PORT || 4000),
  root: path.resolve(__dirname, '..', '..'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4100',
  baseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.APP_PORT || 4100}`,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  paymentProvider: process.env.PAYMENT_PROVIDER || 'local'
});
