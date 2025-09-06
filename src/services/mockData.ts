import { User, Transaction } from '../types/User';

// Enhanced test users with different profiles
export const mockUsers: User[] = [
  {
    id: '1', 
    firstName: 'John',
    lastName: 'Doe',
    email: 'demo@zappay.com',
    phoneNumber: '+1 (555) 123-4567',
    balance: 1250.75,
    createdAt: '2024-01-01T00:00:00Z',
    dateOfBirth: '1985-03-15',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Software engineer passionate about fintech and digital payments. Love traveling and trying new cuisines.',
    occupation: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    website: 'https://johndoe.dev',
    socialMedia: {
      twitter: '@johndoe',
      linkedin: 'linkedin.com/in/johndoe',
      instagram: '@johndoe'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
      notifications: true
    },
    verificationStatus: {
      email: true,
      phone: true,
      identity: true,
      address: true
    }
  },
  {
    id: '1', 
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'user2@zappay.com',
    phoneNumber: '+1 (555) 234-5678',
    balance: 3200.50,
    createdAt: '2024-01-15T00:00:00Z',
    dateOfBirth: '1990-07-22',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Marketing professional with a passion for digital innovation. Coffee enthusiast and fitness lover.',
    occupation: 'Marketing Director',
    company: 'Creative Agency LLC',
    website: 'https://sarahwilson.com',
    socialMedia: {
      twitter: '@sarahwilson',
      linkedin: 'linkedin.com/in/sarahwilson',
      instagram: '@sarahwilson'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: true
    },
    verificationStatus: {
      email: true,
      phone: true,
      identity: true,
      address: false
    }
  },
  {
    id: '1', 
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'user3@zappay.com',
    phoneNumber: '+1 (555) 345-6789',
    balance: 89.25,
    createdAt: '2024-02-01T00:00:00Z',
    dateOfBirth: '1988-11-08',
    address: {
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States'
    },
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Freelance designer and entrepreneur. Always looking for the next big opportunity.',
    occupation: 'Freelance Designer',
    company: 'Self-Employed',
    website: 'https://mikejohnson.design',
    socialMedia: {
      twitter: '@mikejohnson',
      linkedin: 'linkedin.com/in/mikejohnson',
      instagram: '@mikejohnson'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/Chicago',
      notifications: false
    },
    verificationStatus: {
      email: true,
      phone: true,
      identity: false,
      address: true
    }
  },
  {
    id: '1', 
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'user4@zappay.com',
    phoneNumber: '+1 (555) 456-7890',
    balance: 5675.00,
    createdAt: '2024-01-20T00:00:00Z',
    dateOfBirth: '1992-05-12',
    address: {
      street: '321 Elm Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States'
    },
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Financial advisor helping people make smart money decisions. Dog lover and outdoor enthusiast.',
    occupation: 'Financial Advisor',
    company: 'Wealth Management Group',
    website: 'https://emmadavis.finance',
    socialMedia: {
      twitter: '@emmadavis',
      linkedin: 'linkedin.com/in/emmadavis',
      instagram: '@emmadavis'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: true
    },
    verificationStatus: {
      email: true,
      phone: true,
      identity: true,
      address: true
    }
  },
  {
    id: '1', 
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'user5@zappay.com',
    phoneNumber: '+1 (555) 567-8901',
    balance: 0.00,
    createdAt: '2024-02-10T00:00:00Z',
    dateOfBirth: '1995-09-30',
    address: {
      street: '654 Maple Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'United States'
    },
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Recent graduate exploring the world of fintech. Always learning and growing.',
    occupation: 'Junior Developer',
    company: 'StartupXYZ',
    website: 'https://alexbrown.dev',
    socialMedia: {
      twitter: '@alexbrown',
      linkedin: 'linkedin.com/in/alexbrown',
      instagram: '@alexbrown'
    },
    preferences: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/Chicago',
      notifications: true
    },
    verificationStatus: {
      email: true,
      phone: false,
      identity: false,
      address: false
    }
  },
];

