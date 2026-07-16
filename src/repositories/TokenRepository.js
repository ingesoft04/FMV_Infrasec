const BaseRepository = require('./BaseRepository');

class TokenRepository extends BaseRepository {
  create({ userId, type, tokenHash, minutes }) {
    return this.query(
      `INSERT INTO tokens_usuario (usuario_id,tipo,token_hash,expira_en)
       VALUES ($1,$2,$3,NOW()+($4 || ' minutes')::interval)`,
      [userId, type, tokenHash, String(minutes)]
    );
  }

  findValid(type, tokenHash) {
    return this.query(
      `SELECT usuario_id FROM tokens_usuario
       WHERE tipo=$1 AND token_hash=$2 AND usado_en IS NULL AND expira_en>NOW()`,
      [type, tokenHash]
    ).then((result) => result.rows[0]);
  }

  use(tokenHash) {
    return this.query('UPDATE tokens_usuario SET usado_en=NOW() WHERE token_hash=$1', [tokenHash]);
  }
}

module.exports = TokenRepository;
