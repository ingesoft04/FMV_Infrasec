const AppError = require('../core/AppError');
const { referenciaPago } = require('../core/security');

class SalesService {
  constructor({ quotes, payments, appointments, documents, config }) {
    this.quotes = quotes;
    this.payments = payments;
    this.appointments = appointments;
    this.documents = documents;
    this.config = config;
  }

  listQuotes(userId) {
    return this.quotes.byUser(userId).then((cotizaciones) => ({ cotizaciones }));
  }

  async answerQuote(id, userId, state) {
    if (!['aceptada','rechazada'].includes(state)) throw new AppError('Respuesta inválida.');
    const quote = await this.quotes.answer(id, userId, state);
    if (!quote) throw new AppError('Cotización no disponible.', 404);
    if (state === 'aceptada') await this.appointments.markWon(quote.asesoria_id);
    await this.appointments.addActivity(quote.asesoria_id, userId, 'cotizacion', `Cotización ${state}`);
    return { cotizacion: quote };
  }

  async pdf(id, user, res) {
    const quote = await this.quotes.forPdf(id, user);
    if (!quote) throw new AppError('Cotización no encontrada.', 404);
    return this.documents.quote(res, quote);
  }

  listPayments(userId) {
    return this.payments.byUser(userId).then((pagos) => ({ pagos }));
  }

  async createPayment(userId, data) {
    const quote = await this.quotes.accepted(data.cotizacion_id, userId);
    if (!quote) throw new AppError('Debe aceptar una cotización válida antes de pagar.');
    const local = this.config.paymentProvider === 'local';
    const payment = await this.payments.create({
      quoteId: quote.id, userId, reference: referenciaPago(), amount: quote.total,
      currency: quote.moneda, method: data.metodo || 'transferencia',
      provider: this.config.paymentProvider, state: local ? 'aprobado' : 'pendiente',
      metadata: { modo: local ? 'simulacion_local' : 'externo' }
    });
    await this.appointments.addActivity(quote.asesoria_id, userId, 'pago', `Pago ${payment.estado}`, { referencia: payment.referencia });
    return { pago: payment, modo: local ? 'local' : 'externo' };
  }
}

module.exports = SalesService;
