class StaffController {
  constructor(service) { this.service = service; }
  appointments = async (req, res) => res.json(await this.service.appointmentsFor(req.usuario));
  updateAppointment = async (req, res) => res.json(
    await this.service.updateAppointment(req.params.id, req.body.estado, req.usuario)
  );
  users = async (_req, res) => res.json(await this.service.users());
  createUser = async (req, res) => res.status(201).json(await this.service.createUser(req.body));
  updateUser = async (req, res) => res.json(await this.service.updateUser(req.params.id, req.body));
  setUserState = async (req, res) => res.json(
    await this.service.setUserState(req.params.id, req.body.activo, req.usuario.id)
  );
}

module.exports = StaffController;

