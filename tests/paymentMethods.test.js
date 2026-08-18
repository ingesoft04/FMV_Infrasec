const test = require('node:test');
const assert = require('node:assert/strict');
const paymentMethods = require('../src/core/paymentMethods');

test('el catálogo de pagos expone únicamente métodos admitidos', () => {
  const methods = paymentMethods.list();
  assert.deepEqual(methods.map(({ id }) => id), ['pse','tarjeta','transferencia','nequi','daviplata','efectivo']);
  assert.equal(paymentMethods.isSupported('tarjeta'), true);
  assert.equal(paymentMethods.isSupported('bitcoin'), false);
});

test('el catálogo devuelto no permite modificar la definición interna', () => {
  const methods = paymentMethods.list();
  methods[0].nombre = 'alterado';
  assert.equal(paymentMethods.list()[0].nombre, 'PSE');
});
