
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });

  console.log('Test user created:', testUser.email);

  // Create a sample tax return for the test user
  const currentYear = new Date().getFullYear();
  
  const sampleTaxReturn = await prisma.taxReturn.upsert({
    where: {
      userId_taxYear: {
        userId: testUser.id,
        taxYear: currentYear - 1, // Previous tax year
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      taxYear: currentYear - 1,
      filingStatus: 'single',
      currentStep: 1,
      isComplete: false,
    },
  });

  console.log('Sample tax return created for tax year:', currentYear - 1);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
