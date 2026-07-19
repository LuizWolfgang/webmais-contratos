import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  });
  console.log(`Usuário seedado: ${admin.username}`);

  const client = await prisma.client.upsert({
    where: { document: '12345678000199' },
    update: {},
    create: {
      name: 'Acme Indústria e Comércio LTDA',
      document: '12345678000199',
    },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await prisma.contract.upsert({
    where: { number: 'CTR-0001' },
    update: {},
    create: {
      number: 'CTR-0001',
      clientId: client.id,
      value: 15000.5,
      dueDate: yesterday, // vencido: demonstra o job de expiração assim que o worker sobe
      status: 'ATIVO',
    },
  });

  await prisma.contract.upsert({
    where: { number: 'CTR-0002' },
    update: {},
    create: {
      number: 'CTR-0002',
      clientId: client.id,
      value: 8200,
      dueDate: nextYear,
      status: 'ATIVO',
    },
  });

  console.log('Contratos de demonstração seedados.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
