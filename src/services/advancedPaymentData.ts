import { SplitBill, PaymentRequest, PaymentGroup } from '../types/Payment';

// Mock split bills data
export const mockSplitBills: SplitBill[] = [
  {
    id: 'sb1',
    title: 'Dinner at Restaurant',
    description: 'Group dinner at the new Italian place',
    totalAmount: 120.00,
    createdBy: '1',
    createdByName: 'John Doe',
    participants: [
      { userId: '1', userName: 'John Doe', userEmail: 'john@zapcash.com', amount: 30.00, status: 'paid', paidAt: '2024-01-15T19:30:00Z' },
      { userId: '2', userName: 'Sarah Wilson', userEmail: 'sarah@zapcash.com', amount: 30.00, status: 'paid', paidAt: '2024-01-15T19:35:00Z' },
      { userId: '3', userName: 'Mike Johnson', userEmail: 'mike@zapcash.com', amount: 30.00, status: 'paid', paidAt: '2024-01-15T19:40:00Z' },
      { userId: '4', userName: 'Emma Davis', userEmail: 'emma@zapcash.com', amount: 30.00, status: 'pending' }
    ],
    category: 'food',
    status: 'active',
    createdAt: '2024-01-15T18:00:00Z',
    dueDate: '2024-01-20T23:59:59Z'
  },
  {
    id: 'sb2',
    title: 'Uber Ride to Airport',
    description: 'Shared ride to the airport for our trip',
    totalAmount: 45.00,
    createdBy: '2',
    createdByName: 'Sarah Wilson',
    participants: [
      { userId: '2', userName: 'Sarah Wilson', userEmail: 'sarah@zapcash.com', amount: 15.00, status: 'paid', paidAt: '2024-01-14T08:00:00Z' },
      { userId: '1', userName: 'John Doe', userEmail: 'john@zapcash.com', amount: 15.00, status: 'paid', paidAt: '2024-01-14T08:05:00Z' },
      { userId: '4', userName: 'Emma Davis', userEmail: 'emma@zapcash.com', amount: 15.00, status: 'pending' }
    ],
    category: 'transport',
    status: 'active',
    createdAt: '2024-01-14T07:30:00Z',
    dueDate: '2024-01-16T23:59:59Z'
  },
  {
    id: 'sb3',
    title: 'Movie Tickets',
    description: 'Avengers movie night',
    totalAmount: 60.00,
    createdBy: '3',
    createdByName: 'Mike Johnson',
    participants: [
      { userId: '3', userName: 'Mike Johnson', userEmail: 'mike@zapcash.com', amount: 20.00, status: 'paid', paidAt: '2024-01-13T20:00:00Z' },
      { userId: '1', userName: 'John Doe', userEmail: 'john@zapcash.com', amount: 20.00, status: 'paid', paidAt: '2024-01-13T20:05:00Z' },
      { userId: '2', userName: 'Sarah Wilson', userEmail: 'sarah@zapcash.com', amount: 20.00, status: 'paid', paidAt: '2024-01-13T20:10:00Z' }
    ],
    category: 'entertainment',
    status: 'completed',
    createdAt: '2024-01-13T19:00:00Z',
    dueDate: '2024-01-13T21:00:00Z'
  }
];

// Mock payment requests data
export const mockPaymentRequests: PaymentRequest[] = [
  {
    id: 'pr1',
    title: 'Coffee Money',
    description: 'For the coffee I bought you this morning',
    amount: 5.50,
    requestedBy: '2',
    requestedByName: 'Sarah Wilson',
    requestedFrom: '1',
    requestedFromName: 'John Doe',
    status: 'pending',
    category: 'food',
    createdAt: '2024-01-15T09:00:00Z',
    dueDate: '2024-01-17T23:59:59Z',
    expiresAt: '2024-01-22T23:59:59Z',
    note: 'Thanks for covering me!'
  },
  {
    id: 'pr2',
    title: 'Book Club Fee',
    description: 'Monthly book club membership fee',
    amount: 25.00,
    requestedBy: '4',
    requestedByName: 'Emma Davis',
    requestedFrom: '1',
    requestedFromName: 'John Doe',
    status: 'accepted',
    category: 'entertainment',
    createdAt: '2024-01-10T14:00:00Z',
    dueDate: '2024-01-15T23:59:59Z',
    note: 'This month we\'re reading "The Great Gatsby"'
  },
  {
    id: 'pr3',
    title: 'Gym Membership Split',
    description: 'Shared gym membership for the month',
    amount: 40.00,
    requestedBy: '3',
    requestedByName: 'Mike Johnson',
    requestedFrom: '2',
    requestedFromName: 'Sarah Wilson',
    status: 'declined',
    category: 'utilities',
    createdAt: '2024-01-08T10:00:00Z',
    dueDate: '2024-01-12T23:59:59Z',
    note: 'Let me know if you change your mind!'
  }
];

// Mock payment groups data
export const mockPaymentGroups: PaymentGroup[] = [
  {
    id: 'pg1',
    name: 'Roommates',
    description: 'Shared expenses for our apartment',
    createdBy: '1',
    members: [
      { userId: '1', userName: 'John Doe', userEmail: 'john@zapcash.com', role: 'admin', joinedAt: '2024-01-01T00:00:00Z' },
      { userId: '2', userName: 'Sarah Wilson', userEmail: 'sarah@zapcash.com', role: 'member', joinedAt: '2024-01-01T00:00:00Z' },
      { userId: '3', userName: 'Mike Johnson', userEmail: 'mike@zapcash.com', role: 'member', joinedAt: '2024-01-01T00:00:00Z' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'pg2',
    name: 'Work Lunch Crew',
    description: 'Lunch expenses with colleagues',
    createdBy: '2',
    members: [
      { userId: '2', userName: 'Sarah Wilson', userEmail: 'sarah@zapcash.com', role: 'admin', joinedAt: '2024-01-05T00:00:00Z' },
      { userId: '4', userName: 'Emma Davis', userEmail: 'emma@zapcash.com', role: 'member', joinedAt: '2024-01-05T00:00:00Z' },
      { userId: '5', userName: 'Alex Brown', userEmail: 'alex@zapcash.com', role: 'member', joinedAt: '2024-01-05T00:00:00Z' }
    ],
    createdAt: '2024-01-05T00:00:00Z',
    isActive: true
  }
];

// Helper functions
export const getSplitBillsForUser = (userId: string): SplitBill[] => {
  return mockSplitBills.filter(bill => 
    bill.createdBy === userId || 
    bill.participants.some(p => p.userId === userId)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPaymentRequestsForUser = (userId: string): PaymentRequest[] => {
  return mockPaymentRequests.filter(request => 
    request.requestedBy === userId || 
    request.requestedFrom === userId
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPaymentGroupsForUser = (userId: string): PaymentGroup[] => {
  return mockPaymentGroups.filter(group => 
    group.members.some(member => member.userId === userId)
  );
};

export const getPendingRequestsForUser = (userId: string): PaymentRequest[] => {
  return mockPaymentRequests.filter(request => 
    request.requestedFrom === userId && request.status === 'pending'
  );
};

export const getPendingSplitBillsForUser = (userId: string): SplitBill[] => {
  return mockSplitBills.filter(bill => 
    bill.participants.some(p => p.userId === userId && p.status === 'pending')
  );
};
