const BaseRepository = require('./BaseRepository');

class CatalogRepository extends BaseRepository {
  products(category) {
    const values = category ? [category] : [];
    const filter = category ? ' AND categoria=$1' : '';
    return this.query(
      `SELECT id,nombre,slug,descripcion,categoria,modalidad,precio_desde,duracion_minutos
       FROM productos WHERE activo=TRUE${filter} ORDER BY orden,nombre`, values
    ).then((result) => result.rows);
  }

  consultants() {
    return this.query('SELECT id,nombre,cargo,bio FROM consultores WHERE activo=TRUE ORDER BY nombre')
      .then((result) => result.rows);
  }

  product(id) {
    return this.query('SELECT * FROM productos WHERE id=$1', [id]).then((result) => result.rows[0]);
  }
}

module.exports = CatalogRepository;
