class AuthController {
  constructor(service) {
    this.service = service;
  }
  register = async (req, res) => res.status(201).json(await this.service.register(req.body));
  verify = async (req, res) => res.json(await this.service.verify(req.body.token));
  recover = async (req, res) => res.json(await this.service.recover(req.body.email));
  reset = async (req, res) => res.json(await this.service.reset(req.body.token, req.body.password));
  login = async (req, res) => res.json(await this.service.login(req.body.email, req.body.password));
}
module.exports = AuthController;
