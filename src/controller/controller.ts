import { getUser, getUserById, tokenUpdate } from "../model/users";
import { Graph, insertGraph, getGraphById, getGraph } from "../model/graph";
import * as UpdateRequest from "../model/request";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";

import * as SeqDb from "../singleton/sequelize";

import sequelize from "sequelize";

const GraphD = require("node-dijkstra");

export async function createGraph(req: any, res: Response) {
  const graph = req.body;
  let user = await getUser(req.username);

  const nodes = Utils.nodes_count(graph);
  const edges = Utils.edges_count(graph);

  const total_cost = nodes * 0.1 + edges * 0.02;

  //si può utilizzare builder per creare il grafo
  if (user.tokens > total_cost) {
    let obj = {
      graph: JSON.stringify(graph),
      nodes: nodes,
      edges: edges,
      graph_cost: parseFloat(total_cost.toFixed(3)),
      timestamp: new Date(),
      id_creator: parseInt(user.id_user),
    };
    
    //lo passo ad entrambe le funzioni
    const t = await SeqDb.SequelizeDB.getConnection().transaction();

    try {
      insertGraph(obj,t); 
      tokenUpdate(user.tokens - total_cost, user.username, t);
      res.status(200).send("Grafo creato con successo");
      await t.commit();
    } catch (error) {
      await t.rollback();
      res.status(500).send("Errore nella creazione del grafo");
    }
  } else {
    res.status(500).send("Token insufficienti");
  }
}

export async function getGraphs(req: any, res: any) {
  try {
    let result = await getGraph();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Errore nella funzione");
  }
}

//nel body id grafo, "graph_id":3, "data" : [{"start":"A","end":"B", "weight":3}, {...}]
export async function updateWeight(req: any, res: Response) {
  const requests_b = req.body;

  const username = req.username;
  try {
    var user = await getUser(username);
    if (!user) {
      throw new Error("Username non trovato");
    }
  } catch (error: any) {
    res.status(500).send(error.message);
    return;
  }

  try {
    var graph_id = requests_b["graph_id"];
    if (!graph_id) {
      throw new Error("Graph id non trovato");
    }
  } catch (error: any) {
    res.status(500).send(error.message);
    return;
  }

  const graph_obj: any = await getGraphById(graph_id).catch((error) => {
    res.status(500).send("Errore nella funzione update");
  });

  const graph = JSON.parse(graph_obj.graph);

  let data = requests_b["data"];

  let costo_richiesta = Object.keys(data).length * 0.025;

  if (user.id_user == graph_obj.id_creator) {

    //check se ho i tokens e li sottraggo anche
    if (user.tokens < costo_richiesta) {
      res.status(500).send("Token insufficienti");
      return;
    }

    const tr = await SeqDb.SequelizeDB.getConnection().transaction();

    try{
      await Graph.update(
        {
          graph: JSON.stringify(graph),
        },
        {
          returning: false,
          where: {
            id_graph: graph_id,
          },
          transaction : tr
        }
      );

      await UpdateRequest.Request.create({
        req_status: "accepted",
        metadata: data,
        req_cost: costo_richiesta,
        timestamp: new Date(),
        req_users: user.id_user,
        req_graph: graph_id,
      },{
        transaction : tr
      });

      await tokenUpdate(user.tokens - costo_richiesta, user.username, tr);
      res.status(200).send("Richiesta accettata");
      await tr.commit();
    }catch(error){
      await tr.rollback();
      res.status(500).send("errore creazione richiesta");
      return;
    }
  } else {
    
    //check se ha abbastanza token e NON li sottraggo, li sottraggo quando la richiesta verrà accettata
    try{
      UpdateRequest.Request.create({
        req_status: "pending",
        metadata: data,
        req_cost: costo_richiesta,
        timestamp: new Date(),
        req_users: user.id_user,
        req_graph: graph_id,
      });
    }
    catch(error){
      res.status(500).send("errore creazione richiesta");
      return;
    }
    res.status(200).send("Richiesta in attesa");
  }
} //ci vuole enum per request status

export async function getPendingRequests(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let result = await UpdateRequest.getPendingRequests(id_graph);

  res.status(200).send(result);
}

export async function executeModel(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let start = req.body.start;
  let goal = req.body.goal;

  let user = await getUser(req.username);

  let graph_obj = await getGraphById(id_graph);
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
      "Tempo di esecuzione": parseFloat(executionTime.toFixed(4)),
    };

    res.status(200).send(result);

    tokenUpdate(user.tokens - graph_obj.costo, user.username, tr);
    await tr.commit();
  } catch (error: any) {
    res
      .status(500)
      .send("Errore nell'esecuzione del modello: " + error.message);
      tr.rollback();
  }
}

