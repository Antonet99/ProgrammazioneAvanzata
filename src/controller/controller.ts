import { getUserByUsername, tokenUpdate } from "../model/users";

import { Graph, insertGraph, getGraphById, getAllGraph } from "../model/graph";
import GraphBuilder from "../builders/graphBuilder";

import * as UpdateRequest from "../model/request";

import { raw, Response } from "express";
import * as Utils from "../utils/utils";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";

import * as SeqDb from "../singleton/sequelize";

const GraphD = require("node-dijkstra");

/**
 * Creates a graph based on the request body and performs necessary operations.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves when the graph is created and operations are performed successfully.
 */
export async function createGraph(req: any, res: Response) {
  const graph = req.body;

  let user = req.user;

  const nodes = Utils.nodes_count(graph);
  const edges = Utils.edges_count(graph);

  const total_cost = nodes * 0.1 + edges * 0.02;

  if (user.tokens > total_cost) {
    let builder = new GraphBuilder();
    let obj = builder
      .setGraph(graph)
      .setNodes(nodes)
      .setEdges(edges)
      .setGraphCost(total_cost)
      .setTimestamp()
      .setIdCreator(user)
      .build();

    const t = await SeqDb.SequelizeDB.getConnection().transaction();

    try {
      await insertGraph(obj, t);
      await tokenUpdate(user.tokens - total_cost, user.username, t);
      sendResponse(res, HttpStatusCode.OK, Message.GRAPH_CREATED);
      await t.commit();
    } catch (error) {
      await t.rollback();
      sendResponse(
        res,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        Message.GRAPH_CREATION_ERROR
      );
    }
  } else {
    sendResponse(
      res,
      HttpStatusCode.UNAUTHORIZED,
      Message.INSUFFICIENT_BALANCE
    );
  }
}

/**
 * Retrieves all graphs.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to the result of retrieving all graphs.
 */
export async function getAllGraphs(req: any, res: any) {
  try {
    sendResponse(res, HttpStatusCode.OK, undefined, await getAllGraph());
  } catch (error) {
    sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      Message.DEFAULT_ERROR
    );
  }
}

/**
 * Updates the weight of edges in a graph based on the provided data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the updated graph or an error response.
 */
export async function updateWeight(req: any, res: any) {
  const requests_b = req.body;
  const username = req.username;

  const user = req.user;
  const graph_id = requests_b.graph_id;

  try {
    var graph_obj: any = await getGraphById(graph_id);
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.GRAPH_NOT_FOUND);
    return;
  }

  let graph = JSON.parse(graph_obj.graph);
  let data = requests_b["data"];
  let costo_richiesta = Object.keys(data).length * 0.025;

  if (user.id_user == graph_obj.id_creator) {
    if (user.tokens < costo_richiesta) {
      sendResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Message.INSUFFICIENT_BALANCE
      );
      return;
    }

    const tr = await SeqDb.SequelizeDB.getConnection().transaction();

    try {
      for (let i in data) {
        let start = data[i].start;
        let end = data[i].end;
        let weight = data[i].weight;
        graph[start][end] = parseFloat(
          Utils.exp_avg(graph[start][end], weight).toFixed(3)
        );
      }

      await Graph.update(
        {
          graph: JSON.stringify(graph),
        },
        {
          returning: false,
          where: {
            id_graph: graph_id,
          },
          transaction: tr,
        }
      );

      await UpdateRequest.Request.create(
        {
          req_status: "accepted",
          metadata: data,
          req_cost: costo_richiesta,
          timestamp: new Date(),
          req_users: user.id_user,
          req_graph: graph_id,
        },
        {
          transaction: tr,
        }
      );

      await tokenUpdate(user.tokens - costo_richiesta, user.username, tr);
      sendResponse(res, HttpStatusCode.OK, Message.EDGE_UPDATED);
      await tr.commit();
    } catch (error) {
      await tr.rollback();
      sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      return;
    }
  } else {
    //check se ha abbastanza token e NON li sottraggo, li sottraggo quando la richiesta verrà accettata
    try {
      UpdateRequest.Request.create({
        req_status: "pending",
        metadata: data,
        req_cost: costo_richiesta,
        timestamp: new Date(),
        req_users: user.id_user,
        req_graph: graph_id,
      });
    } catch (error) {
      sendResponse(
        res,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        Message.REQUEST_CREATION_ERROR
      );
      return;
    }
    sendResponse(res, HttpStatusCode.OK, Message.PENDING_REQUEST);
  }
}

