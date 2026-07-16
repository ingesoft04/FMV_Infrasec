const AppError = require('../core/AppError');

class AppointmentService {
  constructor({ appointments, catalog, users, notifications, documents }) {
    this.appointments = appointments;
    this.catalog = catalog;
    this.users = users;
    this.notifications = notifications;
    this.documents = documents;
    this.hours = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
  }

  validDate(date, time) {
    const moment = new Date(`${date}T${time}:00`);
    return Number.isFinite(moment.getTime()) && moment > new Date();
  }

  async availability(consultantId, date) {
    if (!consultantId || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new AppError('Consultor y fecha son obligatorios.');
    const occupied = new Set(await this.appointments.occupied(consultantId, date));
    return { fecha: date, horas: this.hours.filter((hour) => !occupied.has(hour)) };
  }

  list(userId) {
    return this.appointments.byUser(userId).then((asesorias) => ({ asesorias }));
  }

  async create(userId, data) {
    if (!data.producto_id || !data.consultor_id || !this.validDate(data.fecha, data.hora) || !data.objetivo?.trim()) {
      throw new AppError('Producto, consultor, fecha futura, hora y objetivo comercial son obligatorios.');
    }
    let appointment;
    try {
      appointment = await this.appointments.create({
        userId, productId: data.producto_id, consultantId: data.consultor_id,
        date: data.fecha, time: data.hora, objective: data.objetivo.trim(),
        budget: data.presupuesto, channel: data.canal || 'videollamada'
      });
    } catch (error) {
      if (error.code === '23505') throw new AppError('Ese horario ya fue reservado.', 409);
      throw error;
    }
    const [customer, product] = await Promise.all([this.users.findContact(userId), this.catalog.product(data.producto_id)]);
    await this.appointments.addActivity(appointment.id, userId, 'creacion', 'Oportunidad comercial creada');
    const text = `Hola ${customer.nombre}, recibimos tu solicitud sobre ${product.nombre} para ${data.fecha} a las ${data.hora}.`;
    await Promise.all([
      this.notifications.email({ usuarioId: userId, asesoriaId: appointment.id, destino: customer.email, asunto: 'Solicitud de asesoría FMV recibida', texto: text, html: `<p>${text}</p>` }),
      customer.telefono ? this.notifications.whatsapp({ usuarioId: userId, asesoriaId: appointment.id, destino: customer.telefono, mensaje: text }) : null
    ]);
    return { asesoria: appointment, mensaje: 'Asesoría comercial solicitada.' };
  }

  async calendar(id, user) {
    const appointment = await this.appointments.calendar(id, user);
    if (!appointment) throw new AppError('Asesoría no encontrada.', 404);
    return this.documents.calendar(appointment);
  }

  async cancel(id, userId) {
    const appointment = await this.appointments.cancel(id, userId);
    if (!appointment) throw new AppError('Asesoría no encontrada o no se puede cancelar.', 404);
    return { asesoria: appointment };
  }

  async reschedule(id, userId, data) {
    if (!this.validDate(data.fecha, data.hora)) throw new AppError('Seleccione una fecha y hora futuras.');
    try {
      const appointment = await this.appointments.reschedule(id, userId, data.fecha, data.hora);
      if (!appointment) throw new AppError('Asesoría no encontrada.', 404);
      return { asesoria: appointment };
    } catch (error) {
      if (error.code === '23505') throw new AppError('Ese horario ya fue reservado.', 409);
      throw error;
    }
  }
}

module.exports = AppointmentService;
