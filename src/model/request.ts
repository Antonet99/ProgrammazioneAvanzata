import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes } from "sequelize";
import { Graph } from "./graph";
import { User } from "./users";

const sequelize = SequelizeDB.getConnection();

export const Request = sequelize.define(
  "request",
  {
    id_request: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    req_status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    date_time: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("NOW"),
    },
    req_user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id_user",
      },
    },
    req_graph: {
      type: DataTypes.INTEGER,
      references: {
        model: Graph,
        key: "id_graph",
      },
    },
  },
  {
    tableName: "request",
    timestamps: false,
    freezeTableName: true,
  }
);
