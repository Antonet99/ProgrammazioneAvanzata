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
      type: DataTypes.ENUM,
      values: ["pending", "accepted", "denied"],
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    req_cost: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
    },
    req_users: {
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

//get request

export async function getPendingRequests(id_graph: number) {
  let result: any;
  result = await Request.findAll({
    raw: true,
    where: { req_graph: id_graph, req_status: "pending" },
    attributes: {
      exclude: ["req_graph"],
    },
  });
  return result;
}

export async function getGraphRequests(
  id_graph: number,
  dateCondition: any,
  req_status?: string
) {
  let result: any;

  if (Object.keys(dateCondition).length === 0 && !req_status) {
    result = await Request.findAll({
      raw: true,
      where: { req_graph: id_graph },
      attributes: {
        exclude: ["req_graph"],
      },
    });
  } else if (Object.keys(dateCondition).length === 0 && req_status) {
    result = await Request.findAll({
      raw: true,
      where: { req_graph: id_graph, req_status: req_status },
      attributes: {
        exclude: ["req_graph"],
      },
    });
  } else if (Object.keys(dateCondition).length !== 0 && req_status) {
    result = await Request.findAll({
      raw: true,
      where: {
        req_graph: id_graph,
        timestamp: dateCondition.timestamp,
        req_status: req_status,
      },
      attributes: {
        exclude: ["req_graph"],
      },
    });
  } else if (Object.keys(dateCondition).length !== 0 && !req_status) {
    result = await Request.findAll({
      raw: true,
      where: { req_graph: id_graph, timestamp: dateCondition.timestamp },
      attributes: {
        exclude: ["req_graph"],
      },
    });
  }
  return result;
}

export async function createPendingRequest() {
  let request = await Request.create({
    req_status: "pending",
    metadata: {},
    req_cost: 0,
    timestamp: new Date(),
    req_users: 0,
    req_graph: 0,
  });
  return request;
}
