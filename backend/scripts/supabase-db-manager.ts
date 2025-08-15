import { PrismaClient } from '@prisma/client';
import { EnvironmentConfig } from '../src/config/environment.config';

// Add Node.js types for process.argv
declare const process: {
  argv: string[];
};

const prisma = new PrismaClient();

class SupabaseDatabaseManager {
  static async initializeSupabaseDatabase() {
    try {
      console.log('🚀 Initializing Supabase development database...');
      
      if (EnvironmentConfig.isProduction()) {
        console.error('❌ This script should only run in development!');
        return;
      }

      const teamInfo = EnvironmentConfig.getTeamMemberInfo();
      console.log(` Team setup: ${teamInfo.teamSize} members, Supabase database`);
      console.log('💰 Cost: $0/month (completely free forever)');

      // Test connection
      await prisma.$connect();
      console.log('✅ Supabase database connection successful');

      // Create team test data
      await this.createTeamTestData();
      
      console.log('🎉 Supabase database initialized successfully!');
      console.log('📝 All team members can now access the same data');
      console.log('🌐 Access Supabase Dashboard: https://supabase.com/dashboard');
      
    } catch (error) {
      console.error('❌ Error initializing Supabase database:', error);
      console.log(' Make sure your DATABASE_URL is correct in .env.development');
    } finally {
      await prisma.$disconnect();
    }
  }

  static async createTeamTestData() {
    console.log(' Creating team test data...');

    // Create test users for different team members
    const testUsers = [
      {
        email: 'admin@airvikbook.com',
        fullName: 'Team Admin',
        role: 'ADMIN' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      },
      {
        email: 'developer1@airvikbook.com',
        fullName: 'Developer 1',
        role: 'STAFF' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      },
      {
        email: 'developer2@airvikbook.com',
        fullName: 'Developer 2',
        role: 'STAFF' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      },
      {
        email: 'tester@airvikbook.com',
        fullName: 'QA Tester',
        role: 'STAFF' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      },
      {
        email: 'user@airvikbook.com',
        fullName: 'Test User',
        role: 'GUEST' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      },
      {
        email: 'customer@airvikbook.com',
        fullName: 'Sample Customer',
        role: 'GUEST' as const,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e', // "admin123"
        isEmailVerified: true
      }
    ];

    for (const userData of testUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        console.log(`⚠️ User ${userData.email} already exists`);
      }
    }

    // Create some test properties
    const testProperties = [
      {
        name: 'Grand Hotel',
        description: 'Luxury hotel in city center',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        phone: '+1-555-0123',
        email: 'info@grandhotel.com',
        website: 'https://grandhotel.com'
      },
      {
        name: 'Seaside Resort',
        description: 'Beautiful beachfront resort',
        address: '456 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        zipCode: '33139',
        phone: '+1-555-0456',
        email: 'info@seasideresort.com',
        website: 'https://seasideresort.com'
      }
    ];

    for (const propertyData of testProperties) {
      try {
        const property = await prisma.property.create({
          data: propertyData
        });
        console.log(`✅ Created property: ${property.name}`);
      } catch (error) {
        console.log(`⚠️ Property ${propertyData.name} already exists`);
      }
    }

    console.log('✅ Team test data created successfully');
    console.log('🔑 All test users have password: admin123');
  }

  static async getSupabaseDatabaseStats() {
    try {
      const [userCount, sessionCount, activeSessions, propertyCount] = await Promise.all([
        prisma.user.count(),
        prisma.session.count(),
        prisma.session.count({
          where: {
            isActive: true,
            expiresAt: { gt: new Date() }
          }
        }),
        prisma.property.count()
      ]);

      const teamInfo = EnvironmentConfig.getTeamMemberInfo();
      
      console.log('📊 Supabase Database Statistics:');
      console.log(`- Environment: ${EnvironmentConfig.isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      console.log(`- Team Size: ${teamInfo.teamSize} members`);
      console.log(`- Database Provider: Supabase`);
      console.log(`- Monthly Cost: $0 (completely free)`);
      console.log(`- Total Users: ${userCount}`);
      console.log(`- Total Sessions: ${sessionCount}`);
      console.log(`- Active Sessions: ${activeSessions}`);
      console.log(`- Total Properties: ${propertyCount}`);
      
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
    }
  }

  static async resetSupabaseDatabase() {
    if (EnvironmentConfig.isProduction()) {
      console.error('❌ Cannot reset production database!');
      return;
    }

    try {
      console.log(' Resetting Supabase development database...');
      console.log('⚠️ This will delete ALL data and recreate test data');
      
      // Drop all tables (only in development!)
      await prisma.$executeRaw`DROP SCHEMA public CASCADE`;
      await prisma.$executeRaw`CREATE SCHEMA public`;
      
      console.log('✅ Database reset successfully');
      
      // Recreate test data
      await this.createTeamTestData();
      
      console.log('🎉 Supabase database reset and reinitialized!');
      
    } catch (error) {
      console.error('❌ Error resetting database:', error);
    }
  }

  static async showSupabaseAccessInfo() {
    const teamInfo = EnvironmentConfig.getTeamMemberInfo();
    
    console.log('🔑 Supabase Database Access Information:');
    console.log(`- Provider: Supabase`);
    console.log(`- Team Size: ${teamInfo.teamSize} members`);
    console.log(`- Cost: $0/month (completely free forever)`);
    console.log(`- Shared: ${teamInfo.sharedDatabase ? 'Yes' : 'No'}`);
    console.log(`- Storage: 500MB free`);
    console.log(`- Connections: Unlimited`);
    
    if (EnvironmentConfig.isDevelopment()) {
      console.log('\n📋 How to connect:');
      console.log('1. Copy .env.development file to your local machine');
      console.log('2. Run: npm run dev');
      console.log('3. All team members will see the same data');
      console.log('4. Changes made by one person are visible to everyone');
      console.log('\n Supabase Dashboard:');
      console.log('- Go to: https://supabase.com/dashboard');
      console.log('- Click on your project');
      console.log('- Go to "Table Editor" to view/edit data');
      console.log('- Go to "SQL Editor" to run queries');
    }
  }

  static async showSupabaseAdvantages() {
    console.log('🎉 Why Supabase is Perfect for Your Team:');
    console.log('✅ Completely free forever (no trial expiration)');
    console.log('✅ 500MB storage (plenty for development)');
    console.log('✅ Unlimited connections (all 6 team members)');
    console.log('✅ Built-in dashboard (easy data management)');
    console.log('✅ Real-time features (bonus for future)');
    console.log('✅ Built-in authentication (if needed later)');
    console.log('✅ Automatic backups (built-in)');
    console.log('✅ No credit card required');
    console.log('✅ No usage limits');
    console.log('✅ Professional support available');
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'init':
    SupabaseDatabaseManager.initializeSupabaseDatabase();
    break;
  case 'stats':
    SupabaseDatabaseManager.getSupabaseDatabaseStats();
    break;
  case 'reset':
    SupabaseDatabaseManager.resetSupabaseDatabase();
    break;
  case 'info':
    SupabaseDatabaseManager.showSupabaseAccessInfo();
    break;
  case 'advantages':
    SupabaseDatabaseManager.showSupabaseAdvantages();
    break;
  default:
    console.log('Available commands:');
    console.log('  npm run supabase:init      - Initialize Supabase database');
    console.log('  npm run supabase:stats     - Show Supabase database statistics');
    console.log('  npm run supabase:reset     - Reset Supabase database');
    console.log('  npm run supabase:info      - Show Supabase access information');
    console.log('  npm run supabase:advantages - Show why Supabase is great');
}

prisma.$disconnect();
