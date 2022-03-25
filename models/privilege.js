'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Privilege extends Model {
    static associate(models) {
      this.hasMany(models.UserRule, {
        foreignKey: {
          name: 'privilege_id',
          allowNull: false,
        },
      })
    }
  }
  Privilege.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Privilege',
      underscored: true,
      tableName: 'privilege',
    }
  )
  return Privilege
}
