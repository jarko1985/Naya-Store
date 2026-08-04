import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import { hashSync } from 'bcrypt-ts-edge';
import slugify from 'slugify';


async function main() {
  const prisma = new PrismaClient();

  // Clear existing data (variants/products first due to FK constraints)
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed categories — derived from each sample product's `category` string, all top-level
  const categoryNames = [...new Set(sampleData.products.map((p) => p.category))];
  const categoryIdByName = new Map<string, string>();
  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: { name, slug: slugify(name, { lower: true, strict: true }) },
    });
    categoryIdByName.set(name, category.id);
  }

  // Seed products
  await prisma.product.createMany({
    data: sampleData.products.map(({ category, ...rest }) => ({
      ...rest,
      categoryId: categoryIdByName.get(category)!,
    })),
  });

  // Seed product variants
  for (const entry of sampleData.productVariants) {
    const product = await prisma.product.findFirst({
      where: { slug: entry.productSlug },
    });
    if (!product) {
      console.warn(`Product not found for slug: ${entry.productSlug}`);
      continue;
    }
    await prisma.productVariant.createMany({
      data: entry.variants.map((v) => ({
        productId: product.id,
        color: v.color,
        size: v.size,
        price: v.price,
        stock: v.stock,
        image: v.image,
      })),
    });
  }

  // Seed users
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
