import { ProductionBackupService } from '../src/services/backup/productionBackup.service';
import { EnvironmentConfig } from '../src/config/environment.config';

const backupService = new ProductionBackupService();

class ProductionBackupManager {
  static async showBackupStatus() {
    console.log('📊 Production Backup Status');
    console.log('============================');
    
    if (!EnvironmentConfig.isProduction()) {
      console.log('❌ This script should only run in production!');
      return;
    }

    const status = await backupService.getBackupStatus();
    const health = await backupService.getBackupHealth();

    console.log(`🏥 Health Status: ${health.status.toUpperCase()}`);
    console.log(`📅 Backup Retention: ${status.backupRetentionDays} days`);
    console.log(`🔄 Point-in-Time Recovery: ${status.pointInTimeRecovery ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🏢 Multi-AZ Deployment: ${status.multiAZ ? '✅ Enabled' : '❌ Disabled'}`);
    
    if (status.lastAutomatedBackup) {
      console.log(`🤖 Last Automated Backup: ${status.lastAutomatedBackup.toLocaleString()}`);
    }
    
    if (status.lastManualBackup) {
      console.log(` Last Manual Backup: ${status.lastManualBackup.toLocaleString()}`);
    }
    
    console.log(`📈 Total Backups: ${status.totalBackups}`);
    console.log(`⏰ Next Scheduled Backup: ${status.nextScheduledBackup?.toLocaleString()}`);
    
    if (health.issues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      health.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (health.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      health.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  static async createManualBackup() {
    console.log('🚨 Creating Manual Backup (Panic Button)');
    console.log('=======================================');
    
    if (!EnvironmentConfig.isProduction()) {
      console.log('❌ Manual backups only available in production!');
      return;
    }

    console.log('⚠️ This will create a manual backup snapshot');
    console.log('⏱️ Estimated time: 30-60 seconds');
    console.log('💾 Backup will be retained for 35 days');
    
    const result = await backupService.createManualBackup();
    
    if (result.success) {
      console.log('✅ Manual backup created successfully!');
      console.log(`📸 Backup ID: ${result.backupId}`);
      console.log(`🔄 Recovery time: ${result.estimatedRecoveryTime}`);
      console.log(' Use this backup ID for disaster recovery');
    } else {
      console.log('❌ Manual backup failed!');
      console.log(`Error: ${result.error}`);
    }
  }

  static async showRecoveryOptions() {
    console.log('🔄 Disaster Recovery Options');
    console.log('=============================');
    
    if (!EnvironmentConfig.isProduction()) {
      console.log('❌ Recovery options only available in production!');
      return;
    }

    console.log('1. Manual Backup Restore');
    console.log('   - Restore from a specific backup snapshot');
    console.log('   - Use: npm run backup:restore <backup-id>');
    console.log('   - Time: 15-30 minutes');
    
    console.log('\n2. ⏰ Point-in-Time Recovery');
    console.log('   - Restore to any minute in the last 35 days');
    console.log('   - Use: npm run backup:recover <timestamp>');
    console.log('   - Time: 10-20 minutes');
    console.log('   - Like an "undo button" for your database');
    
    console.log('\n3. 🤖 Automated Backup Restore');
    console.log('   - Restore from the latest automated backup');
    console.log('   - Use: npm run backup:restore:auto');
    console.log('   - Time: 15-30 minutes');
    
    console.log('\n⚠️ WARNING: All recovery operations will:');
    console.log('   - Make the database temporarily unavailable');
    console.log('   - Potentially lose recent data');
    console.log('   - Require application restart');
  }

  static async showBackupAdvantages() {
    console.log('🎉 Your Production Backup Advantages');
    console.log('=====================================');
    
    console.log('✅ Automatic Daily Backups');
    console.log('   - AWS takes a "photo" of your database every night');
    console.log('   - 35 days of backup history');
    console.log('   - No manual intervention required');
    
    console.log('\n✅ Point-in-Time Recovery');
    console.log('   - Restore to any minute in the last 35 days');
    console.log('   - Like using "Ctrl+Z" in Word');
    console.log('   - Perfect for accidental data changes');
    
    console.log('\n✅ Manual Backup (Panic Button)');
    console.log('   - Create backup before risky changes');
    console.log('   - Instant snapshot in seconds');
    console.log('   - Quick recovery if something goes wrong');
    
    console.log('\n✅ Multi-AZ Protection');
    console.log('   - Database copies in two separate data centers');
    console.log('   - If one building burns down, data is safe');
    console.log('   - Automatic failover if primary fails');
    
    console.log('\n✅ Encryption & Security');
    console.log('   - All backups are encrypted');
    console.log('   - Secure storage in AWS data centers');
    console.log('   - Compliance with security standards');
    
    console.log('\n💰 Cost: $50-100/month for enterprise-grade protection');
    console.log('💡 Worth every penny for customer data safety!');
  }
}

// Command line interface
const command = process.argv[2];
const backupId = process.argv[3];

switch (command) {
  case 'status':
    ProductionBackupManager.showBackupStatus();
    break;
  case 'backup':
    ProductionBackupManager.createManualBackup();
    break;
  case 'recovery':
    ProductionBackupManager.showRecoveryOptions();
    break;
  case 'advantages':
    ProductionBackupManager.showBackupAdvantages();
    break;
  default:
    console.log('Available commands:');
    console.log('  npm run backup:status     - Show backup status');
    console.log('  npm run backup:create     - Create manual backup');
    console.log('  npm run backup:recovery   - Show recovery options');
    console.log('  npm run backup:advantages - Show backup advantages');
}
