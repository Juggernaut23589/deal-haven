// One-off, idempotent script to add the "Beauty & Skincare" category to an
// already-running database WITHOUT touching any existing data.
//
// Unlike prisma/seed.ts (which TRUNCATEs categories/users and must never run
// against production), this script only INSERTs rows that don't exist yet.
// Safe to run multiple times — it checks for the slug before creating anything.
//
// Usage: DATABASE_URL="<production-connection-string>" npx tsx scripts/add-beauty-skincare-category.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUBCATEGORIES = [
  { name: 'Skincare', slug: 'skincare' },
  { name: 'Makeup', slug: 'makeup' },
  { name: 'Haircare', slug: 'haircare' },
  { name: 'Fragrances', slug: 'fragrances' },
  { name: 'Personal Care', slug: 'personal-care' },
  { name: 'Beauty Tools & Accessories', slug: 'beauty-tools-accessories' },
];

async function main() {
  const existing = await prisma.category.findFirst({ where: { slug: 'beauty-skincare' } });
  if (existing) {
    console.log('✋ "beauty-skincare" category already exists (id: ' + existing.id + ') — nothing to do.');
    return;
  }

  const furniture = await prisma.category.findFirst({ where: { slug: 'furniture-home' } });
  const sortOrder = furniture ? furniture.sortOrder + 1 : 8;

  const result = await prisma.$transaction(async (tx) => {
    const parent = await tx.category.create({
      data: {
        name: 'Beauty & Skincare',
        slug: 'beauty-skincare',
        sortOrder,
        isFeatured: true,
        iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f484.svg',
      },
    });

    for (let i = 0; i < SUBCATEGORIES.length; i++) {
      await tx.category.create({
        data: {
          name: SUBCATEGORIES[i].name,
          slug: SUBCATEGORIES[i].slug,
          parentId: parent.id,
          sortOrder: i + 1,
        },
      });
    }

    await tx.categoryAttribute.createMany({
      data: [
        { categoryId: parent.id, name: 'Brand', slug: 'brand', attributeType: 'TEXT', isFilterable: true, sortOrder: 1 },
        { categoryId: parent.id, name: 'Skin Type', slug: 'skin-type', attributeType: 'SELECT', isFilterable: true, sortOrder: 2, options: JSON.stringify(['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'All Skin Types']) },
        { categoryId: parent.id, name: 'Product Type', slug: 'product-type', attributeType: 'TEXT', isFilterable: true, sortOrder: 3 },
        { categoryId: parent.id, name: 'Volume / Size', slug: 'volume-size', attributeType: 'TEXT', sortOrder: 4 },
        { categoryId: parent.id, name: 'Sealed / Unused', slug: 'sealed-unused', attributeType: 'BOOLEAN', isFilterable: true, sortOrder: 5 },
      ],
    });

    return parent;
  });

  console.log('✅ Created "Beauty & Skincare" category (id: ' + result.id + ') with ' + SUBCATEGORIES.length + ' subcategories and 5 attributes.');
}

main()
  .catch((err) => {
    console.error('❌ Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
