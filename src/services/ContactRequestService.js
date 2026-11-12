const crypto = require('crypto');
const AppError = require('../core/AppError');

const TRACKING_PATTERN = /^FMV-\d{8}-[A-F0-9]{8}$/;

function requiredText(value, label, min, max) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min || text.length > max) {
    throw new AppError(`${label} debe tener entre ${min} y ${max} caracteres.`);
  }
  return text;
}

class ContactRequestService {
  constructor({ contactRequests }) {
    this.contactRequests = contactRequests;
  }

  trackingNumber() {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    return `FMV-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async create(data = {}) {
    const name = requiredText(data.nombre, 'El nombre', 2, 120);
    const email = requiredText(data.correo, 'El correo', 5, 255).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Ingrese un correo válido.');
    const phone = requiredText(data.telefono, 'El teléfono', 7, 30);
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) throw new AppError('Ingrese un teléfono válido.');
    const comment = requiredText(data.comentario, 'El comentario', 10, 2000);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const request = await this.contactRequests.create({
          trackingNumber: this.trackingNumber(), name, email, phone, comment
        });
        return {
          solicitud: request,
          mensaje: 'Recibimos sus datos. Conserve el número de seguimiento.'
        };
      } catch (error) {
        if (error.code !== '23505' || attempt === 2) throw error;
      }
    }
    throw new AppError('No fue posible generar el número de seguimiento.', 503);
  }

  async status(trackingNumber) {
    const normalized = String(trackingNumber || '').trim().toUpperCase();
    if (!TRACKING_PATTERN.test(normalized)) throw new AppError('Número de seguimiento inválido.');
    const request = await this.contactRequests.findStatus(normalized);
    if (!request) throw new AppError('No encontramos una solicitud con ese número.', 404);
    return { solicitud: request };
  }
}

module.exports = ContactRequestService;
