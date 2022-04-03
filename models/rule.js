'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.ChangeNote, {
        foreignKey: {
          name: 'rule_id',
          allowNull: true,
        },
        onDelete: 'CASCADE',
        as: 'changenotes',
      })
      this.belongsTo(models.User, {
        foreignKey: {
          name: 'user_id',
          allowNull: false,
        },
        onDelete: 'CASCADE',
        as: 'owner',
      })
      this.belongsToMany(models.User, {
        through: models.UserRule,
        foreignKey: 'rule_id',
        otherKey: 'user_id',
        onDelete: 'CASCADE',
      })
    }

    // Проверка
    get needCheck() {
      if (!(this.last_check && this.frequency)) {
        console.log(`last_check или frequency не корректные для ${this.name}`)
        return false
      }

      const timeNow = Date.now()
      const timeLastCheck = new Date(this.last_check)
      const timeLeft = new Date(timeNow - timeLastCheck)

      // если прошло времени больше, чем частота, то пора проверять
      return timeLeft > new Date(this.frequency)
    }

    // Получить следующее время проверки
    get getNextCheckTime() {
      return this.last_check.getTime() + this.frequency.getTime()
    }

    // Получить таймаут до следующей проверки
    get getTimeout() {
      return this.last_check.getTime() + this.frequency.getTime() - Date.now()
    }
  }
  Rule.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      shrub_rule: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shrub_cache: {
        type: DataTypes.STRING,
      },
      frequency: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      page_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'static',
      },
      page_changed: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      last_check: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      public_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      activate_cnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      activate_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Rule',
      underscored: true,
      tableName: 'rules',
    }
  )
  return Rule
}
