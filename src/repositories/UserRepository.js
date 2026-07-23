const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  create({ nombre, email, telefono, empresa, passwordHash }) {
    return this.query(
      `INSERT INTO usuarios (nombre,email,telefono,empresa,password_hash)
       VALUES ($1,LOWER($2),$3,$4,$5) RETURNING id,nombre,email,empresa,rol`,
      [nombre, email, telefono || null, empresa, passwordHash]
    ).then((result) => result.rows[0]);
  }

  findByEmail(email) {
    return this.query('SELECT * FROM usuarios WHERE email=LOWER($1) AND activo=TRUE', [email])
      .then((result) => result.rows[0]);
  }

  findContact(id) {
    return this.query('SELECT id,nombre,email,telefono,empresa FROM usuarios WHERE id=$1', [id])
      .then((result) => result.rows[0]);
  }

  verifyEmailByToken(tokenHash) {
    return this.query(
      `UPDATE usuarios u SET email_verificado=TRUE,actualizado_en=NOW()
       FROM tokens_usuario t WHERE t.usuario_id=u.id AND t.tipo='verificacion'
       AND t.token_hash=$1 AND t.usado_en IS NULL AND t.expira_en>NOW()
       RETURNING u.id,u.email`, [tokenHash]
    ).then((result) => result.rows[0]);
  }

  updatePassword(id, passwordHash) {
    return this.query('UPDATE usuarios SET password_hash=$1,actualizado_en=NOW() WHERE id=$2', [passwordHash, id]);
  }

  async upsertAdmin({ email, passwordHash }) {
    return this.query(
      `INSERT INTO usuarios (nombre,email,empresa,password_hash,rol,email_verificado)
       VALUES ('Administrador FMV',LOWER($1),'FMV InfraSec',$2,'admin',TRUE)
       ON CONFLICT (email) DO UPDATE SET rol='admin',activo=TRUE`,
      [email, passwordHash]
    );
  }

  async upsertSuperAdmin({ email, passwordHash }) {
    return this.query(
      `INSERT INTO usuarios (nombre,email,empresa,password_hash,rol,email_verificado)
       VALUES ('Superadministrador FMV',LOWER($1),'FMV InfraSec',$2,'sa',TRUE)
       ON CONFLICT (email) DO UPDATE SET rol='sa',activo=TRUE`,
      [email, passwordHash]
    );
  }
}

module.exports = UserRepository;
