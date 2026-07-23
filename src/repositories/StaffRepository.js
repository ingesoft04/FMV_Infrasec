const BaseRepository = require('./BaseRepository');

class StaffRepository extends BaseRepository {
  appointments(user) {
    const ownFilter = user.rol === 'asesor' ? 'WHERE c.usuario_id=$1' : '';
    const values = user.rol === 'asesor' ? [user.id] : [];
    return this.query(
      `SELECT a.id,a.fecha,a.hora,a.canal,a.estado,a.objetivo,a.presupuesto,
              a.creado_en,a.actualizado_en,p.nombre producto,c.nombre asesor,
              u.nombre cliente,u.empresa,u.email,u.telefono
       FROM asesorias a
       JOIN productos p ON p.id=a.producto_id
       JOIN consultores c ON c.id=a.consultor_id
       JOIN usuarios u ON u.id=a.usuario_id
       ${ownFilter}
       ORDER BY CASE WHEN a.fecha>=CURRENT_DATE THEN 0 ELSE 1 END,a.fecha,a.hora`,
      values
    ).then((result) => result.rows);
  }

  updateAppointment(id, state, user) {
    const ownFilter = user.rol === 'asesor' ? 'AND c.usuario_id=$3' : '';
    const values = user.rol === 'asesor' ? [state, id, user.id] : [state, id];
    return this.query(
      `UPDATE asesorias a SET estado=$1
       FROM consultores c
       WHERE a.id=$2 AND c.id=a.consultor_id ${ownFilter}
       RETURNING a.*`,
      values
    ).then((result) => result.rows[0]);
  }

  users() {
    return this.query(
      `SELECT u.id,u.nombre,u.email,u.telefono,u.empresa,u.rol,u.activo,u.creado_en,
              c.id consultor_id,c.cargo
       FROM usuarios u LEFT JOIN consultores c ON c.usuario_id=u.id
       ORDER BY u.activo DESC,u.nombre`
    ).then((result) => result.rows);
  }

  async createUser(data) {
    const result = await this.query(
      `INSERT INTO usuarios
        (nombre,email,telefono,empresa,password_hash,rol,activo,email_verificado)
       VALUES ($1,LOWER($2),$3,$4,$5,$6,TRUE,TRUE)
       RETURNING id,nombre,email,telefono,empresa,rol,activo`,
      [data.nombre, data.email, data.telefono || null, data.empresa, data.passwordHash, data.rol]
    );
    const user = result.rows[0];
    if (data.rol === 'asesor') await this.syncConsultant(user, data.cargo);
    return user;
  }

  async updateUser(id, data) {
    const result = await this.query(
      `UPDATE usuarios SET nombre=$1,email=LOWER($2),telefono=$3,empresa=$4,rol=$5,
              password_hash=COALESCE($6,password_hash),actualizado_en=NOW()
       WHERE id=$7
       RETURNING id,nombre,email,telefono,empresa,rol,activo`,
      [data.nombre, data.email, data.telefono || null, data.empresa, data.rol, data.passwordHash, id]
    );
    const user = result.rows[0];
    if (!user) return null;
    if (data.rol === 'asesor') await this.syncConsultant(user, data.cargo);
    else await this.query('UPDATE consultores SET usuario_id=NULL WHERE usuario_id=$1', [id]);
    return user;
  }

  setUserState(id, active, actorId) {
    return this.query(
      `UPDATE usuarios SET activo=$1,actualizado_en=NOW()
       WHERE id=$2 AND id<>$3
       RETURNING id,nombre,email,rol,activo`,
      [active, id, actorId]
    ).then((result) => result.rows[0]);
  }

  async syncConsultant(user, position) {
    const existing = await this.query('SELECT id FROM consultores WHERE usuario_id=$1', [user.id]);
    if (existing.rows[0]) {
      await this.query(
        'UPDATE consultores SET nombre=$1,cargo=$2,activo=TRUE WHERE usuario_id=$3',
        [user.nombre, position || 'Asesor FMV', user.id]
      );
      return;
    }
    await this.query(
      'INSERT INTO consultores (nombre,cargo,bio,activo,usuario_id) VALUES ($1,$2,$3,TRUE,$4)',
      [user.nombre, position || 'Asesor FMV', 'Asesor habilitado para gestionar citas en el portal FMV.', user.id]
    );
  }
}

module.exports = StaffRepository;

