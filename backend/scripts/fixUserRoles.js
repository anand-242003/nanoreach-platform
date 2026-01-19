import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      role: 'CREATOR' // This will fail if CREATOR doesn't exist in enum
    },
    data: {
      role: 'INFLUENCER'
    }
  });
  
  console.log(`Updated ${result.count} users from CREATOR to INFLUENCER`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
