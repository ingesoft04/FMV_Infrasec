const BaseRepository = require('./BaseRepository');

class AppointmentRepository extends BaseRepository {
  occupied(consultantId, date) {
    return this.query(
      "SELECT TO_CHAR(hora,'HH24:MI') hora FROM asesorias WHERE consultor_id=$1 AND fecha=$2 AND estado!='cancelada'",
      [consultantId, date]
    ).then((result) => result.rows.map((row) => row.hora));
  }

  byUser(userId) {
    return this.query(
      `SELECT a.*,p.nombre producto,c.nombre consultor FROM asesorias a
       JOIN productos p ON p.id=a.producto_id JOIN consultores c ON c.id=a.consultor_id
       WHERE a.usuario_id=$1 ORDER BY a.fecha DESC,a.hora DESC`, [userId]
    ).then((result) => result.rows);
  }

  create(data) {
    return this.query(
      `INSERT INTO asesorias (usuario_id,producto_id,consultor_id,fecha,hora,objetivo,presupuesto,canal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [data.userId, data.productId, data.consultantId, data.date, data.time, data.objective, data.budget || null, data.channel]
    ).then((result) => result.rows[0]);
  }

  calendar(id, user) {
    return this.query(
      `SELECT a.*,p.nombre producto,p.duracion_minutos FROM asesorias a
       JOIN productos p ON p.id=a.producto_id WHERE a.id=$1 AND (a.usuario_id=$2 OR $3='admin')`,
      [id, user.id, user.rol]
    ).then((result) => result.rows[0]);
  }

  cancel(id, userId) {
    return this.query(
      "UPDATE asesorias SET estado='cancelada' WHERE id=$1 AND usuario_id=$2 AND estado NOT IN ('cancelada','completada') RETURNING id,estado",
      [id, userId]
    ).then((result) => result.rows[0]);
  }

  reschedule(id, userId, date, time) {
    return this.query(
      "UPDATE asesorias SET fecha=$1,hora=$2,estado='reprogramada' WHERE id=$3 AND usuario_id=$4 AND estado NOT IN ('cancelada','completada') RETURNING *",
      [date, time, id, userId]
    ).then((result) => result.rows[0]);
  }

  find(id) {
    return this.query('SELECT * FROM asesorias WHERE id=$1', [id]).then((result) => result.rows[0]);
  }

  markWon(id) {
    return this.query("UPDATE asesorias SET etapa='ganado',probabilidad=100 WHERE id=$1", [id]);
  }

  addActivity(appointmentId, userId, type, description, data = {}) {
    return this.query(
      'INSERT INTO actividades_crm (asesoria_id,usuario_id,tipo,descripcion,datos) VALUES ($1,$2,$3,$4,$5)',
      [appointmentId, userId || null, type, description, data]
    );
  }
}

module.exports = AppointmentRepository;
