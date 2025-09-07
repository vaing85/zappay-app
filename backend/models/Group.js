const { DataTypes } = require('sequelize');

const Group = (sequelize) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'groups',
    timestamps: true
  });

  Group.associate = (models) => {
    Group.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
    Group.belongsToMany(models.User, { through: 'GroupMembers', as: 'members' });
  };

  return Group;
};

module.exports = Group;
