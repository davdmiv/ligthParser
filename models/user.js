'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.Rule, {
        foreignKey: {
          name: 'user_id',
          allowNull: false,
        },
        onDelete: 'CASCADE',
      })
      this.belongsToMany(models.Role, {
        through: 'user_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
        onDelete: 'CASCADE',
      })
      this.belongsToMany(models.Rule, {
        through: models.UserRule,
        foreignKey: 'user_id',
        otherKey: 'rule_id',
        onDelete: 'CASCADE',
      })
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nikname: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'noname',
      },
      dynamic_rules_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      static_rules_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      dynamic_rules_owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      static_rules_owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'User',
      underscored: true,
      tableName: 'users',
    }
  )
  return User
}
