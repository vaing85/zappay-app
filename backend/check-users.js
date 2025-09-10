const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkUsers() {
  console.log('🔍 Checking Database Users...');
  console.log('================================');
  
  // Check if DB_URL is set
  if (!process.env.DB_URL) {
    console.error('❌ DB_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('✅ DB_URL is set');
  
  // Create Sequelize instance
  const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false
  });

  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Check if users table exists
    console.log('🔄 Checking if users table exists...');
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = results[0].exists;
    console.log(`📊 Users table exists: ${tableExists ? '✅ YES' : '❌ NO'}`);
    
    if (tableExists) {
      // Count total users
      console.log('🔄 Counting total users...');
      const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM users;');
      const totalUsers = countResult[0].total;
      console.log(`👥 Total users in database: ${totalUsers}`);
      
      if (totalUsers > 0) {
        // Get user details (without passwords)
        console.log('🔄 Fetching user details...');
        const [users] = await sequelize.query(`
          SELECT 
            id,
            "firstName",
            "lastName", 
            email,
            "phoneNumber",
            balance,
            "isActive",
            "createdAt",
            "lastLoginAt",
            "emailVerifiedAt"
          FROM users 
          ORDER BY "createdAt" DESC 
          LIMIT 10;
        `);
        
        console.log('\n📋 Recent Users (last 10):');
        console.log('================================');
        
        users.forEach((user, index) => {
          console.log(`\n${index + 1}. User ID: ${user.id}`);
          console.log(`   Name: ${user.firstName} ${user.lastName}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Phone: ${user.phoneNumber}`);
          console.log(`   Balance: $${user.balance}`);
          console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
          console.log(`   Created: ${user.createdAt}`);
          console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`);
          console.log(`   Email Verified: ${user.emailVerifiedAt ? '✅' : '❌'}`);
        });
        
        // Check for any users with specific test emails
        console.log('\n🔍 Checking for test users...');
        const [testUsers] = await sequelize.query(`
          SELECT email, "firstName", "lastName", "createdAt"
          FROM users 
          WHERE email LIKE '%test%' 
          OR email LIKE '%demo%' 
          OR email LIKE '%example%'
          OR email LIKE '%@test.%'
          OR email LIKE '%@demo.%'
          OR email LIKE '%@example.%';
        `);
        
        if (testUsers.length > 0) {
          console.log('⚠️  Found test users:');
          testUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - Created: ${user.createdAt}`);
          });
        } else {
          console.log('✅ No obvious test users found');
        }
        
      } else {
        console.log('📝 Database is empty - no users found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking users:');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkUsers()
  .then(() => {
    console.log('\n🎉 User check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 User check failed:', error.message);
    process.exit(1);
  });
