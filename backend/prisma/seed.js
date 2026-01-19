import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️ Clearing existing data...');
  await prisma.adminAction.deleteMany();
  await prisma.click.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.application.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.brandReport.deleteMany();
  await prisma.influencerReport.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.influencerProfile.deleteMany();
  await prisma.brandProfile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ========== CREATE ADMIN ==========
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@drkmttr.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });
  console.log(`   ✓ Admin: ${admin.email}`);

  // ========== CREATE VERIFIED BRANDS ==========
  console.log('\n🏢 Creating brand users...');
  
  const brand1 = await prisma.user.create({
    data: {
      email: 'nike@brand.com',
      password: hashedPassword,
      name: 'Nike Marketing',
      role: 'BRAND',
      verificationStatus: 'VERIFIED',
      brandProfile: {
        create: {
          companyName: 'Nike India',
          logo: 'https://logo.clearbit.com/nike.com',
          website: 'https://nike.com',
          industry: 'Sports & Fitness',
          gstNumber: '27AABCU9603R1ZM',
          panNumber: 'AABCU9603R',
          businessDocument: 'uploads/documents/nike-cert.pdf',
          verificationNotes: 'Verified multinational brand',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });
  console.log(`   ✓ Brand: ${brand1.email} (VERIFIED)`);

  const brand2 = await prisma.user.create({
    data: {
      email: 'samsung@brand.com',
      password: hashedPassword,
      name: 'Samsung India',
      role: 'BRAND',
      verificationStatus: 'VERIFIED',
      brandProfile: {
        create: {
          companyName: 'Samsung Electronics India',
          logo: 'https://logo.clearbit.com/samsung.com',
          website: 'https://samsung.com/in',
          industry: 'Technology',
          gstNumber: '07AAACS5765K1ZG',
          panNumber: 'AAACS5765K',
          businessDocument: 'uploads/documents/samsung-cert.pdf',
          verificationNotes: 'Major electronics brand',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });
  console.log(`   ✓ Brand: ${brand2.email} (VERIFIED)`);

  const brand3 = await prisma.user.create({
    data: {
      email: 'startup@brand.com',
      password: hashedPassword,
      name: 'TechStartup Inc',
      role: 'BRAND',
      verificationStatus: 'UNDER_REVIEW',
      brandProfile: {
        create: {
          companyName: 'TechStartup Inc',
          logo: null,
          website: 'https://techstartup.com',
          industry: 'SaaS',
          gstNumber: '29AADCS1234B1Z5',
          panNumber: 'AADCS1234B',
          businessDocument: 'uploads/documents/startup-cert.pdf',
        },
      },
    },
  });
  console.log(`   ✓ Brand: ${brand3.email} (UNDER_REVIEW)`);

  const brand4 = await prisma.user.create({
    data: {
      email: 'pending@brand.com',
      password: hashedPassword,
      name: 'New Brand',
      role: 'BRAND',
      verificationStatus: 'PENDING',
    },
  });
  console.log(`   ✓ Brand: ${brand4.email} (PENDING - no profile)`);

  // ========== CREATE VERIFIED INFLUENCERS ==========
  console.log('\n🌟 Creating influencer users...');

  const influencer1 = await prisma.user.create({
    data: {
      email: 'techguru@influencer.com',
      password: hashedPassword,
      name: 'Tech Guru',
      role: 'INFLUENCER',
      verificationStatus: 'VERIFIED',
      influencerProfile: {
        create: {
          displayName: 'TechGuru Reviews',
          bio: 'I review the latest tech gadgets, smartphones, and laptops. 500K+ subscribers love my honest reviews!',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          youtubeChannelUrl: 'https://youtube.com/@techgurureviews',
          youtubeChannelId: 'UC1234567890techguru',
          subscriberCount: 520000,
          categoryTags: ['Tech', 'Gaming', 'Education'],
          pastWorkLinks: [
            'https://youtube.com/watch?v=sample1',
            'https://youtube.com/watch?v=sample2',
          ],
          identityDocument: 'uploads/documents/techguru-id.pdf',
          verificationNotes: 'Verified tech influencer with authentic engagement',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });
  console.log(`   ✓ Influencer: ${influencer1.email} (VERIFIED)`);

  const influencer2 = await prisma.user.create({
    data: {
      email: 'fitnessfirst@influencer.com',
      password: hashedPassword,
      name: 'Fitness First',
      role: 'INFLUENCER',
      verificationStatus: 'VERIFIED',
      influencerProfile: {
        create: {
          displayName: 'Fitness First with Priya',
          bio: 'Certified fitness trainer sharing workout routines, nutrition tips, and healthy lifestyle content.',
          profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
          youtubeChannelUrl: 'https://youtube.com/@fitnessfirstpriya',
          youtubeChannelId: 'UC0987654321fitness',
          subscriberCount: 180000,
          categoryTags: ['Fitness', 'Health', 'Lifestyle'],
          pastWorkLinks: [
            'https://youtube.com/watch?v=workout1',
          ],
          identityDocument: 'uploads/documents/fitness-id.pdf',
          verificationNotes: 'Verified fitness influencer',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });
  console.log(`   ✓ Influencer: ${influencer2.email} (VERIFIED)`);

  const influencer3 = await prisma.user.create({
    data: {
      email: 'gamer@influencer.com',
      password: hashedPassword,
      name: 'ProGamer',
      role: 'INFLUENCER',
      verificationStatus: 'UNDER_REVIEW',
      influencerProfile: {
        create: {
          displayName: 'ProGamer India',
          bio: 'Professional BGMI and Valorant player. Stream daily on YouTube!',
          profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
          youtubeChannelUrl: 'https://youtube.com/@progamerindia',
          youtubeChannelId: 'UCgamer123456',
          subscriberCount: 95000,
          categoryTags: ['Gaming', 'Entertainment'],
          pastWorkLinks: [],
          identityDocument: 'uploads/documents/gamer-id.pdf',
        },
      },
    },
  });
  console.log(`   ✓ Influencer: ${influencer3.email} (UNDER_REVIEW)`);

  const influencer4 = await prisma.user.create({
    data: {
      email: 'newcreator@influencer.com',
      password: hashedPassword,
      name: 'New Creator',
      role: 'INFLUENCER',
      verificationStatus: 'PENDING',
    },
  });
  console.log(`   ✓ Influencer: ${influencer4.email} (PENDING - no profile)`);

  const influencer5 = await prisma.user.create({
    data: {
      email: 'rejected@influencer.com',
      password: hashedPassword,
      name: 'Rejected Creator',
      role: 'INFLUENCER',
      verificationStatus: 'REJECTED',
      influencerProfile: {
        create: {
          displayName: 'Test Creator',
          bio: 'This is a test account that was rejected.',
          profileImage: null,
          youtubeChannelUrl: 'https://youtube.com/@testcreator',
          subscriberCount: 100,
          categoryTags: ['Lifestyle'],
          pastWorkLinks: [],
          identityDocument: 'uploads/documents/test-id.pdf',
          verificationNotes: 'Rejected: Insufficient subscriber count and unclear document',
        },
      },
    },
  });
  console.log(`   ✓ Influencer: ${influencer5.email} (REJECTED)`);

  // ========== CREATE CAMPAIGNS ==========
  console.log('\n📢 Creating campaigns...');

  const nikeProfile = await prisma.brandProfile.findUnique({ where: { userId: brand1.id } });
  const samsungProfile = await prisma.brandProfile.findUnique({ where: { userId: brand2.id } });

  const campaign1 = await prisma.campaign.create({
    data: {
      title: 'Nike Air Max 2024 Launch Campaign',
      description: 'Create an unboxing and review video of the new Nike Air Max 2024. Showcase the design, comfort, and style.',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-15'),
      budget: 500000,
      status: 'ACTIVE',
      categoryTags: ['Fashion', 'Lifestyle', 'Sports'],
      contentRequirements: '1. Unboxing video (5-10 mins)\n2. Show product from all angles\n3. Mention key features\n4. Include affiliate link in description',
      rules: '1. Must disclose sponsorship\n2. No competitor mentions\n3. Family-friendly content only',
      resultsDate: new Date('2024-03-20'),
      evaluationCriteria: {
        engagement: { weight: 40, description: 'Views, likes, comments' },
        creativity: { weight: 30, description: 'Originality of content' },
        referrals: { weight: 30, description: 'Click-through rate' },
      },
      prizeDistribution: [
        { rank: 1, amount: 100000, description: 'Winner' },
        { rank: 2, amount: 50000, description: '1st Runner Up' },
        { rank: 3, amount: 25000, description: '2nd Runner Up' },
      ],
      brandId: brand1.id,
      escrow: {
        create: {
          amount: 175000,
          status: 'FUNDED',
          paymentReference: 'PAY_123456789',
          fundedAt: new Date(),
        },
      },
    },
  });
  console.log(`   ✓ Campaign: ${campaign1.title} (ACTIVE)`);

  const campaign2 = await prisma.campaign.create({
    data: {
      title: 'Samsung Galaxy S24 Ultra Review Contest',
      description: 'Review the Samsung Galaxy S24 Ultra focusing on camera capabilities, AI features, and performance.',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-04-01'),
      budget: 800000,
      status: 'ACTIVE',
      categoryTags: ['Tech', 'Gaming'],
      contentRequirements: '1. Detailed camera review\n2. AI features demonstration\n3. Gaming performance test\n4. Battery life test',
      rules: '1. Video must be 10-15 minutes\n2. Use provided product only\n3. Honest review (can mention negatives)',
      resultsDate: new Date('2024-04-10'),
      evaluationCriteria: {
        quality: { weight: 50, description: 'Video production quality' },
        engagement: { weight: 30, description: 'Audience engagement' },
        referrals: { weight: 20, description: 'Referral performance' },
      },
      prizeDistribution: [
        { rank: 1, amount: 200000, description: 'Grand Prize' },
        { rank: 2, amount: 100000, description: 'Runner Up' },
        { rank: 3, amount: 50000, description: 'Third Place' },
      ],
      brandId: brand2.id,
      escrow: {
        create: {
          amount: 350000,
          status: 'FUNDED',
          paymentReference: 'PAY_987654321',
          fundedAt: new Date(),
        },
      },
    },
  });
  console.log(`   ✓ Campaign: ${campaign2.title} (ACTIVE)`);

  const campaign3 = await prisma.campaign.create({
    data: {
      title: 'Nike Running Challenge',
      description: 'Share your running journey using Nike running shoes.',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-01'),
      budget: 200000,
      status: 'DRAFT',
      categoryTags: ['Fitness', 'Sports'],
      contentRequirements: 'Create a video showing your running routine with Nike shoes.',
      rules: 'Must be original content.',
      brandId: brand1.id,
    },
  });
  console.log(`   ✓ Campaign: ${campaign3.title} (DRAFT)`);

  const campaign4 = await prisma.campaign.create({
    data: {
      title: 'Completed Tech Campaign',
      description: 'This campaign has been completed.',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-11-01'),
      budget: 300000,
      status: 'COMPLETED',
      categoryTags: ['Tech'],
      contentRequirements: 'Tech review video.',
      rules: 'Standard rules.',
      resultsDate: new Date('2023-11-10'),
      brandId: brand2.id,
    },
  });
  console.log(`   ✓ Campaign: ${campaign4.title} (COMPLETED)`);

  // ========== CREATE APPLICATIONS ==========
  console.log('\n📝 Creating applications...');

  const techguruProfile = await prisma.influencerProfile.findUnique({ where: { userId: influencer1.id } });
  const fitnessProfile = await prisma.influencerProfile.findUnique({ where: { userId: influencer2.id } });

  const application1 = await prisma.application.create({
    data: {
      campaignId: campaign1.id,
      influencerId: influencer1.id,
      status: 'APPROVED',
      pitch: 'I have 520K subscribers in the tech/lifestyle niche. I can create a professional unboxing video with cinematic shots.',
      proposedContent: 'High-quality unboxing + on-feet review + street style shots',
      reviewedBy: brand1.id,
      reviewedAt: new Date(),
      referralLink: {
        create: {
          uniqueCode: 'NIKE-TECHGURU-2024',
          url: 'https://drkmttr.com/ref/NIKE-TECHGURU-2024',
          campaignId: campaign1.id,
          totalClicks: 1250,
          uniqueClicks: 890,
          conversions: 45,
        },
      },
    },
  });
  console.log(`   ✓ Application: TechGuru → Nike Campaign (APPROVED)`);

  const application2 = await prisma.application.create({
    data: {
      campaignId: campaign2.id,
      influencerId: influencer1.id,
      status: 'APPROVED',
      pitch: 'As a tech reviewer, I can provide in-depth analysis of the S24 Ultra.',
      proposedContent: 'Camera comparison + AI features deep dive + gaming test',
      reviewedBy: brand2.id,
      reviewedAt: new Date(),
      referralLink: {
        create: {
          uniqueCode: 'SAMSUNG-TECHGURU-S24',
          url: 'https://drkmttr.com/ref/SAMSUNG-TECHGURU-S24',
          campaignId: campaign2.id,
          totalClicks: 2100,
          uniqueClicks: 1650,
          conversions: 78,
        },
      },
    },
  });
  console.log(`   ✓ Application: TechGuru → Samsung Campaign (APPROVED)`);

  const application3 = await prisma.application.create({
    data: {
      campaignId: campaign1.id,
      influencerId: influencer2.id,
      status: 'PENDING',
      pitch: 'I can showcase Nike Air Max in my workout and lifestyle content.',
      proposedContent: 'Gym outfit of the day + street style + comfort review',
    },
  });
  console.log(`   ✓ Application: FitnessFirst → Nike Campaign (PENDING)`);

  // ========== CREATE SUBMISSIONS ==========
  console.log('\n🎬 Creating submissions...');

  const submission1 = await prisma.submission.create({
    data: {
      campaignId: campaign1.id,
      influencerId: influencer1.id,
      contentUrl: 'https://youtube.com/watch?v=nike-airmax-review-techguru',
      socialPlatform: 'YOUTUBE',
      contentType: 'VIDEO',
      metrics: {
        views: 45000,
        likes: 3200,
        comments: 450,
        shares: 120,
        scrapedAt: new Date().toISOString(),
      },
      validationStatus: 'APPROVED',
      score: 85.5,
      adminNotes: 'High-quality production, good engagement',
      leaderboardEntry: {
        create: {
          campaignId: campaign1.id,
          engagementScore: 78.5,
          referralScore: 82.3,
          qualityScore: 90.0,
          totalScore: 85.5,
          rank: 1,
          prizeAmount: 100000,
          scoreBreakdown: {
            views: 45000,
            engagementRate: 8.2,
            referralClicks: 890,
            conversions: 45,
          },
          isRevealed: true,
        },
      },
    },
  });
  console.log(`   ✓ Submission: TechGuru → Nike Campaign (Score: 85.5)`);

  const submission2 = await prisma.submission.create({
    data: {
      campaignId: campaign2.id,
      influencerId: influencer1.id,
      contentUrl: 'https://youtube.com/watch?v=samsung-s24-ultra-review',
      socialPlatform: 'YOUTUBE',
      contentType: 'VIDEO',
      metrics: {
        views: 78000,
        likes: 5600,
        comments: 780,
        shares: 230,
        scrapedAt: new Date().toISOString(),
      },
      validationStatus: 'PENDING',
      leaderboardEntry: {
        create: {
          campaignId: campaign2.id,
          engagementScore: 82.0,
          referralScore: 75.5,
          qualityScore: 88.0,
          totalScore: 81.8,
          rank: 1,
          scoreBreakdown: {
            views: 78000,
            engagementRate: 8.5,
            referralClicks: 1650,
            conversions: 78,
          },
          isRevealed: false,
        },
      },
    },
  });
  console.log(`   ✓ Submission: TechGuru → Samsung Campaign (Score: 81.8)`);

  // ========== CREATE ADMIN ACTIONS ==========
  console.log('\n📋 Creating admin actions...');

  await prisma.adminAction.createMany({
    data: [
      {
        performedBy: admin.id,
        actionType: 'VERIFY_INFLUENCER',
        targetType: 'User',
        targetId: influencer1.id,
        notes: 'Verified - Authentic tech influencer with strong engagement',
        previousState: { verificationStatus: 'UNDER_REVIEW' },
        newState: { verificationStatus: 'VERIFIED' },
      },
      {
        performedBy: admin.id,
        actionType: 'VERIFY_INFLUENCER',
        targetType: 'User',
        targetId: influencer2.id,
        notes: 'Verified - Legitimate fitness content creator',
        previousState: { verificationStatus: 'UNDER_REVIEW' },
        newState: { verificationStatus: 'VERIFIED' },
      },
      {
        performedBy: admin.id,
        actionType: 'REJECT_INFLUENCER',
        targetType: 'User',
        targetId: influencer5.id,
        notes: 'Rejected - Insufficient subscriber count and unclear identity document',
        previousState: { verificationStatus: 'UNDER_REVIEW' },
        newState: { verificationStatus: 'REJECTED' },
      },
      {
        performedBy: admin.id,
        actionType: 'VERIFY_BRAND',
        targetType: 'User',
        targetId: brand1.id,
        notes: 'Verified multinational brand - Nike India',
        previousState: { verificationStatus: 'UNDER_REVIEW' },
        newState: { verificationStatus: 'VERIFIED' },
      },
      {
        performedBy: admin.id,
        actionType: 'VERIFY_BRAND',
        targetType: 'User',
        targetId: brand2.id,
        notes: 'Verified multinational brand - Samsung India',
        previousState: { verificationStatus: 'UNDER_REVIEW' },
        newState: { verificationStatus: 'VERIFIED' },
      },
    ],
  });
  console.log(`   ✓ Created 5 admin action logs`);

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('✅ SEEDING COMPLETE!');
  console.log('='.repeat(50));
  console.log('\n📊 Data Summary:');
  console.log(`   • Users: ${await prisma.user.count()}`);
  console.log(`   • Influencer Profiles: ${await prisma.influencerProfile.count()}`);
  console.log(`   • Brand Profiles: ${await prisma.brandProfile.count()}`);
  console.log(`   • Campaigns: ${await prisma.campaign.count()}`);
  console.log(`   • Applications: ${await prisma.application.count()}`);
  console.log(`   • Submissions: ${await prisma.submission.count()}`);
  console.log(`   • Escrows: ${await prisma.escrow.count()}`);
  console.log(`   • Admin Actions: ${await prisma.adminAction.count()}`);

  console.log('\n🔐 Test Credentials (password: password123):');
  console.log('   Admin:      admin@drkmttr.com');
  console.log('   Brand:      nike@brand.com (VERIFIED)');
  console.log('   Brand:      samsung@brand.com (VERIFIED)');
  console.log('   Brand:      startup@brand.com (UNDER_REVIEW)');
  console.log('   Brand:      pending@brand.com (PENDING)');
  console.log('   Influencer: techguru@influencer.com (VERIFIED)');
  console.log('   Influencer: fitnessfirst@influencer.com (VERIFIED)');
  console.log('   Influencer: gamer@influencer.com (UNDER_REVIEW)');
  console.log('   Influencer: newcreator@influencer.com (PENDING)');
  console.log('   Influencer: rejected@influencer.com (REJECTED)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
