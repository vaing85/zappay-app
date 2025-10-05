// Test Daily Report System
require('dotenv').config();
const SchedulerService = require('./services/scheduler');

async function testDailyReport() {
  console.log('🧪 Testing ZapPay Daily Report System...\n');
  
  try {
    const scheduler = new SchedulerService();
    
    console.log('📊 Generating test daily report...');
    const report = await scheduler.generateManualReport();
    
    console.log('\n✅ Daily Report Generated Successfully!');
    console.log('📧 Report Data:');
    console.log(`   - Date: ${report.date}`);
    console.log(`   - Errors: ${report.errors.length}`);
    console.log(`   - Updates: ${report.updates.length}`);
    console.log(`   - Upgrades: ${report.upgrades.length}`);
    console.log(`   - MongoDB Status: ${report.systemHealth.mongodb}`);
    console.log(`   - Total Users: ${report.userStats.totalUsers}`);
    console.log(`   - Total Transactions: ${report.transactionStats.totalTransactions}`);
    
    console.log('\n📧 Email Configuration:');
    console.log(`   - Email User: ${process.env.EMAIL_USER || 'Not set'}`);
    console.log(`   - Admin Email: ${process.env.ADMIN_EMAIL || 'Not set'}`);
    
    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      console.log('\n⚠️  Email not configured yet!');
      console.log('   Please set EMAIL_USER and ADMIN_EMAIL in your .env file');
      console.log('   See EMAIL_CONFIGURATION.md for setup instructions');
    } else {
      console.log('\n✅ Email configuration looks good!');
      console.log('   Daily reports will be sent automatically');
    }
    
    console.log('\n🎉 Daily Report System Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📝 Error details:', error);
  }
}

testDailyReport();
