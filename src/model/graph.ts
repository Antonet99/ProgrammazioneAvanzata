import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes, Transaction } from "sequelize";
import { User } from "./users";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";
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
  if (!result) {
    throw new Error();
  }
  return result;
}

export async function getAllGraph() {
  let result: any;
  result = await Graph.findAll({
    raw: true,
    attributes: [
      "id_graph",
      "nodes",
      "edges",
      "graph_cost",
      "id_creator",
      "graph",
    ],
  });
  return result;
}

export async function validateGraphId(requests_b: any, res: Response) {
  const graph_id = requests_b["graph_id"];
  if (!graph_id) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.GRAPH_NOT_FOUND);
    return null;
  }
  return graph_id;
}
