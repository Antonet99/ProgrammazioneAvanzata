import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes, Transaction } from "sequelize";
import { User } from "./users";
//import sequelize from "sequelize";

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
      type: DataTypes.JSONB,
      allowNull: false,
    },
    nodes: {
      type: DataTypes.INTEGER,
    },
    edges: {
      type: DataTypes.INTEGER,
    },
    graph_cost: {
      type: DataTypes.REAL,
    },
    timestamp: {
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

export async function insertGraph(graph: any, tr: Transaction) {
  // , tr : sequelize.Transaction
  await Graph.create(graph, { transaction: tr }).catch((error) => {
    error;
  });
}

export async function getGraphById(id_graph: number) {
  let result: any;
  result = await Graph.findOne({
    raw: true,
    where: { id_graph: id_graph },
  });
  return result;
}

export async function getAllGraph() {
  let result: any;
  result = await Graph.findAll({
    raw: true,
    attributes: ["id_graph", "nodes", "edges", "graph_cost", "id_creator"],
  });
  return result;
}
