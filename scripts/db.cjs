const { default: EmbeddedPostgres } = require('embedded-postgres');
const path = require('path');
const fs = require('fs');

const databaseDir = path.resolve(__dirname, '../data/db');
const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'boma',
  password: 'boma_password',
  port: 5432,
  persistent: true,
});

async function main() {
  const isInitialised = fs.existsSync(path.join(databaseDir, 'PG_VERSION'));
  if (!isInitialised) {
    console.log('[BOMA DB] Inicializando cluster PostgreSQL nativo...');
    await pg.initialise();
  }
  console.log('[BOMA DB] Iniciando servidor PostgreSQL na porta 5432...');
  await pg.start();
  console.log('[BOMA DB] PostgreSQL pronto em localhost:5432!');

  try {
    await pg.createDatabase('boma_finance');
    console.log('[BOMA DB] Banco "boma_finance" verificado/criado com sucesso.');
  } catch (err) {
    // Database might already exist
  }

  console.log('[BOMA DB] Banco de dados operacional para BOMA Finance.');

  const shutdown = async () => {
    console.log('\n[BOMA DB] Encerrando PostgreSQL...');
    try {
      await pg.stop();
      console.log('[BOMA DB] Servidor PostgreSQL encerrado com sucesso.');
    } catch (e) {
      console.error('[BOMA DB] Erro ao encerrar:', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[BOMA DB] Falha ao iniciar:', err);
  process.exit(1);
});
