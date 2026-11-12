const test = require('node:test');
const assert = require('node:assert/strict');
const ContactRequestService = require('../src/services/ContactRequestService');

test('crea una solicitud pública con seguimiento no secuencial', async () => {
  let stored;
  const service = new ContactRequestService({
    contactRequests: {
      create: async (data) => {
        stored = data;
        return { numero_seguimiento: data.trackingNumber, estado: 'recibida', creado_en: new Date() };
      }
    }
  });
  const result = await service.create({
    nombre: '  Ana Pérez  ', correo: 'ANA@EXAMPLE.COM', telefono: '+57 302 528 6029',
    comentario: 'Necesito revisar la seguridad de mi infraestructura.'
  });
  assert.match(result.solicitud.numero_seguimiento, /^FMV-\d{8}-[A-F0-9]{8}$/);
  assert.equal(stored.name, 'Ana Pérez');
  assert.equal(stored.email, 'ana@example.com');
});

test('rechaza datos incompletos y no expone información personal al consultar', async () => {
  const service = new ContactRequestService({
    contactRequests: {
      findStatus: async () => ({ numero_seguimiento: 'FMV-20261110-A1B2C3D4', estado: 'recibida' })
    }
  });
  await assert.rejects(() => service.create({}), /nombre/i);
  const result = await service.status('fmv-20261110-a1b2c3d4');
  assert.equal(result.solicitud.estado, 'recibida');
  assert.equal(result.solicitud.email, undefined);
});
