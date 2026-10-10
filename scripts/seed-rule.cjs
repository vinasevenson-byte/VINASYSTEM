const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');
const bcrypt = require('../node_modules/bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[VINA SEED] Verificando credencial padrão VINICIUS / VINA123...');
  const passwordHash = await bcrypt.hash('VINA123', 12);
  
  // Update or create user VINICIUS
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
    console.log('[VINA SEED] Usuário VINICIUS atualizado com sucesso:', user.id);
  } else {
    user = await prisma.user.create({
      data: {
        name: 'VINICIUS',
        email: 'vinicius@vina.com',
        passwordHash
      }
    });
    console.log('[VINA SEED] Usuário VINICIUS criado com sucesso:', user.id);
  }

  // Ensure default personal profile
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, role: 'OWNER' }
  });

  if (!membership) {
    const profile = await prisma.profile.create({
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
    console.log('[VINA SEED] Perfil Pessoal criado:', profile.id);
  }

  console.log('[VINA SEED] Regra oficial VINICIUS / VINA123 aplicada 100%.');
}

main()
  .catch((e) => {
    console.error('[VINA SEED] Erro ao aplicar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
