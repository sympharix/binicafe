import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  let branch = await prisma.branch.findFirst({ where: { name: 'Main Branch' } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Main Branch',
        address: '123 Restaurant St',
        timezone: 'UTC',
        isActive: true,
      },
    });
  }

  await prisma.user.upsert({
    where: { email: 'admin@rms.local' },
    update: {},
    create: {
      email: 'admin@rms.local',
      password: hashed,
      name: 'Admin',
      role: 'ADMIN',
      branchId: branch.id,
    },
  });

  const cat = await prisma.category.create({
    data: { branchId: branch.id, name: 'Mains', sortOrder: 0 },
  });

  await prisma.item.create({
    data: {
      branchId: branch.id,
      categoryId: cat.id,
      name: 'Grilled Salmon',
      price: 18.5,
      available: true,
      sortOrder: 0,
    },
  });

  await prisma.table.createMany({
    data: [
      { branchId: branch.id, number: 'T1', capacity: 2, status: 'EMPTY' },
      { branchId: branch.id, number: 'T2', capacity: 4, status: 'EMPTY' },
    ],
  });

  console.log('Seed done: branch, admin user, category, item, tables');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
