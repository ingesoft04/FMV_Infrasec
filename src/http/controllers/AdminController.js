class AdminController {
  constructor(service) { this.service = service; }
  summary = async (_req, res) => res.json(await this.service.summary());
  crm = async (_req, res) => res.json(await this.service.crm());
  updateOpportunity = async (req, res) => res.json(await this.service.updateOpportunity(req.params.id, req.body, req.usuario.id));
  createQuote = async (req, res) => res.status(201).json(await this.service.createQuote(req.body, req.usuario.id));
  updatePayment = async (req, res) => res.json(await this.service.updatePayment(req.params.id, req.body, req.usuario.id));
  updateProductPrice = async (req, res) => res.json(await this.service.updateProductPrice(req.params.id, req.body.precio_desde));
  updateAppointment = async (req, res) => res.json(await this.service.updateAppointment(req.params.id, req.body.estado));
  notify = async (req, res) => res.json(await this.service.notify(req.params.id, req.body));
  appointments = async (_req, res) => {
    const data = await this.service.crm();
    res.json({ asesorias: data.oportunidades });
  };
}
module.exports = AdminController;
