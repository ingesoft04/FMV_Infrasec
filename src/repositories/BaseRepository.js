class BaseRepository {
  constructor(db) {
    this.db = db;
  }

  query(sql, values = []) {
    return this.db.query(sql, values);
  }
}

module.exports = BaseRepository;
