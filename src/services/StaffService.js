const bcrypt = require('bcryptjs');
const AppError = require('../core/AppError');
const { isStrongPassword, passwordRequirement } = require('../core/passwordPolicy');

class StaffService {
  constructor({ staff, appointments }) {
    this.staff = staff;
    this.appointments = appointments;
    this.roles = ['cliente', 'asesor', 'admin', 'sa'];
    this.states = ['solicitada', 'confirmada', 'completada', 'cancelada', 'reprogramada'];
  }

  async appointmentsFor(user) {
    return { asesorias: await this.staff.appointments(user) };
  }

  async updateAppointment(id, state, user) {
    if (!this.states.includes(state)) throw new AppError('Estado de asesoría inválido.');
    const appointment = await this.staff.updateAppointment(id, state, user);
    if (!appointment) throw new AppError('Asesoría no encontrada o no asignada a este asesor.', 404);
    await this.appointments.addActivity(id, user.id, 'estado', `Estado actualizado a ${state}`);
    return { asesoria: appointment };
  }

  async users() {
    return { usuarios: await this.staff.users() };
  }

  validateUser(data, editing = false) {
    if (!data.nombre?.trim() || !data.email?.trim() || !data.empresa?.trim() || !this.roles.includes(data.rol)) {
      throw new AppError('Nombre, correo, empresa y rol válido son obligatorios.');
    }
    if (!editing && !isStrongPassword(data.password)) {
      throw new AppError(`La contraseña debe tener ${passwordRequirement}.`);
    }
    if (editing && data.password && !isStrongPassword(data.password)) {
      throw new AppError(`La nueva contraseña debe tener ${passwordRequirement}.`);
    }
  }

  async createUser(data) {
    this.validateUser(data);
    const user = await this.staff.createUser({
      ...data,
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      empresa: data.empresa.trim(),
      passwordHash: await bcrypt.hash(data.password, 12)
    });
    return { usuario: user };
  }

  async updateUser(id, data) {
    this.validateUser(data, true);
    const user = await this.staff.updateUser(id, {
      ...data,
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      empresa: data.empresa.trim(),
      passwordHash: data.password ? await bcrypt.hash(data.password, 12) : null
    });
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    return { usuario: user };
  }

  async setUserState(id, active, actorId) {
    if (typeof active !== 'boolean') throw new AppError('El estado activo es obligatorio.');
    const user = await this.staff.setUserState(id, active, actorId);
    if (!user) throw new AppError('Usuario no encontrado o no puede deshabilitar su propia cuenta.', 404);
    return { usuario: user };
  }
}

module.exports = StaffService;
