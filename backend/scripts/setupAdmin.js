import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    const adminEmail = 'admin@drkmttr.com';
    const adminPassword = 'Admin@123'; 
    
    console.log('Setting up admin account...\n');

    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (admin) {
      console.log(' Admin user already exists');
      console.log(`Email: ${adminEmail}`);
      console.log(`Email Verified: ${admin.emailVerified}`);
      console.log(`Role: ${admin.role}\n`);

      if (!admin.emailVerified) {
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null
          }
        });
        console.log(' Email verified!');
      }

      if (admin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        });
        console.log(' Role updated to ADMIN!');
      }
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN',
          emailVerified: true,
          verificationStatus: 'VERIFIED',
        }
      });

      console.log(' Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role: ${admin.role}\n`);
      console.log('  IMPORTANT: Change the password after first login!\n');
    }

    console.log(' Admin setup complete!');
    console.log('\nYou can now login with:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
