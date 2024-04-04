import {
  getUserByUsername,
  getUserById,
  tokenUpdate,
  validateUser,
} from "../model/users";

import { Graph, insertGraph, getGraphById, getAllGraph } from "../model/graph";
import GraphBuilder from "../builders/graphBuilder";

import * as UpdateRequest from "../model/request";

import { Response } from "express";
import * as Utils from "../utils/utils";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";

import * as SeqDb from "../singleton/sequelize";

const GraphD = require("node-dijkstra");

export async function createGraph(req: any, res: Response) {
  const graph = req.body;
  let user = await getUserByUsername(req.username);

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

export async function updateWeight(req: any, res: any) {
  const requests_b = req.body;
  const username = req.username;

  const user = await validateUser(username, res);
  if (!user) return;

  /*   const graph_id = await validateGraphId(requests_b, res);
  if (!graph_id) return; */
  const graph_id = requests_b.graph_id;

  try {
    var graph_obj: any = await getGraphById(graph_id);
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.USER_GRAPH_NOT_FOUND);
    return;
  }

  let graph = JSON.parse(graph_obj.graph);
  let data = requests_b["data"];
  let costo_richiesta = Object.keys(data).length * 0.025;

  if (user.id_user == graph_obj.id_creator) {
    //check se ho i tokens e li sottraggo anche
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
        graph[start][end] = Utils.exp_avg(graph[start][end], weight);
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

export async function getGraphPendingRequests(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let result = await UpdateRequest.getPendingRequests(id_graph);
  if (result.length == 0) {
    sendResponse(res, HttpStatusCode.OK, Message.NO_PENDING_REQUEST);
    return;
  }
  sendResponse(res, HttpStatusCode.OK, undefined, result);
}

export async function executeModel(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let start = req.body.start;
  let goal = req.body.goal;

  try {
    var user = await getUserByUsername(req.username);
    var graph_obj = await getGraphById(id_graph);
  } catch (error) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.USER_GRAPH_NOT_FOUND);
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
    //res.status(200).send(result);

    await tokenUpdate(user.tokens - graph_obj.costo, user.username, tr);
    await tr.commit();
  } catch (error: any) {
    sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      Message.MODEL_EXECUTION_ERROR
    );
    //res.status(500).send("Errore nell'esecuzione del modello: " + error.message);
    tr.rollback();
  }
}

/*   const listaValori = [valore1, valore2, valore3]; // Aggiungi qui i tuoi valori
  // Eseguire la query
  const risultati = await Model.findAll({
    where: {
      tuoCampo: {
        [Op.in]: listaValori
      }
    }
  }); */

export async function acceptDenyRequest(req: any, res: any) {
  let id_request: number[] = req.body.id_request;
  let accepted: boolean[] = req.body.accepted;

  let user = await getUserByUsername(req.username);
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
    console.log(error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
    await tr.rollback();
    return;
  }

  sendResponse(res, HttpStatusCode.OK, Message.REQUESTS_ACCEPTED_DENIED);
}

export async function rechargeTokens(req: any, res: any) {
  let tokens = req.body.tokens;

  try {
    var user = await getUserByUsername(req.body.username); //user a cui ricaricare
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
