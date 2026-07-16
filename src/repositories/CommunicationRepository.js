const BaseRepository = require('./BaseRepository');

class CommunicationRepository extends BaseRepository {
  register({ usuarioId, asesoriaId, canal, destino, asunto, mensaje, estado, proveedorId, error }) {
    return this.query(
      `INSERT INTO comunicaciones
       (usuario_id,asesoria_id,canal,destino,asunto,mensaje,estado,proveedor_id,error,enviado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7::varchar,$8,$9,CASE WHEN $7::varchar IN ('enviado','simulado') THEN NOW() END)`,
      [usuarioId || null, asesoriaId || null, canal, destino || null, asunto || null, mensaje, estado, proveedorId || null, error || null]
    );
  }
}

module.exports = CommunicationRepository;
