const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = async ({ db, users, config }) => {
  const migration = await fs.readFile(path.join(config.root, 'sql', 'migrations', '002_crm_comercial.sql'), 'utf8');
  await db.query(migration);
  if (config.adminEmail && config.adminPassword) {
    await users.upsertAdmin({
      email: config.adminEmail,
      passwordHash: await bcrypt.hash(config.adminPassword, 12)
    });
  }
};
