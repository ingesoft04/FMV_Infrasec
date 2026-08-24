const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../core/AppError');
const { hashToken, randomToken } = require('../core/security');
const { isStrongPassword, passwordRequirement } = require('../core/passwordPolicy');

class AuthService {
  constructor({ users, tokens, notifications, config }) {
    this.users = users;
    this.tokens = tokens;
    this.notifications = notifications;
    this.config = config;
  }

  async issueToken(userId, type, minutes) {
    const value = randomToken();
    await this.tokens.create({ userId, type, tokenHash: hashToken(value), minutes });
    return value;
  }

  async register(data) {
    if (!data.nombre || !data.email || !data.empresa || !isStrongPassword(data.password)) {
      throw new AppError(`Nombre, correo, empresa y una contraseña de ${passwordRequirement} son obligatorios.`);
    }
    const user = await this.users.create({
      nombre: data.nombre.trim(), email: data.email.trim(), telefono: data.telefono?.trim(),
      empresa: data.empresa.trim(), passwordHash: await bcrypt.hash(data.password, 12)
    });
    const token = await this.issueToken(user.id, 'verificacion', 1440);
    const link = `${this.config.baseUrl}/portal-comercial.html?verify=${token}`;
    const delivery = await this.notifications.email({
      usuarioId: user.id, destino: user.email, asunto: 'Confirma tu cuenta FMV InfraSec',
      texto: `Confirma tu cuenta ingresando a ${link}`, html: `<p><a href="${link}">Confirmar cuenta</a></p>`
    });
    return {
      usuario: user,
      mensaje: delivery.estado === 'simulado' ? 'Cuenta creada. El correo quedó simulado en modo local.' : 'Cuenta creada. Revisa tu correo para confirmarla.',
      ...(delivery.estado === 'simulado' || process.env.NODE_ENV !== 'production' ? { verification_token: token } : {})
    };
  }

  async verify(token) {
    const tokenHash = hashToken(token);
    const user = await this.users.verifyEmailByToken(tokenHash);
    if (!user) throw new AppError('El enlace no es válido o venció.');
    await this.tokens.use(tokenHash);
    return { mensaje: 'Correo confirmado correctamente.' };
  }

  async recover(email) {
    const user = await this.users.findByEmail(email || '');
    if (!user) return { mensaje: 'Si el correo existe, enviaremos instrucciones.' };
    const token = await this.issueToken(user.id, 'recuperacion', 30);
    const link = `${this.config.baseUrl}/portal-comercial.html?reset=${token}`;
    const delivery = await this.notifications.email({
      usuarioId: user.id, destino: user.email, asunto: 'Recupera tu acceso FMV',
      texto: `Restablece tu contraseña en ${link}`, html: `<p><a href="${link}">Restablecer contraseña</a>.</p>`
    });
    return {
      mensaje: 'Si el correo existe, enviaremos instrucciones.',
      ...(delivery.estado === 'simulado' || process.env.NODE_ENV !== 'production' ? { reset_token: token } : {})
    };
  }

  async reset(token, password) {
    if (!isStrongPassword(password)) throw new AppError(`La contraseña debe tener ${passwordRequirement}.`);
    const tokenHash = hashToken(token);
    const found = await this.tokens.findValid('recuperacion', tokenHash);
    if (!found) throw new AppError('El enlace no es válido o venció.');
    await this.users.updatePassword(found.usuario_id, await bcrypt.hash(password, 12));
    await this.tokens.use(tokenHash);
    return { mensaje: 'Contraseña actualizada.' };
  }

  async login(email, password) {
    const user = await this.users.findByEmail(email || '');
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      throw new AppError('Correo o contraseña incorrectos.', 401);
    }
    const payload = { id: user.id, nombre: user.nombre, rol: user.rol };
    return {
      token: jwt.sign(payload, this.config.jwtSecret, {
        algorithm: 'HS256',
        expiresIn: this.config.jwtExpiresIn,
        issuer: this.config.jwtIssuer,
        audience: this.config.jwtAudience
      }),
      usuario: { ...payload, email: user.email, empresa: user.empresa }
    };
  }
}

module.exports = AuthService;
