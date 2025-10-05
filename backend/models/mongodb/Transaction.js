const { ObjectId } = require('mongodb');

class Transaction {
  constructor(collection) {
    this.collection = collection;
  }

  // Create a new transaction
  async create(transactionData) {
    try {
      const transaction = {
        _id: new ObjectId(),
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const result = await this.collection.insertOne(transaction);
      return { success: true, transaction: { ...transaction, id: transaction._id.toString() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Find transaction by ID
  async findById(id) {
    try {
      const transaction = await this.collection.findOne({ _id: new ObjectId(id) });
      if (transaction) {
        return { success: true, transaction: { ...transaction, id: transaction._id.toString() } };
      }
      return { success: false, error: 'Transaction not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Find transactions by user ID
  async findByUserId(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const transactions = await this.collection
        .find({ 
          $or: [
            { fromUserId: new ObjectId(userId) },
            { toUserId: new ObjectId(userId) }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await this.collection.countDocuments({
        $or: [
          { fromUserId: new ObjectId(userId) },
          { toUserId: new ObjectId(userId) }
        ]
      });

      return {
        success: true,
        transactions: transactions.map(tx => ({ ...tx, id: tx._id.toString() })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update transaction status
  async updateStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
        ...additionalData
      };

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Transaction not found' };
      }

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get transaction statistics
  async getStats(userId, period = '30d') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const pipeline = [
        {
          $match: {
            $or: [
              { fromUserId: new ObjectId(userId) },
              { toUserId: new ObjectId(userId) }
            ],
            createdAt: { $gte: startDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            sentAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$fromUserId', new ObjectId(userId)] },
                  '$amount',
                  0
                ]
              }
            },
            receivedAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$toUserId', new ObjectId(userId)] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ];

      const stats = await this.collection.aggregate(pipeline).toArray();
      
      return {
        success: true,
        stats: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          averageAmount: 0,
          sentAmount: 0,
          receivedAmount: 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get recent transactions
  async getRecent(userId, limit = 10) {
    try {
      const transactions = await this.collection
        .find({
          $or: [
            { fromUserId: new ObjectId(userId) },
            { toUserId: new ObjectId(userId) }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return {
        success: true,
        transactions: transactions.map(tx => ({ ...tx, id: tx._id.toString() }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete transaction
  async delete(id) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return { success: false, error: 'Transaction not found' };
      }

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = Transaction;