export async function acceptRequest(req: any, res: any) {
  let id_request: number[] = req.body.id_request;
  let accepted: boolean[] = req.body.accepted;

  if (id_request.length != accepted.length) {
    res.status(500).send("Errore nei parametri");
    return;
  }

  let user = await getUser(req.username);
  let id_user = user.id_user;

  let list_req: any[] = [];
  let list_user: any[] = [];

  for (let i in id_request) {
    await UpdateRequest.Request.findOne({
      raw: true,
      where: {
        id_request: id_request[i],
        req_status: "pending",
      },
    }).then(async (result: any) => {
      list_req.push(result);
      list_user.push(await getUserById(result.req_users));
    });
  }

  let graph_req: any[] = [];
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

  for (let i in graph_req) {
    let id_creator = graph_req[i].id_creator;
    //console.log(typeof id_creator, typeof id_user);
    if (id_user != id_creator) {
      res.status(500).send("Non sei il creatore del grafo");
      return;
    }
  }

  const tr = await  SeqDb.SequelizeDB.getConnection().transaction();

  for (let i in list_req) {
    if (!accepted[parseInt(i)]) {
      await UpdateRequest.Request.update(
        {
          req_status: "denied",
        },
        {
          returning: false,
          where: {
            id_request: id_request[parseInt(i)],
          },
          transaction : tr
        }
      );
    }
  }

  for (let i in list_req) {
    console.log(list_user[i].tokens, list_req[i].req_cost);
    if (accepted[parseInt(i)]) {
      if (list_user[i].tokens >= list_req[i].req_cost) {
        await tokenUpdate(
          list_user[i].tokens - list_req[i].req_cost,
          list_user[i].username,
          tr
        );

        await UpdateRequest.Request.update(
          {
            req_status: "accepted",
          },
          {
            returning: false,
            where: {
              id_request: list_req[i].id_request,
            },
          }
        );

        //il problema è l'indice di metadata, viene accettata solo la prima
        for (let j in list_req[i].metadata) {
          let start = list_req[i].metadata[j].start;
          let end = list_req[i].metadata[j].end;
          let weight = list_req[i].metadata[j].weight;
          var graph = JSON.parse(graph_req[i].graph);
          console.log(
            list_req[i].metadata[j],
            typeof list_req[i].metadata[j],
            typeof list_req[i].metadata
          );
          graph[start][end] = Utils.exp_avg(graph[start][end], weight);
        }
        //qui try catch in caso non esiste l'arco sul grafo

        await Graph.update(
          {
            graph: JSON.stringify(graph),
          },
          {
            returning: false,
            where: {
              id_graph: list_req[i].req_graph,
            },
          }
        );
      } else {
        res
          .status(500)
          .send(`L'utente ${list_user[i].username} ha token insufficienti`);
        return;
      }
    }
  }
  res.status(200).send("Richieste accettate/rifiutate");
}

export async function rechargeTokens(req: any, res: any) {
  let admin = await getUser(req.username); //user admin che ricarica
  let user = await getUser(req.body.username); //user a cui ricaricare
  let amount = req.body.amount;

  if (!admin || admin.role != "admin") {
    res.status(500).send("Utente admin non trovato");
    return;
  } else if (!user) {
    res.status(500).send("Utente non trovato");
    return;
  }

  if (amount <= 0) {
    res.status(500).send("Importo negativo/pari a zero non valido");
    return;
  }

  const tr = await SeqDb.SequelizeDB.getConnection().transaction();

  try {
    await tokenUpdate(user.tokens + amount, user.username, tr);
    res.status(200).send("Ricarica dei token effettuata");
    await tr.commit();
  } catch (error) {
    res.status(500).send("Errore nella ricarica dei token");
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
      res.status(200).send(result);
    } else {
      let result = await UpdateRequest.getGraphRequests(
        req.body.id_graph,
        dateCondition
      );
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send("Errore nella funzione");
  }
}

export async function simulateModel(req: any, res: any) {
  let id_graph: number = req.body.id_graph;
  let options = req.body.options;
  let route = req.body.route;
  let edge = req.body.edge;

  let graph_obj = await getGraphById(id_graph);
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
    graph[edge.node1][edge.node2] = i;
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
  res.status(200).json({ best: best, list: list });
}