/**
 * Retrieves the pending requests for a specific graph.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the pending requests for the specified graph.
 */
export async function getGraphPendingRequests(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let result = await UpdateRequest.getPendingRequests(id_graph);
  if (result.length == 0) {
    sendResponse(res, HttpStatusCode.OK, Message.NO_PENDING_REQUEST);
    return;
  }
  sendResponse(res, HttpStatusCode.OK, undefined, result);
}

/**
 * Executes the model based on the provided request data.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves when the model execution is complete.
 */
export async function executeModel(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let start = req.body.start;
  let goal = req.body.goal;

  let user = req.user;

  try {
    //var user = await getUserByUsername(req.username);
    var graph_obj = await getGraphById(id_graph);
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.GRAPH_NOT_FOUND);
    return;
  }

  let graph = JSON.parse(graph_obj.graph);
  const route = new GraphD(graph);

  const tr = await SeqDb.SequelizeDB.getConnection().transaction();

  try {
    const startTime = performance.now();
    let execute = route.path(start, goal, { cost: true });
    const endTime = performance.now();

    let path = execute.path;
    let cost = execute.cost;

    const executionTime = endTime - startTime;

    let result = {
      Percorso: path,
      Costo: cost,
      "Tempo di esecuzione (ms)": parseFloat(executionTime.toFixed(4)),
    };

    sendResponse(res, HttpStatusCode.OK, undefined, result);

    await tokenUpdate(user.tokens - graph_obj.graph_cost, user.username, tr);
    await tr.commit();
  } catch (error: any) {
    sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      Message.MODEL_EXECUTION_ERROR
    );
    tr.rollback();
  }
}

/**
 * Accepts or denies a request based on the provided parameters.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the response object.
 */
export async function acceptDenyRequest(req: any, res: any) {
  let id_request: number[] = req.body.id_request;
  let accepted: boolean[] = req.body.accepted;

  //let user = await getUserByUsername(req.username);
  let user = req.user;
  let id_user = user.id_user;

  let list_req: any[] = [];
  let list_user: any[] = [];

  try {
    let find = await UpdateRequest.findRequestByList(
      id_request,
      list_req,
      list_user
    );

    if (!find) {
      sendResponse(res, HttpStatusCode.NOT_FOUND, Message.REQUEST_NOT_FOUND);
      return;
    }
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
    return;
  }

  let graph_req: any[] = [];
  try {
    await UpdateRequest.checkGraphRequest(graph_req, list_req);
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
    return;
  }

  for (let i in graph_req) {
    let id_creator = graph_req[i].id_creator;
    if (id_user != id_creator) {
      sendResponse(
        res,
        HttpStatusCode.UNAUTHORIZED,
        Message.REQUEST_USER_UNAUTHORIZED_GRAPH,
        { unauthorized_graph_id: graph_req[i].id_graph }
      );
      return;
    }
  }

  const tr = await SeqDb.SequelizeDB.getConnection().transaction();

  try {
    for (let i in list_req) {
      //console.log(list_req[i].metadata);
      if (!accepted[parseInt(i)]) {
        await UpdateRequest.denyRequest(list_req[i].id_request, tr);
      } else {
        await UpdateRequest.acceptRequest(
          list_user[i],
          list_req[i],
          graph_req[i],
          tr,
          res
        );
      }
    }

    await tr.commit();
  } catch (error) {
    //console.log(error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
    await tr.rollback();
    return;
  }

  sendResponse(res, HttpStatusCode.OK, Message.REQUESTS_ACCEPTED_DENIED);
}

