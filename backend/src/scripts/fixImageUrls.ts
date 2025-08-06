/**
 * Migration script to fix profile picture URLs
 * Converts relative URLs to absolute URLs with correct backend domain
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    console.log('🔄 Starting URL migration...');
    
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    console.log(`📍 Using base URL: ${baseUrl}`);
    
    // Find all users with relative profile picture URLs
    const usersWithRelativeUrls = await prisma.user.findMany({
      where: {
        profilePicture: {
          startsWith: '/uploads/'
        }
      },
      select: {
        id: true,
        profilePicture: true,
        fullName: true
      }
    });
    
    console.log(`👥 Found ${usersWithRelativeUrls.length} users with relative URLs`);
    
    if (usersWithRelativeUrls.length === 0) {
      console.log('✅ No URLs to fix');
      return;
    }
    
    // Update each user's profile picture URL
    for (const user of usersWithRelativeUrls) {
      const oldUrl = user.profilePicture;
      const newUrl = `${baseUrl}${oldUrl}`;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: newUrl }
      });
      
      console.log(`✅ Updated ${user.fullName}: ${oldUrl} → ${newUrl}`);
    }
    
    console.log(`🎉 Successfully updated ${usersWithRelativeUrls.length} profile picture URLs`);
    
  } catch (error) {
    console.error('❌ Error during URL migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixImageUrls()
  .then(() => {
    console.log('✅ URL migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ URL migration failed:', error);
    process.exit(1);
  });
