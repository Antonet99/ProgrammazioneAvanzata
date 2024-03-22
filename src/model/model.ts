import { SequelizeDB } from "./sequelize";
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = SequelizeDB.getConnection();

export const Model = sequelize.define('model', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    graph: {
      type: DataTypes.JSONB,
      allowNull: false,
    }
  },
  {
    timestamps: false,
    modelName: 'model',
    freezeTableName: true,
});