/**
 * Recharges tokens for a user.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
export async function rechargeTokens(req: any, res: any) {
  let tokens = req.body.tokens;
  let username = req.body.username;

  try {
    var user = await getUserByUsername(username); //user a cui ricaricare
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.USER_NOT_FOUND);
    return;
  }

  const tr = await SeqDb.SequelizeDB.getConnection().transaction();

  try {
    await tokenUpdate(user.tokens + tokens, user.username, tr);
    sendResponse(res, HttpStatusCode.OK, Message.TOKENS_RECHARGED);
    await tr.commit();
  } catch (error) {
    sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      Message.RECHARGE_FAIL
    );
    await tr.rollback();
  }
}

/**
 * Handles the HTTP GET request to retrieve graph data.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A Promise that resolves to the graph data.
 */
export async function getGraphRequest(req: any, res: any) {
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;
  let reqStatus = req.body.status;

  try {
    let dateCondition = Utils.getDateCondition(startDate, endDate);
    let statusCondition = Utils.getReqStatusCondition(reqStatus);

    if (statusCondition) {
      let result = await UpdateRequest.getGraphRequests(
        req.body.id_graph,
        dateCondition,
        reqStatus
      );
      sendResponse(res, HttpStatusCode.OK, undefined, result);
    } else {
      let result = await UpdateRequest.getGraphRequests(
        req.body.id_graph,
        dateCondition
      );
      sendResponse(res, HttpStatusCode.OK, undefined, result);
    }
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Simulates a model based on the provided request parameters.
 * @param req - The request object.
 * @param res - The response object.
 */
export async function simulateModel(req: any, res: any) {
  let id_graph: number = req.body.id_graph;
  let options = req.body.options;
  let route = req.body.route;
  let edge = req.body.edge;

  try {
    var graph_obj = await getGraphById(id_graph);
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.GRAPH_NOT_FOUND);
    return;
  }

  let graph = JSON.parse(graph_obj.graph);

  let start: number = options.start;
  let stop: number = options.stop;
  let step: number = options.step;

  let list = [];

  let bg = new GraphD(graph);
  let execute = bg.path(route.start, route.goal, { cost: true });

  let best = {
    Percorso: execute.path,
    Costo: parseFloat(execute.cost.toFixed(3)),
    Peso: parseFloat(graph[edge.node1][edge.node2].toFixed(3)),
    Grafo: graph,
  };

  for (let i = start + step; i <= stop + step; i += step) {
    graph[edge.node1][edge.node2] = parseFloat(i.toFixed(3));
    let g = new GraphD(graph);
    let execute = g.path(route.start, route.goal, { cost: true });

    let result = {
      Percorso: execute.path,
      Costo: parseFloat(execute.cost.toFixed(3)),
      Peso: parseFloat(i.toFixed(3)),
    };

    list.push(result);

    if (execute.cost < best.Costo) {
      (best.Percorso = result.Percorso),
        (best.Costo = result.Costo),
        (best.Peso = result.Peso),
        (best.Grafo = graph);
    }
  }
  sendResponse(res, HttpStatusCode.OK, undefined, { best: best, list: list });
}
/* 
export async function getMyPendingRequests(req: any, res: any) {
  let user = req.user;
  try {
    let result = await UpdateRequest.getMyPendingRequests(user.id_user);
    if (result.length == 0) {
      sendResponse(res, HttpStatusCode.OK, Message.NO_PENDING_REQUEST);
      return;
    }
    sendResponse(res, HttpStatusCode.OK, undefined, result);
  } catch (error) {
    sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      Message.DEFAULT_ERROR
    );
  }
} */

export async function getMyPendingRequests(req: any, res: any) {
  const user = req.user;
  try {
    const id_graphs: any = await Graph.findAll({
      where: { id_creator: user.id_user },
      attributes: ["id_graph"],
      raw: true,
    });

    const id_graphs_array = id_graphs.map((id: any) => id.id_graph);

    const pendingRequests = await UpdateRequest.Request.findAll({
      where: { req_status: "pending", req_graph: id_graphs_array },
      raw: true,
    });

    if (pendingRequests.length === 0) {
      sendResponse(res, HttpStatusCode.OK, Message.NO_PENDING_REQUEST);
      return;
    }

    sendResponse(res, HttpStatusCode.OK, undefined, pendingRequests);
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
    return;
  }
}
