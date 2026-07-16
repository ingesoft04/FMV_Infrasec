const BaseRepository = require('./BaseRepository');

class PaymentRepository extends BaseRepository {
  byUser(userId) {
    return this.query('SELECT * FROM pagos WHERE usuario_id=$1 ORDER BY creado_en DESC', [userId])
      .then((result) => result.rows);
  }

  create(data) {
    return this.query(
      `INSERT INTO pagos (cotizacion_id,usuario_id,referencia,monto,moneda,metodo,proveedor,estado,datos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [data.quoteId, data.userId, data.reference, data.amount, data.currency, data.method, data.provider, data.state, data.metadata]
    ).then((result) => result.rows[0]);
  }
}

module.exports = PaymentRepository;
