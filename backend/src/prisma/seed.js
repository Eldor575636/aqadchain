const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a test admin user
  await prisma.user.upsert({
    where: { auth0_id: 'auth0|admin_seed' },
    update: {},
    create: {
      auth0_id: 'auth0|admin_seed',
      email: 'admin@aqadchain.com',
      full_name: 'AqadChain Admin',
      role: 'ADMIN',
      kyc_status: 'VERIFIED',
      onboarding_completed: true,
    },
  });
  console.log('✓ Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
