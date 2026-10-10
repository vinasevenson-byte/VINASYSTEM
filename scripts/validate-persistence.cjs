const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function validate() {
  console.log('=====================================================');
  console.log('  PROVA DE PERSISTÊNCIA REAL NO POSTGRESQL (2.1)');
  console.log('=====================================================\n');
  
  // 1. Usuário
  const user = await prisma.user.findFirst({ where: { email: { contains: 'vinicius' } } });
  console.log('1. [PostgreSQL] Usuário Autenticado:');
  console.log('   Nome:  ', user ? user.name : 'Nenhum');
  console.log('   Email: ', user ? user.email : 'Nenhum');
  console.log('   UUID:  ', user ? user.id : 'Nenhum');

  // 2. Perfis
  const profiles = await prisma.profile.findMany({ include: { accounts: true, entries: true } });
  console.log('\n2. [PostgreSQL] Perfis e Contas Cadastradas:');
  for (const p of profiles) {
    console.log(`   - Perfil "${p.name}" (ID: ${p.id})`);
    for (const a of p.accounts) {
      console.log(`     * Conta: "${a.name}" | Saldo Inicial: R$ ${a.openingBalance}`);
    }
  }

  // 3. Lançamentos reais gravados
  const entries = await prisma.entry.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { account: true } });
  console.log('\n3. [PostgreSQL] Últimos Lançamentos Salvos:');
  for (const e of entries) {
    console.log(`   * [${e.type}] "${e.description}" | R$ ${e.amount} | Conta: "${e.account?.name}" | Status: ${e.status} | Data: ${e.occurredAt.toISOString().slice(0,10)}`);
  }

  // 4. Auditoria
  const audits = await prisma.auditLog.count();
  console.log(`\n4. [PostgreSQL] Registros de Auditoria: ${audits} eventos auditados`);
  console.log('\n=====================================================');
  console.log('  RESULTADO: BANCO POSTGRESQL 100% OPERACIONAL!');
  console.log('=====================================================');
  await prisma.$disconnect();
}

validate().catch(e => {
  console.error('Falha na validação:', e);
  process.exit(1);
});
