import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes, Transaction } from "sequelize";
import { Graph } from "./graph";
import { User, getUserById, tokenUpdate } from "./users";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";
import { exp_avg } from "../utils/utils";

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

export async function findRequestByList(
  id_request: number[],
  list_req: any[],
  list_user: any[]
): Promise<boolean> {
  for (let i of id_request) {
    let result: any = await Request.findOne({
      raw: true,
      where: {
        id_request: i,
        req_status: "pending",
      },
    });
    if (result == null) {
      return false;
    }
    list_req.push(result);
    list_user.push(await getUserById(result.req_users));
  }
  return true;
}

export async function checkGraphRequest(graph_req: any[], list_req: any[]) {
  for (let i in list_req) {
    await Graph.findOne({
      raw: true,
      where: {
        id_graph: list_req[i].req_graph,
      },
    }).then((result) => {
      graph_req.push(result);
    });
  }
}

export async function denyRequest(id_request: number, tr: Transaction) {
  //console.log(id_request);
  await Request.update(
    {
      req_status: "denied",
    },
    {
      returning: false,
      where: {
        id_request: id_request,
      },
      transaction: tr,
    }
  );
}

export async function acceptRequest(
  user: any,
  request: any,
  graph_req: any,
  tr: Transaction,
  res: any
) {
  if (user.tokens >= request.req_cost) {
    await tokenUpdate(user.tokens - request.req_cost, user.username, tr);
    await Request.update(
      {
        req_status: "accepted",
      },
      {
        returning: false,
        where: {
          id_request: request.id_request,
        },
        transaction: tr,
      }
    );
    let graph = JSON.parse(graph_req.graph);
    for (let j in request.metadata) {
      let start = request.metadata[j].start;
      let end = request.metadata[j].end;
      let weight = request.metadata[j].weight;

      console.log(start, end, weight, graph[start][end]);

      graph[start][end] = exp_avg(graph[start][end], weight);
    }
    await Graph.update(
      {
        graph: JSON.stringify(graph),
      },
      {
        returning: false,
        where: {
          id_graph: request.req_graph,
        },
        transaction: tr,
      }
    );
  } else {
    sendResponse(
      res,
      HttpStatusCode.UNAUTHORIZED,
      Message.INSUFFICIENT_BALANCE,
      { username: user.username }
    );
    return;
  }
}
