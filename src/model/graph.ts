import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes } from "sequelize";
import { User } from "./users";

const sequelize = SequelizeDB.getConnection();

export const Graph = sequelize.define(
  "graph",
  {
    id_graph: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    graph: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    nodes: {
      type: DataTypes.INTEGER,
    },
    edges: {
      type: DataTypes.INTEGER,
    },
    costo: {
      type: DataTypes.REAL,
    },
    date_time: {
      type: DataTypes.DATE,
    },
    id_creator: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id_user",
      },
    },
  },
  {
    tableName: "graph",
    timestamps: false,
    freezeTableName: true,
  }
);

export async function insertGraph(object: any, cost: number) {
  const graph = await Graph.create({
    graph: object,
    nodes: object.nodes,
    edges: object.edges,
    costo: cost,
    id_creator: object.id_user,
  });
  return graph;
}
