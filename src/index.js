require('dotenv').config();

const buildContainer = require('./container');
const createApp = require('./app');
const prepareDatabase = require('./bootstrap/prepareDatabase');

async function start() {
  const container = buildContainer();
  await prepareDatabase({
    db: container.db,
    users: container.repositories.users,
    config: container.config
  });
  const app = createApp(container);
  return app.listen(container.config.port, () => {
    console.log(`FMV Comercial escuchando en el puerto interno ${container.config.port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('[ARRANQUE]', error);
    process.exit(1);
  });
}

module.exports = { start };
