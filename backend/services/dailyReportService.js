const nodemailer = require('nodemailer');
const { connectMongoDB, getCollection } = require('../config/mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DailyReportService {
  constructor() {
    this.transporter = this.createTransporter();
    this.reportData = {
      date: new Date().toISOString().split('T')[0],
      errors: [],
      updates: [],
      upgrades: [],
      systemHealth: {},
      userStats: {},
      transactionStats: {},
      performance: {}
    };
  }

  createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async collectSystemHealth() {
    try {
      // MongoDB Health
      const { healthCheck } = require('../config/mongodb');
      const mongoHealth = await healthCheck();
      
      this.reportData.systemHealth = {
        mongodb: mongoHealth.status,
        server: 'healthy',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.reportData.errors.push({
        type: 'System Health Collection',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async collectUserStats() {
    try {
      await connectMongoDB();
      const usersCollection = getCollection('users');
      
      const totalUsers = await usersCollection.countDocuments();
      const newUsersToday = await usersCollection.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });
      
      this.reportData.userStats = {
        totalUsers,
        newUsersToday,
        activeUsers: totalUsers // Simplified - you can add activity tracking
      };
    } catch (error) {
      this.reportData.errors.push({
        type: 'User Stats Collection',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async collectTransactionStats() {
    try {
      await connectMongoDB();
      const transactionsCollection = getCollection('transactions');
      
      const totalTransactions = await transactionsCollection.countDocuments();
      const transactionsToday = await transactionsCollection.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });
      
      const totalVolume = await transactionsCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      
      this.reportData.transactionStats = {
        totalTransactions,
        transactionsToday,
        totalVolume: totalVolume[0]?.total || 0
      };
    } catch (error) {
      this.reportData.errors.push({
        type: 'Transaction Stats Collection',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async collectErrorLogs() {
    try {
      const logPath = path.join(__dirname, '../logs/error.log');
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf8');
        const today = new Date().toISOString().split('T')[0];
        const todayErrors = logContent
          .split('\n')
          .filter(line => line.includes(today))
          .map(line => ({
            message: line,
            timestamp: new Date().toISOString()
          }));
        
        this.reportData.errors.push(...todayErrors);
      }
    } catch (error) {
      this.reportData.errors.push({
        type: 'Error Log Collection',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async collectUpdates() {
    // Check for system updates, dependency updates, etc.
    try {
      const packageJson = require('../package.json');
      this.reportData.updates.push({
        type: 'Dependencies',
        message: `Current version: ${packageJson.version}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.reportData.errors.push({
        type: 'Updates Collection',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  generateReportHTML() {
    const { date, errors, updates, upgrades, systemHealth, userStats, transactionStats } = this.reportData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .error { background: #fee2e2; border-left: 4px solid #ef4444; }
            .success { background: #dcfce7; border-left: 4px solid #22c55e; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #1f2937; }
            .stat-label { color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 ZapPay Daily Report</h1>
            <p>Date: ${date}</p>
        </div>

        <div class="section">
            <h2>📊 System Health</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${systemHealth.mongodb || 'Unknown'}</div>
                    <div class="stat-label">MongoDB Status</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(systemHealth.memory?.rss / 1024 / 1024) || 0}MB</div>
                    <div class="stat-label">Memory Usage</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(systemHealth.uptime / 3600) || 0}h</div>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>👥 User Statistics</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${userStats.totalUsers || 0}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${userStats.newUsersToday || 0}</div>
                    <div class="stat-label">New Users Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${userStats.activeUsers || 0}</div>
                    <div class="stat-label">Active Users</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💰 Transaction Statistics</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${transactionStats.totalTransactions || 0}</div>
                    <div class="stat-label">Total Transactions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${transactionStats.transactionsToday || 0}</div>
                    <div class="stat-label">Transactions Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${transactionStats.totalVolume || 0}</div>
                    <div class="stat-label">Total Volume</div>
                </div>
            </div>
        </div>

        ${errors.length > 0 ? `
        <div class="section error">
            <h2>❌ Errors (${errors.length})</h2>
            ${errors.map(error => `<p><strong>${error.type}:</strong> ${error.message}</p>`).join('')}
        </div>
        ` : ''}

        ${updates.length > 0 ? `
        <div class="section success">
            <h2>✅ Updates (${updates.length})</h2>
            ${updates.map(update => `<p><strong>${update.type}:</strong> ${update.message}</p>`).join('')}
        </div>
        ` : ''}

        ${upgrades.length > 0 ? `
        <div class="section warning">
            <h2>🔄 Upgrades (${upgrades.length})</h2>
            ${upgrades.map(upgrade => `<p><strong>${upgrade.type}:</strong> ${upgrade.message}</p>`).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>📝 Summary</h2>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Errors:</strong> ${errors.length}</p>
            <p><strong>Updates:</strong> ${updates.length}</p>
            <p><strong>Upgrades:</strong> ${upgrades.length}</p>
        </div>
    </body>
    </html>
    `;
  }

  async sendReport() {
    try {
      const htmlContent = this.generateReportHTML();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: process.env.ADMIN_EMAIL || 'admin@zappay.com',
        subject: `🚀 ZapPay Daily Report - ${this.reportData.date}`,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Daily report sent successfully');
    } catch (error) {
      console.error('❌ Failed to send daily report:', error.message);
    }
  }

  async generateDailyReport() {
    console.log('📊 Generating daily report...');
    
    await this.collectSystemHealth();
    await this.collectUserStats();
    await this.collectTransactionStats();
    await this.collectErrorLogs();
    await this.collectUpdates();
    
    await this.sendReport();
    
    return this.reportData;
  }
}

module.exports = DailyReportService;
