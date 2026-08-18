const BaseRepository = require('./BaseRepository');

class AdminRepository extends BaseRepository {
  async dashboard() {
    const [summary, opportunities, quotes, payments, communications, products] = await Promise.all([
      this.query(`SELECT (SELECT COUNT(*)::int FROM usuarios) clientes,
        (SELECT COUNT(*)::int FROM productos WHERE activo) productos,
        (SELECT COUNT(*)::int FROM asesorias) asesorias,
        (SELECT COUNT(*)::int FROM asesorias WHERE fecha>=CURRENT_DATE AND estado NOT IN ('cancelada','completada')) proximas,
        (SELECT COALESCE(SUM(valor_estimado),0) FROM asesorias WHERE etapa NOT IN ('ganado','perdido')) pipeline,
        (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE estado='aprobado') ingresos`),
      this.query(`SELECT a.*,u.nombre cliente,u.empresa,u.email,u.telefono,p.nombre producto,c.nombre consultor
        FROM asesorias a JOIN usuarios u ON u.id=a.usuario_id JOIN productos p ON p.id=a.producto_id
        JOIN consultores c ON c.id=a.consultor_id ORDER BY a.actualizado_en DESC`),
      this.query(`SELECT q.*,u.nombre cliente,u.empresa,p.nombre producto FROM cotizaciones q
        JOIN usuarios u ON u.id=q.usuario_id JOIN asesorias a ON a.id=q.asesoria_id
        JOIN productos p ON p.id=a.producto_id ORDER BY q.creado_en DESC`),
      this.query(`SELECT pa.*,u.nombre cliente,u.empresa FROM pagos pa JOIN usuarios u ON u.id=pa.usuario_id ORDER BY pa.creado_en DESC`),
      this.query('SELECT * FROM comunicaciones ORDER BY creado_en DESC LIMIT 100'),
      this.query('SELECT id,nombre,categoria,modalidad,precio_desde,activo FROM productos ORDER BY orden,nombre')
    ]);
    return {
      resumen: summary.rows[0], oportunidades: opportunities.rows, cotizaciones: quotes.rows,
      pagos: payments.rows, comunicaciones: communications.rows, productos: products.rows
    };
  }

  updateOpportunity(id, data) {
    return this.query(
      `UPDATE asesorias SET etapa=COALESCE($1,etapa),valor_estimado=COALESCE($2,valor_estimado),
       probabilidad=COALESCE($3,probabilidad),proxima_accion=COALESCE($4,proxima_accion),
       fecha_proxima_accion=COALESCE($5,fecha_proxima_accion) WHERE id=$6 RETURNING *`,
      [data.etapa || null, data.valor_estimado ?? null, data.probabilidad ?? null, data.proxima_accion || null, data.fecha_proxima_accion || null, id]
    ).then((result) => result.rows[0]);
  }

  updateAppointmentState(id, state) {
    return this.query('UPDATE asesorias SET estado=$1 WHERE id=$2 RETURNING *', [state, id])
      .then((result) => result.rows[0]);
  }

  updatePaymentState(id, state, actorId, note) {
    return this.query(
      'UPDATE pagos SET estado=$1,actualizado_por=$2,nota_validacion=$3,actualizado_en=NOW() WHERE id=$4 RETURNING *',
      [state, actorId, note || null, id]
    )
      .then((result) => result.rows[0]);
  }

  updateProductPrice(id, price) {
    return this.query('UPDATE productos SET precio_desde=$1 WHERE id=$2 RETURNING id,nombre,precio_desde', [price, id])
      .then((result) => result.rows[0]);
  }
}

module.exports = AdminRepository;