// Enhanced transaction data with more realistic scenarios
export const mockTransactions: Transaction[] = [
  // John Doe's transactions
  {
    id: '1', 
    userId: '1', 
    type: 'send',
    amount: 50.00,
    recipient: 'Sarah Wilson',
    note: 'Dinner split at Italian restaurant',
    timestamp: '2024-01-15T19:30:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'receive',
    amount: 25.00,
    sender: 'Mike Johnson',
    note: 'Coffee money',
    timestamp: '2024-01-14T09:15:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'send',
    amount: 100.00,
    recipient: 'Emma Davis',
    note: 'Rent payment',
    timestamp: '2024-01-13T16:45:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'receive',
    amount: 15.50,
    sender: 'Alex Brown',
    note: 'Movie ticket',
    timestamp: '2024-01-12T20:30:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'send',
    amount: 75.00,
    recipient: 'Sarah Wilson',
    note: 'Grocery shopping',
    timestamp: '2024-01-11T14:20:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'receive',
    amount: 200.00,
    sender: 'Emma Davis',
    note: 'Freelance work payment',
    timestamp: '2024-01-10T11:00:00Z',
    status: 'completed',
  },
  {
    id: '1', 
    userId: '1', 
    type: 'send',
    amount: 30.00,
    recipient: 'Mike Johnson',
    note: 'Uber ride',
    timestamp: '2024-01-09T18:45:00Z',
    status: 'completed',
  },
  {
    id: '8',
    userId: '1',
    type: 'receive',
    amount: 45.00,
    sender: 'Alex Brown',
    note: 'Concert ticket',
    timestamp: '2024-01-08T21:15:00Z',
    status: 'completed',
  },
  {
    id: '9',
    userId: '1',
    type: 'send',
    amount: 120.00,
    recipient: 'Sarah Wilson',
    note: 'Electric bill split',
    timestamp: '2024-01-07T10:30:00Z',
    status: 'completed',
  },
  {
    id: '10',
    userId: '1',
    type: 'receive',
    amount: 85.00,
    sender: 'Emma Davis',
    note: 'Book club contribution',
    timestamp: '2024-01-06T16:00:00Z',
    status: 'completed',
  },
  // Additional transactions for variety
  {
    id: '11',
    userId: '1',
    type: 'send',
    amount: 40.00,
    recipient: 'Mike Johnson',
    note: 'Lunch',
    timestamp: '2024-01-05T13:20:00Z',
    status: 'completed',
  },
  {
    id: '12',
    userId: '1',
    type: 'receive',
    amount: 60.00,
    sender: 'Alex Brown',
    note: 'Gym membership',
    timestamp: '2024-01-04T08:45:00Z',
    status: 'completed',
  },
  {
    id: '13',
    userId: '1',
    type: 'send',
    amount: 90.00,
    recipient: 'Sarah Wilson',
    note: 'Gas money',
    timestamp: '2024-01-03T17:30:00Z',
    status: 'completed',
  },
  {
    id: '14',
    userId: '1',
    type: 'receive',
    amount: 35.00,
    sender: 'Emma Davis',
    note: 'Coffee run',
    timestamp: '2024-01-02T09:15:00Z',
    status: 'completed',
  },
  {
    id: '15',
    userId: '1',
    type: 'send',
    amount: 55.00,
    recipient: 'Mike Johnson',
    note: 'Netflix subscription',
    timestamp: '2024-01-01T12:00:00Z',
    status: 'completed',
  },
];

// Test credentials removed for production security

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

// Get transactions for a specific user
export const getTransactionsForUser = (userId: string): Transaction[] => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return [];
  
  const userName = `${user.firstName} ${user.lastName}`;
  
  return mockTransactions.filter(transaction => 
    transaction.sender === userName || transaction.recipient === userName
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Get recent transactions (last 10)
export const getRecentTransactions = (userId: string): Transaction[] => {
  return getTransactionsForUser(userId).slice(0, 10);
};

// Get balance for user
export const getUserBalance = (userId: string): number => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.balance : 0;
};

// Update user balance (for demo purposes)
export const updateUserBalance = (userId: string, newBalance: number): void => {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.balance = newBalance;
  }
};

// Add new transaction
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp' | 'status'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: (mockTransactions.length + 1).toString(),
    timestamp: new Date().toISOString(),
    status: 'completed',
  };
  mockTransactions.unshift(newTransaction);
  return newTransaction;
};
