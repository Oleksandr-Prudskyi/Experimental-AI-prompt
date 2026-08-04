// apps/api/prisma/seed.ts
import { PrismaClient, RoleSlug } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { slug: RoleSlug.administrator },
      update: {},
      create: { name: 'Administrátor', slug: RoleSlug.administrator, description: 'Plný přístup k systému' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.mistr },
      update: {},
      create: { name: 'Mistr', slug: RoleSlug.mistr, description: 'Výrobní správce' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.serizovac },
      update: {},
      create: { name: 'Seřizovač', slug: RoleSlug.serizovac, description: 'Operátor strojů' },
    }),
    prisma.role.upsert({
      where: { slug: RoleSlug.vedouci_vyroby },
      update: {},
      create: { name: 'Vedoucí výroby', slug: RoleSlug.vedouci_vyroby, description: 'Analytik výroby' },
    }),
  ]);

  const adminRole = roles[0];
  const mistrRole = roles[1];
  const passwordHash = await bcrypt.hash('admin', 12);

  await prisma.user.upsert({
    where: { email: 'admin@evidence.local' },
    update: {},
    create: {
      email: 'admin@evidence.local',
      passwordHash,
      fullName: 'Admin',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mistr@evidence.local' },
    update: {},
    create: {
      email: 'mistr@evidence.local',
      passwordHash,
      fullName: 'Hlavní Mistr',
      roleId: mistrRole.id,
    },
  });

  await prisma.shift.createMany({
    data: [
      { name: 'Ranní', startTime: '06:00', endTime: '14:00' },
      { name: 'Odpolední', startTime: '14:00', endTime: '22:00' },
      { name: 'Noční', startTime: '22:00', endTime: '06:00' },
    ],
    skipDuplicates: true,
  });

  await prisma.setting.upsert({
    where: { key: 'branding' },
    update: {},
    create: {
      key: 'branding',
      value: { companyName: 'Evidence', logoUrl: null, primaryColor: '#6366f1' },
    },
  });

  console.log('Seed complete:');
  console.log('  Admin: admin@evidence.local / admin');
  console.log('  Mistr: mistr@evidence.local / admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
