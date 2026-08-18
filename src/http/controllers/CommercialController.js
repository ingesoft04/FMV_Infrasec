class CommercialController {
  constructor({ catalog, appointments, sales }) {
    this.catalog = catalog;
    this.appointments = appointments;
    this.sales = sales;
  }
  products = async (req, res) => res.json({ productos: await this.catalog.products(req.query.categoria) });
  consultants = async (_req, res) => res.json({ consultores: await this.catalog.consultants() });
  paymentMethods = async (_req, res) => res.json(this.sales.listPaymentMethods());
  availability = async (req, res) => res.json(await this.appointments.availability(req.query.consultor_id, req.query.fecha));
  listAppointments = async (req, res) => res.json(await this.appointments.list(req.usuario.id));
  createAppointment = async (req, res) => res.status(201).json(await this.appointments.create(req.usuario.id, req.body));
  cancel = async (req, res) => res.json(await this.appointments.cancel(req.params.id, req.usuario.id));
  reschedule = async (req, res) => res.json(await this.appointments.reschedule(req.params.id, req.usuario.id, req.body));
  calendar = async (req, res) => {
    const body = await this.appointments.calendar(req.params.id, req.usuario);
    res.type('text/calendar').setHeader('Content-Disposition', 'attachment; filename="asesoria-fmv.ics"');
    res.send(body);
  };
  quotes = async (req, res) => res.json(await this.sales.listQuotes(req.usuario.id));
  answerQuote = async (req, res) => res.json(await this.sales.answerQuote(req.params.id, req.usuario.id, req.body.estado));
  quotePdf = async (req, res) => this.sales.pdf(req.params.id, req.usuario, res);
  payments = async (req, res) => res.json(await this.sales.listPayments(req.usuario.id));
  createPayment = async (req, res) => res.status(201).json(await this.sales.createPayment(req.usuario.id, req.body));
}
module.exports = CommercialController;
