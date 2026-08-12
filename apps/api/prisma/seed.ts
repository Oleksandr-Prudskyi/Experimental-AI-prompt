// apps/api/prisma/seed.ts
import {
  PrismaClient,
  RoleSlug,
  WorkRecordCategory,
  WorkRecordStatus,
  Priority,
  MachineStatus,
  ChannelType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Return a Date set to midnight N days ago (UTC). */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function main() {
  // ───────────────────────── 1. ROLES ─────────────────────────

  const [adminRole, mistrRole, serizovacRole, vedouciRole, obsluhaRole] =
    await Promise.all([
      prisma.role.upsert({
        where: { slug: RoleSlug.administrator },
        update: {},
        create: {
          name: 'Administrátor',
          slug: RoleSlug.administrator,
          description: 'Plný přístup k systému',
        },
      }),
      prisma.role.upsert({
        where: { slug: RoleSlug.mistr },
        update: {},
        create: {
          name: 'Mistr',
          slug: RoleSlug.mistr,
          description: 'Výrobní správce',
        },
      }),
      prisma.role.upsert({
        where: { slug: RoleSlug.serizovac },
        update: {},
        create: {
          name: 'Seřizovač',
          slug: RoleSlug.serizovac,
          description: 'Operátor strojů',
        },
      }),
      prisma.role.upsert({
        where: { slug: RoleSlug.vedouci_vyroby },
        update: {},
        create: {
          name: 'Vedoucí výroby',
          slug: RoleSlug.vedouci_vyroby,
          description: 'Analytik výroby',
        },
      }),
      prisma.role.upsert({
        where: { slug: RoleSlug.obsluha_stroje },
        update: {},
        create: {
          name: 'Obsluha stroje',
          slug: RoleSlug.obsluha_stroje,
          description: 'Operátor výrobního stroje',
        },
      }),
    ]);

  // ───────────────────────── 2. PASSWORD HASHES ─────────────────────────

  const adminPasswordHash = await bcrypt.hash('sasha9', 12);
  const demoPasswordHash = await bcrypt.hash('demo', 12);
  const defaultPasswordHash = await bcrypt.hash('admin', 12);

  // ───────────────────────── 3. SHIFTS ─────────────────────────

  await prisma.shift.createMany({
    data: [
      { name: 'Ranní', startTime: '06:00', endTime: '14:00' },
      { name: 'Odpolední', startTime: '14:00', endTime: '22:00' },
      { name: 'Noční', startTime: '22:00', endTime: '06:00' },
    ],
    skipDuplicates: true,
  });

  const ranniShift = await prisma.shift.findFirst({ where: { name: 'Ranní' } });
  const odpoledniShift = await prisma.shift.findFirst({ where: { name: 'Odpolední' } });

  // ───────────────────────── 4. WORKSHOPS ─────────────────────────

  const workshopH01 = await prisma.workshop.upsert({
    where: { code: 'H01' },
    update: {},
    create: { name: 'Hala A — Lisovna', code: 'H01' },
  });

  const workshopH02 = await prisma.workshop.upsert({
    where: { code: 'H02' },
    update: {},
    create: { name: 'Hala B — Montáž', code: 'H02' },
  });

  // ───────────────────────── 5. USERS ─────────────────────────

  await prisma.user.updateMany({ where: { email: 'admin@evidence.local' }, data: { email: 'admin@evidence.cz', passwordHash: adminPasswordHash } });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@evidence.cz' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@evidence.cz',
      passwordHash: adminPasswordHash,
      fullName: 'Admin',
      roleId: adminRole.id,
    },
  });

  await prisma.user.updateMany({ where: { email: 'mistr@evidence.local' }, data: { email: 'mistr@evidence.cz', passwordHash: adminPasswordHash } });
  const mistr = await prisma.user.upsert({
    where: { email: 'mistr@evidence.cz' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'mistr@evidence.cz',
      passwordHash: adminPasswordHash,
      fullName: 'Hlavní Mistr',
      roleId: mistrRole.id,
    },
  });

  const novak = await prisma.user.upsert({
    where: { email: 'novak@evidence.local' },
    update: {},
    create: {
      email: 'novak@evidence.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Jan Novák',
      roleId: serizovacRole.id,
      position: 'Seřizovač CNC',
      phone: '+420 601 234 567',
      workshopId: workshopH01.id,
      shiftId: ranniShift?.id,
    },
  });

  const svoboda = await prisma.user.upsert({
    where: { email: 'svoboda@evidence.local' },
    update: {},
    create: {
      email: 'svoboda@evidence.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Petr Svoboda',
      roleId: obsluhaRole.id,
      position: 'Operátor lisu',
      workshopId: workshopH01.id,
      shiftId: odpoledniShift?.id,
    },
  });

  const kralova = await prisma.user.upsert({
    where: { email: 'kralova@evidence.local' },
    update: {},
    create: {
      email: 'kralova@evidence.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Eva Králová',
      roleId: vedouciRole.id,
      position: 'Vedoucí výroby',
    },
  });

  const horak = await prisma.user.upsert({
    where: { email: 'horak@evidence.local' },
    update: {},
    create: {
      email: 'horak@evidence.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Tomáš Horák',
      roleId: serizovacRole.id,
      position: 'Seřizovač lisů',
      workshopId: workshopH01.id,
      shiftId: ranniShift?.id,
    },
  });

  const nemcova = await prisma.user.upsert({
    where: { email: 'nemcova@evidence.local' },
    update: {},
    create: {
      email: 'nemcova@evidence.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Lucie Němcová',
      roleId: obsluhaRole.id,
      position: 'Operátorka montáže',
      workshopId: workshopH02.id,
      shiftId: ranniShift?.id,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@evidence.local' },
    update: { roleId: adminRole.id, passwordHash: demoPasswordHash },
    create: {
      email: 'demo@evidence.local',
      passwordHash: demoPasswordHash,
      fullName: 'Demo Uživatel',
      roleId: adminRole.id,
      position: 'Demo účet',
    },
  });

  // ───────────────────────── 6. SETTINGS ─────────────────────────

  await prisma.setting.upsert({
    where: { key: 'branding' },
    update: {},
    create: {
      key: 'branding',
      value: { companyName: 'Evidence', logoUrl: null, primaryColor: '#6366f1' },
    },
  });

  // ───────────────────────── 7. PRODUCTION LINES ─────────────────────────

  // ProductionLine.code is optional (not unique), so we check existence first.
  async function upsertLine(
    workshopId: string,
    name: string,
    code: string,
  ) {
    const existing = await prisma.productionLine.findFirst({
      where: { code, workshopId },
    });
    if (existing) return existing;
    return prisma.productionLine.create({
      data: { workshopId, name, code },
    });
  }

  const lineL1 = await upsertLine(workshopH01.id, 'Linka L1 — Hydraulické lisy', 'L1');
  const lineL2 = await upsertLine(workshopH01.id, 'Linka L2 — CNC obráběcí', 'L2');
  const lineM1 = await upsertLine(workshopH02.id, 'Linka M1 — Montážní', 'M1');
  const lineM2 = await upsertLine(workshopH02.id, 'Linka M2 — Balicí', 'M2');

  // ───────────────────────── 8. MACHINES ─────────────────────────

  const machineHL100 = await prisma.machine.upsert({
    where: { code: 'HL100' },
    update: {},
    create: {
      name: 'Hydraulický lis HL-100',
      code: 'HL100',
      lineId: lineL1.id,
      status: MachineStatus.operational,
    },
  });

  const machineHL200 = await prisma.machine.upsert({
    where: { code: 'HL200' },
    update: {},
    create: {
      name: 'Hydraulický lis HL-200',
      code: 'HL200',
      lineId: lineL1.id,
      status: MachineStatus.maintenance,
    },
  });

  const machineSP300 = await prisma.machine.upsert({
    where: { code: 'SP300' },
    update: {},
    create: {
      name: 'CNC soustruh SP-300',
      code: 'SP300',
      lineId: lineL2.id,
      status: MachineStatus.operational,
    },
  });

  const machineFM500 = await prisma.machine.upsert({
    where: { code: 'FM500' },
    update: {},
    create: {
      name: 'Frézka FM-500',
      code: 'FM500',
      lineId: lineL2.id,
      status: MachineStatus.breakdown,
    },
  });

  const machineMR01 = await prisma.machine.upsert({
    where: { code: 'MR01' },
    update: {},
    create: {
      name: 'Montážní robot MR-01',
      code: 'MR01',
      lineId: lineM1.id,
      status: MachineStatus.operational,
    },
  });

  const machineBA01 = await prisma.machine.upsert({
    where: { code: 'BA01' },
    update: {},
    create: {
      name: 'Balicí automat BA-01',
      code: 'BA01',
      lineId: lineM2.id,
      status: MachineStatus.operational,
    },
  });

  // ───────────────────────── 9. TEAMS ─────────────────────────

  async function upsertTeam(name: string, workshopId: string, memberIds: string[]) {
    let team = await prisma.team.findFirst({ where: { name, workshopId } });
    if (!team) {
      team = await prisma.team.create({ data: { name, workshopId } });
    }
    // Add members idempotently
    for (const userId of memberIds) {
      const exists = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: team.id, userId } },
      });
      if (!exists) {
        await prisma.teamMember.create({
          data: { teamId: team.id, userId },
        });
      }
    }
    return team;
  }

  await upsertTeam('Směna A — Lisovna', workshopH01.id, [
    novak.id,
    svoboda.id,
    horak.id,
  ]);

  await upsertTeam('Směna B — Montáž', workshopH02.id, [nemcova.id]);

  // ───────────────────────── 10. WORK RECORDS ─────────────────────────

  const workRecordsData = [
    {
      authorId: admin.id,
      machineId: machineHL100.id,
      lineId: lineL1.id,
      category: WorkRecordCategory.failure,
      date: daysAgo(1),
      description: 'Únik hydraulického oleje z hlavního válce',
      status: WorkRecordStatus.resolved,
      priority: Priority.high,
      downtimeMin: 120,
      cause: 'Opotřebené těsnění',
      maintenanceDone: 'Výměna těsnění hlavního válce',
    },
    {
      authorId: admin.id,
      machineId: machineSP300.id,
      lineId: lineL2.id,
      category: WorkRecordCategory.adjustment,
      date: daysAgo(2),
      description: 'Kalibrace vřetena po výměně nástrojů',
      status: WorkRecordStatus.closed,
      priority: Priority.medium,
      durationMin: 45,
    },
    {
      authorId: admin.id,
      machineId: machineFM500.id,
      lineId: lineL2.id,
      category: WorkRecordCategory.maintenance,
      date: daysAgo(0),
      description: 'Plánovaná výměna řezných nástrojů a mazání vedení',
      status: WorkRecordStatus.in_progress,
      priority: Priority.medium,
      durationMin: 90,
    },
    {
      authorId: admin.id,
      machineId: machineHL200.id,
      lineId: lineL1.id,
      category: WorkRecordCategory.maintenance,
      date: daysAgo(0),
      description: 'Preventivní kontrola hydraulického systému',
      status: WorkRecordStatus.open,
      priority: Priority.low,
    },
    {
      authorId: admin.id,
      machineId: machineMR01.id,
      lineId: lineM1.id,
      category: WorkRecordCategory.inspection,
      date: daysAgo(3),
      description: 'Měsíční kontrola bezpečnostních senzorů robotu',
      status: WorkRecordStatus.closed,
      priority: Priority.medium,
    },
    {
      authorId: admin.id,
      machineId: machineBA01.id,
      lineId: lineM2.id,
      category: WorkRecordCategory.adjustment,
      date: daysAgo(1),
      description: 'Nastavení rychlosti balicí linky pro nový produkt',
      status: WorkRecordStatus.resolved,
      priority: Priority.low,
      durationMin: 30,
    },
    {
      authorId: admin.id,
      machineId: machineHL100.id,
      lineId: lineL1.id,
      category: WorkRecordCategory.failure,
      date: daysAgo(5),
      description: 'Výpadek řídicí jednotky — restart systému',
      status: WorkRecordStatus.closed,
      priority: Priority.critical,
      downtimeMin: 180,
      cause: 'Přepětí v síti',
    },
    {
      authorId: admin.id,
      machineId: machineSP300.id,
      lineId: lineL2.id,
      category: WorkRecordCategory.cleaning,
      date: daysAgo(2),
      description: 'Čištění chladicího okruhu CNC soustruhu',
      status: WorkRecordStatus.closed,
      priority: Priority.low,
      durationMin: 60,
    },
  ];

  for (const record of workRecordsData) {
    // Check if a record with the same description + machine + date exists
    const existing = await prisma.workRecord.findFirst({
      where: {
        machineId: record.machineId,
        date: record.date,
        description: record.description,
      },
    });
    if (!existing) {
      await prisma.workRecord.create({ data: record });
    }
  }

  // ───────────────────────── 11. ANNOUNCEMENTS ─────────────────────────

  const announcementsData = [
    {
      authorId: admin.id,
      title: 'Plánovaná odstávka Haly A',
      content:
        'V pátek 15.8. proběhne plánovaná odstávka elektrického rozvodu v Hale A. Všechny stroje budou mimo provoz od 6:00 do 14:00.',
      priority: Priority.high,
      isActive: true,
    },
    {
      authorId: admin.id,
      title: 'Nový bezpečnostní protokol',
      content:
        'Od 1.9.2026 platí aktualizovaný bezpečnostní protokol pro práci s hydraulickými lisy. Všichni operátoři musí absolvovat školení.',
      priority: Priority.medium,
      isActive: true,
    },
    {
      authorId: admin.id,
      title: 'Údržba dokončena — Linka L2',
      content:
        'Plánovaná údržba CNC obráběcí linky L2 byla úspěšně dokončena. Všechny stroje jsou opět v provozu.',
      priority: Priority.low,
      isActive: false,
    },
  ];

  for (const ann of announcementsData) {
    const existing = await prisma.announcement.findFirst({
      where: { title: ann.title, authorId: ann.authorId },
    });
    if (!existing) {
      await prisma.announcement.create({ data: ann });
    }
  }

  // ───────────────────────── 12. CHAT CHANNELS & MESSAGES ─────────────────────────

  async function upsertChannel(
    name: string,
    type: ChannelType,
    createdById: string,
    workshopId: string | null,
    memberIds: string[],
    messages: { authorId: string; content: string }[],
  ) {
    let channel = await prisma.chatChannel.findFirst({
      where: { name, type },
    });

    if (!channel) {
      channel = await prisma.chatChannel.create({
        data: {
          name,
          type,
          createdById,
          workshopId,
        },
      });
    }

    // Add members idempotently
    for (const userId of memberIds) {
      const exists = await prisma.chatMember.findUnique({
        where: { channelId_userId: { channelId: channel.id, userId } },
      });
      if (!exists) {
        await prisma.chatMember.create({
          data: { channelId: channel.id, userId },
        });
      }
    }

    // Add messages only if the channel has none
    const messageCount = await prisma.chatMessage.count({
      where: { channelId: channel.id },
    });
    if (messageCount === 0) {
      for (const msg of messages) {
        await prisma.chatMessage.create({
          data: {
            channelId: channel.id,
            authorId: msg.authorId,
            content: msg.content,
          },
        });
      }
    }

    return channel;
  }

  await upsertChannel(
    'Hala A — Operátoři',
    ChannelType.department,
    admin.id,
    workshopH01.id,
    [admin.id, mistr.id, novak.id, svoboda.id, horak.id],
    [
      {
        authorId: mistr.id,
        content:
          'Dobré ráno, dnes máme plánovanou údržbu na HL-200. Prosím o koordinaci.',
      },
      {
        authorId: novak.id,
        content: 'Rozumím, přesunu se na SP-300.',
      },
      {
        authorId: admin.id,
        content: 'Díky za koordinaci. Nezapomeňte na bezpečnostní protokol.',
      },
    ],
  );

  await upsertChannel(
    'Hala B — Montáž',
    ChannelType.department,
    admin.id,
    workshopH02.id,
    [admin.id, mistr.id, nemcova.id],
    [
      {
        authorId: nemcova.id,
        content:
          'Balicí automat BA-01 vykazuje nepravidelné chování. Mohu to zkontrolovat?',
      },
      {
        authorId: mistr.id,
        content:
          'Ano, prosím proveďte inspekci a zadejte záznam do systému.',
      },
    ],
  );

  // ───────────────────────── DONE ─────────────────────────

  console.log('Seed complete:');
  console.log('  Admin:    admin@evidence.cz / sasha9');
  console.log('  Mistr:    mistr@evidence.cz / sasha9');
  console.log('  Demo:     demo@evidence.local / demo');
  console.log('');
  console.log('  + 5 more users, 2 workshops, 4 lines, 6 machines');
  console.log('  + 2 teams, 8 work records, 3 announcements, 2 chat channels');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
