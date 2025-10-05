const { ObjectId } = require('mongodb');

class User {
  constructor(collection) {
    this.collection = collection;
  }

  // Create a new user
  async create(userData) {
    try {
      const user = {
        _id: new ObjectId(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: false,
        balance: 0,
        preferences: {
          notifications: true,
          twoFactor: false,
          theme: 'light'
        },
        security: {
          loginAttempts: 0,
          lastLogin: null,
          passwordChangedAt: new Date()
        }
      };

      const result = await this.collection.insertOne(user);
      return { success: true, user: { ...user, id: user._id.toString() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      const user = await this.collection.findOne({ email: email.toLowerCase() });
      if (user) {
        return { success: true, user: { ...user, id: user._id.toString() } };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      const user = await this.collection.findOne({ _id: new ObjectId(id) });
      if (user) {
        return { success: true, user: { ...user, id: user._id.toString() } };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user
  async update(id, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user balance
  async updateBalance(id, amount) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { balance: amount },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verify email
  async verifyEmail(id) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            emailVerified: true,
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update last login
  async updateLastLogin(id) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            'security.lastLogin': new Date(),
            updatedAt: new Date()
          } 
        }
      );

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete user
  async delete(id) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all users (with pagination)
  async findAll(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await this.collection
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await this.collection.countDocuments({});

      return {
        success: true,
        users: users.map(user => ({ ...user, id: user._id.toString() })),
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
}

module.exports = User;
