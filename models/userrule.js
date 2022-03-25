'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class UserRule extends Model {
    static associate(models) {
      this.belongsTo(models.Privilege, {
        foreignKey: {
          name: 'privilege_id',
          allowNull: false,
        },
        as: 'privilege',
      })
      this.belongsTo(models.User, {
        foreignKey: {
          name: 'user_id',
          allowNull: false,
        },
        as: 'user',
      })
      this.belongsTo(models.Rule, {
        foreignKey: {
          name: 'rule_id',
          allowNull: false,
        },
        as: 'rule',
      })
    }
  }
  UserRule.init(
    {
      rule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'UserRule',
      underscored: true,
      tableName: 'user_rules',
    }
  )
  return UserRule
}
