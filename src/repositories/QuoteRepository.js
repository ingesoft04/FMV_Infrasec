const BaseRepository = require('./BaseRepository');

class QuoteRepository extends BaseRepository {
  byUser(userId) {
    return this.query(
      `SELECT q.*,p.nombre producto FROM cotizaciones q JOIN asesorias a ON a.id=q.asesoria_id
       JOIN productos p ON p.id=a.producto_id WHERE q.usuario_id=$1 ORDER BY q.creado_en DESC`, [userId]
    ).then((result) => result.rows);
  }

  answer(id, userId, state) {
    return this.query(
      "UPDATE cotizaciones SET estado=$1,actualizado_en=NOW() WHERE id=$2 AND usuario_id=$3 AND estado IN ('enviada','borrador') RETURNING *",
      [state, id, userId]
    ).then((result) => result.rows[0]);
  }

  forPdf(id, user) {
    return this.query(
      `SELECT q.*,u.nombre cliente,u.empresa,p.nombre producto FROM cotizaciones q
       JOIN usuarios u ON u.id=q.usuario_id JOIN asesorias a ON a.id=q.asesoria_id
       JOIN productos p ON p.id=a.producto_id WHERE q.id=$1 AND (q.usuario_id=$2 OR $3='admin')`,
      [id, user.id, user.rol]
    ).then((result) => result.rows[0]);
  }

  accepted(id, userId) {
    return this.query("SELECT * FROM cotizaciones WHERE id=$1 AND usuario_id=$2 AND estado='aceptada'", [id, userId])
      .then((result) => result.rows[0]);
  }

  nextNumber() {
    return this.query("SELECT COUNT(*)::int+1 numero FROM cotizaciones WHERE EXTRACT(YEAR FROM creado_en)=EXTRACT(YEAR FROM NOW())")
      .then((result) => `FMV-${new Date().getFullYear()}-${String(result.rows[0].numero).padStart(4, '0')}`);
  }

  create(data) {
    return this.query(
      `INSERT INTO cotizaciones (numero,asesoria_id,usuario_id,subtotal,impuestos,total,moneda,vigencia_hasta,alcance,condiciones,estado,creado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [data.number, data.appointmentId, data.userId, data.subtotal, data.taxes, data.total, data.currency, data.validUntil, data.scope, data.terms, data.state, data.createdBy]
    ).then((result) => result.rows[0]);
  }
}

module.exports = QuoteRepository;
