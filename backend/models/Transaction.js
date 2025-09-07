const { DataTypes } = require('sequelize');

const Transaction = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('send', 'receive', 'request'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'transactions',
    timestamps: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { as: 'fromUser', foreignKey: 'fromUserId' });
    Transaction.belongsTo(models.User, { as: 'toUser', foreignKey: 'toUserId' });
  };

  return Transaction;
};

module.exports = Transaction;
