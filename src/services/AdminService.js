const AppError = require('../core/AppError');

class AdminService {
  constructor({ admin, appointments, quotes, users, notifications, config }) {
    this.admin = admin;
    this.appointments = appointments;
    this.quotes = quotes;
    this.users = users;
    this.notifications = notifications;
    this.config = config;
    this.stages = ['nuevo','calificado','propuesta','negociacion','ganado','perdido'];
    this.states = ['solicitada','confirmada','completada','cancelada','reprogramada'];
  }

  async summary() {
    return (await this.admin.dashboard()).resumen;
  }

  async crm() {
    const data = await this.admin.dashboard();
    delete data.resumen;
    return data;
  }

  async updateOpportunity(id, data, actorId) {
    if (data.etapa && !this.stages.includes(data.etapa)) throw new AppError('Etapa inválida.');
    const opportunity = await this.admin.updateOpportunity(id, data);
    if (!opportunity) throw new AppError('Oportunidad no encontrada.', 404);
    await this.appointments.addActivity(id, actorId, 'crm', 'Información comercial actualizada', data);
    return { oportunidad: opportunity };
  }

  async createQuote(data, actorId) {
    const opportunity = await this.appointments.find(data.asesoria_id);
    if (!opportunity) throw new AppError('Oportunidad no encontrada.', 404);
    const subtotal = Number(data.subtotal);
    const taxes = Number(data.impuestos || 0);
    if (!Number.isFinite(subtotal) || subtotal < 0 || !data.alcance) throw new AppError('Subtotal y alcance son obligatorios.');
    const number = await this.quotes.nextNumber();
    const quote = await this.quotes.create({
      number, appointmentId: opportunity.id, userId: opportunity.usuario_id, subtotal, taxes,
      total: subtotal + taxes, currency: data.moneda || 'COP', validUntil: data.vigencia_hasta,
      scope: data.alcance, terms: data.condiciones || null, state: data.enviar ? 'enviada' : 'borrador', createdBy: actorId
    });
    await this.admin.updateOpportunity(opportunity.id, { etapa: 'propuesta', valor_estimado: subtotal + taxes, probabilidad: 50 });
    if (data.enviar) {
      const customer = await this.users.findContact(opportunity.usuario_id);
      const text = `Hola ${customer.nombre}, tu cotización ${number} por ${subtotal + taxes} COP está disponible en el portal FMV.`;
      await this.notifications.email({ usuarioId: customer.id, asesoriaId: opportunity.id, destino: customer.email, asunto: `Cotización ${number} - FMV InfraSec`, texto: text, html: `<p>${text}</p>` });
      if (customer.telefono) await this.notifications.whatsapp({ usuarioId: customer.id, asesoriaId: opportunity.id, destino: customer.telefono, mensaje: text });
    }
    await this.appointments.addActivity(opportunity.id, actorId, 'cotizacion', `Cotización ${number} creada`);
    return { cotizacion: quote };
  }

  async updatePayment(id, data, actorId) {
    if (!['pendiente','en_validacion','aprobado','rechazado','reembolsado'].includes(data.estado)) throw new AppError('Estado inválido.');
    const note = String(data.nota || '').trim().slice(0, 500);
    if (data.estado === 'rechazado' && !note) throw new AppError('Indique el motivo del rechazo.');
    const payment = await this.admin.updatePaymentState(id, data.estado, actorId, note);
    if (!payment) throw new AppError('Pago no encontrado.', 404);
    return { pago: payment };
  }

  async updateProductPrice(id, value) {
    const price = value === null || value === '' ? null : Number(value);
    if (price !== null && (!Number.isFinite(price) || price < 0)) throw new AppError('El valor debe ser un número positivo.');
    const product = await this.admin.updateProductPrice(id, price);
    if (!product) throw new AppError('Producto no encontrado.', 404);
    return { producto: product };
  }

  async updateAppointment(id, state) {
    if (!this.states.includes(state)) throw new AppError('Estado inválido.');
    const appointment = await this.admin.updateAppointmentState(id, state);
    if (!appointment) throw new AppError('Asesoría no encontrada.', 404);
    return { asesoria: appointment };
  }

  async notify(id, data) {
    const appointment = await this.appointments.find(id);
    if (!appointment) throw new AppError('Oportunidad no encontrada.', 404);
    const customer = await this.users.findContact(appointment.usuario_id);
    const results = [];
    if (data.canal === 'email' || data.canal === 'ambos') results.push(await this.notifications.email({ usuarioId: customer.id, asesoriaId: id, destino: customer.email, asunto: data.asunto || 'Mensaje de FMV InfraSec', texto: data.mensaje, html: `<p>${String(data.mensaje).replaceAll('\n','<br>')}</p>` }));
    if ((data.canal === 'whatsapp' || data.canal === 'ambos') && customer.telefono) results.push(await this.notifications.whatsapp({ usuarioId: customer.id, asesoriaId: id, destino: customer.telefono, mensaje: data.mensaje }));
    return { resultados: results };
  }
}

module.exports = AdminService;
