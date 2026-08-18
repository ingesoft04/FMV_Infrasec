const AppError = require('../core/AppError');
const { referenciaPago } = require('../core/security');
const paymentMethods = require('../core/paymentMethods');

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

  listPaymentMethods() {
    return { metodos: paymentMethods.list() };
  }

  async createPayment(userId, data) {
    const quote = await this.quotes.accepted(data.cotizacion_id, userId);
    if (!quote) throw new AppError('Debe aceptar una cotización válida antes de pagar.');
    const method = String(data.metodo || 'transferencia').toLowerCase();
    if (!paymentMethods.isSupported(method)) throw new AppError('Método de pago no disponible.');
    const existing = await this.payments.activeForQuote(quote.id, userId);
    if (existing) throw new AppError(`Ya existe un pago ${existing.estado} para esta cotización.`, 409);
    const local = this.config.paymentProvider === 'local';
    const externalReference = String(data.referencia_externa || '').trim().slice(0, 80) || null;
    const note = String(data.nota || '').trim().slice(0, 300) || null;
    const payment = await this.payments.create({
      quoteId: quote.id, userId, reference: referenciaPago(), amount: quote.total,
      currency: quote.moneda, method,
      provider: this.config.paymentProvider, state: local ? 'en_validacion' : 'pendiente',
      metadata: { modo: local ? 'validacion_manual' : 'pasarela_externa', referencia_externa: externalReference, nota: note }
    });
    await this.appointments.addActivity(quote.asesoria_id, userId, 'pago', `Pago ${payment.estado}`, { referencia: payment.referencia });
    return { pago: payment, modo: local ? 'validacion_manual' : 'pasarela_externa' };
  }
}

module.exports = SalesService;
