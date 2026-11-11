const BaseRepository = require('./BaseRepository');

class ContactRequestRepository extends BaseRepository {
  async create(data) {
    const { rows } = await this.query(
      `INSERT INTO solicitudes_contacto
       (numero_seguimiento, nombre, email, telefono, comentario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING numero_seguimiento, estado, creado_en`,
      [data.trackingNumber, data.name, data.email, data.phone, data.comment]
    );
    return rows[0];
  }

  async findStatus(trackingNumber) {
    const { rows } = await this.query(
      `SELECT numero_seguimiento, estado, creado_en, actualizado_en
       FROM solicitudes_contacto
       WHERE numero_seguimiento = $1`,
      [trackingNumber]
    );
    return rows[0] || null;
  }
}

module.exports = ContactRequestRepository;
