const cron = require('node-cron');
const DailyReportService = require('./dailyReportService');

class SchedulerService {
  constructor() {
    this.dailyReportService = new DailyReportService();
    this.jobs = [];
  }

  startDailyReport() {
    // Run daily report at 9:00 AM Central Time every day
    const morningReportJob = cron.schedule('0 9 * * *', async () => {
      console.log('🌅 Running scheduled morning daily report...');
      try {
        await this.dailyReportService.generateDailyReport();
        console.log('✅ Morning daily report completed successfully');
      } catch (error) {
        console.error('❌ Morning daily report failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'America/Chicago' // Central Time
    });

    // Run daily report at 9:00 PM Central Time every day
    const eveningReportJob = cron.schedule('0 21 * * *', async () => {
      console.log('🌙 Running scheduled evening daily report...');
      try {
        await this.dailyReportService.generateDailyReport();
        console.log('✅ Evening daily report completed successfully');
      } catch (error) {
        console.error('❌ Evening daily report failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'America/Chicago' // Central Time
    });

    this.jobs.push(morningReportJob);
    this.jobs.push(eveningReportJob);
    return { morningReportJob, eveningReportJob };
  }

  startHealthCheck() {
    // Run health check every 5 minutes
    const healthCheckJob = cron.schedule('*/5 * * * *', async () => {
      try {
        const { healthCheck } = require('../config/mongodb');
        const health = await healthCheck();
        
        if (health.status !== 'healthy') {
          console.warn('⚠️ MongoDB health check failed:', health);
          // You can add alerting here
        }
      } catch (error) {
        console.error('❌ Health check failed:', error.message);
      }
    }, {
      scheduled: false
    });

    this.jobs.push(healthCheckJob);
    return healthCheckJob;
  }

  startCleanup() {
    // Run cleanup tasks daily at 2:00 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running cleanup tasks...');
      try {
        // Add cleanup tasks here (old logs, temp files, etc.)
        console.log('✅ Cleanup completed');
      } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
      }
    }, {
      scheduled: false
    });

    this.jobs.push(cleanupJob);
    return cleanupJob;
  }

  startAll() {
    console.log('🚀 Starting scheduled jobs...');
    
    this.startDailyReport();
    this.startHealthCheck();
    this.startCleanup();
    
    // Start all jobs
    this.jobs.forEach(job => job.start());
    
    console.log(`✅ Started ${this.jobs.length} scheduled jobs`);
  }

  stopAll() {
    console.log('🛑 Stopping all scheduled jobs...');
    this.jobs.forEach(job => job.stop());
    console.log('✅ All scheduled jobs stopped');
  }

  // Manual report generation for testing
  async generateManualReport() {
    console.log('📊 Generating manual daily report...');
    return await this.dailyReportService.generateDailyReport();
  }
}

module.exports = SchedulerService;
