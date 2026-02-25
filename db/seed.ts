import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import { hashSync } from 'bcrypt-ts-edge';


async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();


  await prisma.product.createMany({ data: sampleData.products });
  const users = sampleData.users.map((u) => ({
    name: u.name,
    email: u.email,
    password: hashSync(u.password, 10),
    role: u.role,
  }));
  await prisma.user.createMany({ data: users });

  console.log('Database seeded successfully!');
}

main();