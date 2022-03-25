'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ChangeNote extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Rule, {
        foreignKey: {
          name: 'rule_id',
          allowNull: true,
        },
        onDelete: 'CASCADE',
      })
    }
  }
  ChangeNote.init(
    {
      screenshot_attachment: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      html_attachment: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      check_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      shrub_rule: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shrub: {
        type: DataTypes.TEXT,
      },
      shrub_cache: {
        type: DataTypes.STRING,
      },
      shrub_calc_cache: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_note: {
        type: DataTypes.STRING(1000),
      },
    },
    {
      sequelize,
      modelName: 'ChangeNote',
      underscored: true,
      tableName: 'change_notes',
    }
  )
  return ChangeNote
}
