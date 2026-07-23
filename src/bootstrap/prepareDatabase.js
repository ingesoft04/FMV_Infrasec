const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = async ({ db, users, config }) => {
  for (const name of ['002_crm_comercial.sql', '003_portal_asesores.sql']) {
    const migration = await fs.readFile(path.join(config.root, 'sql', 'migrations', name), 'utf8');
    await db.query(migration);
  }
  if (config.adminEmail && config.adminPassword) {
    await users.upsertAdmin({
      email: config.adminEmail,
      passwordHash: await bcrypt.hash(config.adminPassword, 12)
    });
  }
  if (config.saEmail && config.saPassword) {
    await users.upsertSuperAdmin({
      email: config.saEmail,
      passwordHash: await bcrypt.hash(config.saPassword, 12)
    });
  }
};
