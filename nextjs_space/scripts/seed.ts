import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default test user
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'admin',
    },
  });

  // Create owner user
  console.log('Creating owner user...');
  const ownerPassword = await bcrypt.hash('trendhub2024', 10);
  
  await prisma.user.upsert({
    where: { email: 'owner@aitrendhub.com' },
    update: {},
    create: {
      email: 'owner@aitrendhub.com',
      password: ownerPassword,
      name: 'Owner',
      role: 'admin',
    },
  });

  // Create categories
  console.log('Creating categories...');
  
  const generalAI = await prisma.category.upsert({
    where: { name: 'general_ai' },
    update: {},
    create: {
      name: 'general_ai',
      displayName: 'General AI News',
      description: 'Latest news and developments in artificial intelligence',
      icon: 'Sparkles',
      color: '#60B5FF',
      order: 1,
      active: true,
    },
  });

  const salesAI = await prisma.category.upsert({
    where: { name: 'sales_ai' },
    update: {},
    create: {
      name: 'sales_ai',
      displayName: 'AI in Sales',
      description: 'AI tools and trends in sales and CRM',
      icon: 'TrendingUp',
      color: '#FF9149',
      order: 2,
      active: true,
    },
  });

  const recruitmentAI = await prisma.category.upsert({
    where: { name: 'recruitment_ai' },
    update: {},
    create: {
      name: 'recruitment_ai',
      displayName: 'AI in Recruitment',
      description: 'AI innovations in hiring and HR',
      icon: 'Users',
      color: '#FF90BB',
      order: 3,
      active: true,
    },
  });

  const reddit = await prisma.category.upsert({
    where: { name: 'reddit' },
    update: {},
    create: {
      name: 'reddit',
      displayName: 'Reddit Insights',
      description: 'Trending AI discussions from Reddit',
      icon: 'MessageSquare',
      color: '#80D8C3',
      order: 4,
      active: true,
    },
  });

  // Create RSS sources for General AI
  console.log('Creating RSS sources for General AI...');
  
  await prisma.source.upsert({
    where: { id: 'src-techcrunch-ai' },
    update: {},
    create: {
      id: 'src-techcrunch-ai',
      type: 'rss',
      name: 'TechCrunch AI',
      feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
      categoryId: generalAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-venturebeat-ai' },
    update: {},
    create: {
      id: 'src-venturebeat-ai',
      type: 'rss',
      name: 'VentureBeat AI',
      feedUrl: 'https://venturebeat.com/category/ai/feed/',
      categoryId: generalAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-mit-ai' },
    update: {},
    create: {
      id: 'src-mit-ai',
      type: 'rss',
      name: 'MIT Technology Review AI',
      feedUrl: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
      categoryId: generalAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-ai-news' },
    update: {},
    create: {
      id: 'src-ai-news',
      type: 'rss',
      name: 'AI News',
      feedUrl: 'https://www.artificialintelligence-news.com/feed/',
      categoryId: generalAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  // Create RSS sources for Sales AI
  console.log('Creating RSS sources for Sales AI...');
  
  await prisma.source.upsert({
    where: { id: 'src-sales-hacker' },
    update: {},
    create: {
      id: 'src-sales-hacker',
      type: 'rss',
      name: 'Sales Hacker',
      feedUrl: 'https://www.saleshacker.com/feed/',
      categoryId: salesAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-close-blog' },
    update: {},
    create: {
      id: 'src-close-blog',
      type: 'rss',
      name: 'Close Blog',
      feedUrl: 'https://blog.close.com/feed/',
      categoryId: salesAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  // Create RSS sources for Recruitment AI
  console.log('Creating RSS sources for Recruitment AI...');
  
  await prisma.source.upsert({
    where: { id: 'src-hr-technologist' },
    update: {},
    create: {
      id: 'src-hr-technologist',
      type: 'rss',
      name: 'HR Technologist',
      feedUrl: 'https://www.hrtechnologist.com/feed/',
      categoryId: recruitmentAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-recruiter' },
    update: {},
    create: {
      id: 'src-recruiter',
      type: 'rss',
      name: 'Recruiter.com',
      feedUrl: 'https://www.recruiter.com/feed/',
      categoryId: recruitmentAI.id,
      active: true,
      fetchInterval: 30,
    },
  });

  // Create Reddit sources
  console.log('Creating Reddit sources...');
  
  await prisma.source.upsert({
    where: { id: 'src-reddit-ml' },
    update: {},
    create: {
      id: 'src-reddit-ml',
      type: 'reddit',
      name: 'r/MachineLearning',
      subreddit: 'MachineLearning',
      categoryId: reddit.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-reddit-artificial' },
    update: {},
    create: {
      id: 'src-reddit-artificial',
      type: 'reddit',
      name: 'r/artificial',
      subreddit: 'artificial',
      categoryId: reddit.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-reddit-sales' },
    update: {},
    create: {
      id: 'src-reddit-sales',
      type: 'reddit',
      name: 'r/sales',
      subreddit: 'sales',
      categoryId: reddit.id,
      active: true,
      fetchInterval: 30,
    },
  });

  await prisma.source.upsert({
    where: { id: 'src-reddit-recruiting' },
    update: {},
    create: {
      id: 'src-reddit-recruiting',
      type: 'reddit',
      name: 'r/recruiting',
      subreddit: 'recruiting',
      categoryId: reddit.id,
      active: true,
      fetchInterval: 30,
    },
  });

  console.log('✅ Database seeding completed!');
  console.log('');
  console.log('Test Users:');
  console.log('  - john@doe.com / johndoe123 (admin)');
  console.log('  - owner@aitrendhub.com / trendhub2024 (admin)');
  console.log('');
  console.log('Categories: 4');
  console.log('Sources: 12 (8 RSS + 4 Reddit)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
