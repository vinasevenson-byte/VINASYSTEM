const { default: EmbeddedPostgres } = require('embedded-postgres');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');
const bcrypt = require('../node_modules/bcryptjs');

const databaseDir = path.resolve(__dirname, '../data/db');
const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'boma',
  password: 'boma_password',
  port: 5432,
  persistent: true,
});

const DEFAULT_CATEGORIES = [
  { name: 'Salário', type: 'INCOME' },
  { name: 'Freelance & Serviços', type: 'INCOME' },
  { name: 'Rendimentos & Dividendos', type: 'INCOME' },
  { name: 'Outras Receitas', type: 'INCOME' },
  { name: 'Alimentação & Mercado', type: 'EXPENSE' },
  { name: 'Moradia & Contas Fixas', type: 'EXPENSE' },
  { name: 'Transporte & Combustível', type: 'EXPENSE' },
  { name: 'Saúde & Farmácia', type: 'EXPENSE' },
  { name: 'Lazer & Entretenimento', type: 'EXPENSE' },
  { name: 'Educação & Cursos', type: 'EXPENSE' },
  { name: 'Assinaturas & Serviços', type: 'EXPENSE' },
  { name: 'Outras Despesas', type: 'EXPENSE' }
];

async function main() {
  console.log('[VINA RESET] Iniciando processo para zerar todos os valores do sistema...');
  
  let pgStartedHere = false;
  try {
    const isInitialised = fs.existsSync(path.join(databaseDir, 'PG_VERSION'));
    if (!isInitialised) {
      console.log('[VINA RESET] Inicializando PostgreSQL...');
      await pg.initialise();
    }
    console.log('[VINA RESET] Conectando ao PostgreSQL local...');
    await pg.start();
    pgStartedHere = true;
  } catch (e) {
    console.log('[VINA RESET] Servidor PostgreSQL já está em execução ou foi iniciado.');
  }

  const prisma = new PrismaClient();

  try {
    console.log('[VINA RESET] 1. Limpando registros operacionais e financeiros...');
    
    // Delete in cascade order
    const delAudit = await prisma.auditLog.deleteMany({});
    console.log(`  - AuditLog removidos: ${delAudit.count}`);

    const delCardPurchases = await prisma.cardPurchase.deleteMany({});
    console.log(`  - CardPurchases removidas: ${delCardPurchases.count}`);

    const delInvoices = await prisma.invoice.deleteMany({});
    console.log(`  - Invoices removidas: ${delInvoices.count}`);

    const delCards = await prisma.creditCard.deleteMany({});
    console.log(`  - CreditCards removidos: ${delCards.count}`);

    const delEntries = await prisma.entry.deleteMany({});
    console.log(`  - Lançamentos (Entry) removidos: ${delEntries.count}`);

    const delCommitments = await prisma.commitment.deleteMany({});
    console.log(`  - Compromissos removidos: ${delCommitments.count}`);

    const delGoals = await prisma.financialGoal.deleteMany({});
    console.log(`  - Metas removidas: ${delGoals.count}`);

    const delBudgets = await prisma.budget.deleteMany({});
    console.log(`  - Orçamentos removidos: ${delBudgets.count}`);

    const delAccounts = await prisma.account.deleteMany({});
    console.log(`  - Contas bancárias antigas removidas: ${delAccounts.count}`);

    const delGroups = await prisma.consolidationGroup.deleteMany({});
    console.log(`  - Grupos de consolidação removidos: ${delGroups.count}`);

    const delCats = await prisma.category.deleteMany({});
    console.log(`  - Categorias antigas removidas: ${delCats.count}`);

    console.log('[VINA RESET] 2. Garantindo usuário padrão administrativo VINICIUS...');
    const passwordHash = await bcrypt.hash('VINA123', 12);
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'vinicius@vina.com' },
          { name: 'VINICIUS' }
        ]
      }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'VINICIUS',
          email: 'vinicius@vina.com',
          passwordHash
        }
      });
      console.log(`  - Usuário VINICIUS verificado e atualizado: ${user.id}`);
    } else {
      user = await prisma.user.create({
        data: {
          name: 'VINICIUS',
          email: 'vinicius@vina.com',
          passwordHash
        }
      });
      console.log(`  - Usuário VINICIUS criado: ${user.id}`);
    }

    console.log('[VINA RESET] 3. Garantindo perfis limpos (Pessoal e Familiar)...');
    
    // Remove memberships for other users if any
    await prisma.membership.deleteMany({
      where: {
        userId: { not: user.id }
      }
    });

    // Ensure Pessoal profile
    let pessoal = await prisma.profile.findFirst({
      where: {
        name: 'Pessoal',
        memberships: { some: { userId: user.id } }
      }
    });

    if (!pessoal) {
      pessoal = await prisma.profile.create({
        data: {
          name: 'Pessoal',
          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        }
      });
      console.log(`  - Perfil 'Pessoal' criado: ${pessoal.id}`);
    } else {
      console.log(`  - Perfil 'Pessoal' preservado: ${pessoal.id}`);
    }

    // Ensure Familiar profile
    let familiar = await prisma.profile.findFirst({
      where: {
        name: 'Familiar',
        memberships: { some: { userId: user.id } }
      }
    });

    if (!familiar) {
      familiar = await prisma.profile.create({
        data: {
          name: 'Familiar',
          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        }
      });
      console.log(`  - Perfil 'Familiar' criado: ${familiar.id}`);
    } else {
      console.log(`  - Perfil 'Familiar' preservado: ${familiar.id}`);
    }

    // Clean any other non-standard profiles
    const otherProfiles = await prisma.profile.findMany({
      where: {
        id: { notIn: [pessoal.id, familiar.id] }
      }
    });
    if (otherProfiles.length > 0) {
      await prisma.profile.deleteMany({
        where: {
          id: { in: otherProfiles.map(p => p.id) }
        }
      });
      console.log(`  - Perfis adicionais/testes removidos: ${otherProfiles.length}`);
    }

    console.log('[VINA RESET] 4. Recriando categorias padrão para cada perfil...');
    for (const prof of [pessoal, familiar]) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.create({
          data: {
            profileId: prof.id,
            name: cat.name,
            type: cat.type
          }
        });
      }
    }
    console.log('  - Categorias essenciais configuradas com sucesso.');

    console.log('\n[VINA RESET] ✨ SUCESSO! O banco de dados foi completamente zerado.');
    console.log('  - Saldos: R$ 0,00');
    console.log('  - Lançamentos: 0');
    console.log('  - Contas cadastradas: 0');
    console.log('  - Cartões: 0');
    console.log('  - Metas / Compromissos: 0');
    console.log('  - Acesso oficial pronto: VINICIUS / VINA123 (Perfis Pessoal e Familiar)');
  } finally {
    await prisma.$disconnect();
    if (pgStartedHere) {
      try {
        await pg.stop();
        console.log('[VINA RESET] Servidor temporário PostgreSQL encerrado.');
      } catch (e) {
        // ignore
      }
    }
  }
}

main().catch(e => {
  console.error('[VINA RESET] Erro fatal durante a limpeza:', e);
  process.exit(1);
});
