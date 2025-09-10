const { connectDB, User, closeDB } = require('./models');

async function seedUsers() {
  console.log('🌱 Seeding Users...');
  console.log('==================');
  
  try {
    // Connect to database
    await connectDB();
    
    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log(`📊 Found ${existingUsers} existing users`);
      console.log('⚠️  Skipping seed to avoid duplicates');
      return;
    }
    
    // Create test users
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        balance: 1000.00,
        bio: 'Software developer and tech enthusiast',
        occupation: 'Software Developer',
        company: 'Tech Corp',
        preferences: {
          currency: 'USD',
          language: 'en',
          timezone: 'America/New_York',
          notifications: true
        }
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        phoneNumber: '+1234567891',
        balance: 2500.50,
        bio: 'Financial advisor and investment specialist',
        occupation: 'Financial Advisor',
        company: 'Finance Inc',
        preferences: {
          currency: 'USD',
          language: 'en',
          timezone: 'America/Los_Angeles',
          notifications: true
        }
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@zappay.com',
        password: 'admin123',
        phoneNumber: '+1234567892',
        balance: 0.00,
        bio: 'System administrator',
        occupation: 'System Administrator',
        company: 'ZapPay',
        role: 'admin',
        preferences: {
          currency: 'USD',
          language: 'en',
          timezone: 'UTC',
          notifications: true
        }
      }
    ];
    
    console.log('🔄 Creating test users...');
    
    for (const userData of testUsers) {
      try {
        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 User seeding completed!');
    console.log('\n📋 Test Credentials:');
    console.log('===================');
    console.log('Regular User: john.doe@example.com / password123');
    console.log('Regular User: jane.smith@example.com / password123');
    console.log('Admin User: admin@zappay.com / admin123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedUsers;
