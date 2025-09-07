const { DataTypes } = require('sequelize');

const Budget = (sequelize) => {
  const Budget = sequelize.define('Budget', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'budgets',
    timestamps: true
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Budget;
};

module.exports = Budget;
