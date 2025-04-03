import { PrismaClient } from '@prisma/client';

async function seed() {
  const prisma = new PrismaClient();

  try {
    // Clear existing data (optional, but can help with seeding)
    await prisma.report.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const admin = await prisma.user.create({
      data: { 
        email: "admin@servihub.com", 
        role: "admin", 
        name: "Admin User" 
      }
    });

    const user = await prisma.user.create({
      data: { 
        email: "user1@servihub.com", 
        name: "User One" 
      }
    });

    // Create report
    await prisma.report.create({
      data: {
        type: "review",
        target_id: 101,
        reason: "Spam content",
        submitted_by: user.id,
      },
    });

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();