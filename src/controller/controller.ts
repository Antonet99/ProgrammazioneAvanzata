import { getUser, getUserById, tokenUpdate } from "../model/users";
import { Graph, insertGraph, getGraphById } from "../model/graph";
import * as UpdateRequest from "../model/request";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";
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
      costo: parseFloat(total_cost.toFixed(3)),
      date_time: sequelize.literal("CURRENT_TIMESTAMP"),
      id_creator: parseInt(user.id_user),
    };

    try {
      insertGraph(obj);
      tokenUpdate(user.tokens - total_cost, user.username);
      res.status(200).send("Grafo creato con successo");
    } catch (error) {
      res.status(500).send("Errore nella creazione del grafo");
    }
  } else {
    res.status(500).send("Token insufficienti");
  }
}

export async function getGraph(req: any, res: any) {
  //let result: any;
  let result: any = await Graph.findAll({
    raw: true,
    attributes: ["id_graph", "nodes", "edges", "costo", "id_creator"],
    //include: [{ model: User, attributes: ["username"], required: true }],
  }).catch((error) => {
    res.status(500).send("Errore nella funzione getGraph");
  });

  res.status(200).send(result);
}

//aggiungere costo richiesta a tabella request

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

  if (user.id_user == graph_obj.id_creator) {
    let costo_richiesta = 0;

    //update pesi nelle richieste
    for (let i in data) {
      let start: string = data[i]["start"]; //A
      let end: string = data[i]["end"]; // B
      let new_weight = data[i]["weight"];
      let old_weight = graph[start][end]; // qui try catch in caso non esiste l'arco sul grafo

      //aggiorno sia il grafo che i dati della richiesta che poi li inserisco le db
      data[i]["weight"] = graph[start][end] = Utils.exp_avg(
        old_weight,
        new_weight
      );
      costo_richiesta += 0.025;
    }

    //check se ho i tokens e li sottraggo anche
    if (user.tokens < costo_richiesta) {
      res.status(500).send("Token insufficienti");
      return;
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
      }
    );

    await UpdateRequest.Request.create({
      req_status: "accepted",
      metadata: data,
      costo: costo_richiesta,
      date_time: sequelize.literal("CURRENT_TIMESTAMP"),
      req_users: user.id_user,
      req_graph: graph_id,
    });

    await tokenUpdate(user.tokens - costo_richiesta, user.username);
    res.status(200).send("Richiesta accettata");
  } else {
    let costo_richiesta = 0;

    for (let i in data) {
      let start: string = data[i]["start"];
      let end: string = data[i]["end"];
      let new_weight = data[i]["weight"];
      let old_weight = graph[start][end] as number; // qui try catch in caso non esiste l'arco sul grafo

      //aggiorno sia il grafo che i dati della richiesta che poi li inserisco le db
      data[i]["weight"] = Utils.exp_avg(old_weight, new_weight);
      costo_richiesta += 0.025;
    }

    //check se ha abbastanza token e NON li sottraggo, li sottraggo quando la richiesta verrà accettata

    UpdateRequest.Request.create({
      req_status: "pending",
      metadata: data,
      costo: costo_richiesta,
      date_time: sequelize.literal("CURRENT_TIMESTAMP"),
      req_users: user.id_user,
      req_graph: graph_id,
    });

    res.status(200).send("Richiesta in attesa");
  }
} //ci vuole enum per request status

export async function getPendingRequests(req: any, res: any) {
  let id_graph = req.body.id_graph;
  let result = await UpdateRequest.getRequests(id_graph);

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

    tokenUpdate(user.tokens - graph_obj.costo, user.username);
  } catch (error: any) {
    res
      .status(500)
      .send("Errore nell'esecuzione del modello: " + error.message);
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
    console.log(typeof id_creator, typeof id_user);
    if (id_user != id_creator) {
      res.status(500).send("Non sei il creatore del grafo");
      return;
    }
  }

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
        }
      );
    }
  }

  for (let i in list_req) {
    if (accepted[parseInt(i)]) {
      if (list_user[i].tokens >= list_req[i].costo) {
        await tokenUpdate(
          list_user[i].tokens - list_req[i].costo,
          list_user[i].username
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
        let start = list_req[i].metadata[i].start;
        let end = list_req[i].metadata[i].end;
        let weight = list_req[i].metadata[i].weight;
        let graph = JSON.parse(graph_req[i].graph);
        console.log(
          list_req[i].metadata[i],
          typeof list_req[i].metadata[i],
          typeof list_req[i].metadata
        );
        graph[start][end] = weight; //qui try catch in caso non esiste l'arco sul grafo

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

  try {
    await tokenUpdate(user.tokens + amount, user.username);
    res.status(200).send("Ricarica dei token effettuata");
  } catch (error) {
    res.status(500).send("Errore nella ricarica dei token");
  }
}
