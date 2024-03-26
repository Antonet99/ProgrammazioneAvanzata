import { User, getUser, tokenUpdate } from "../model/users";
import { Graph, insertGraph } from "../model/graph";
import * as UpdateRequest from "../model/request";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";
import sequelize, { where } from "sequelize";

const GraphD = require("node-dijkstra");

export async function register(user: any, res: any) {
  User.create(user)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).send("Errore nella funzione register");
    });
}

export async function createGraph(req: any, res: Response) {
  const graph = req.body;
  let user = await getUser(req.username);

  const nodes = Utils.nodes_count(graph);
  const edges = Utils.edges_count(graph);

  const total_cost = nodes * 0.1 + edges * 0.02;

  if (user.tokens > total_cost) {
    let obj = {
      graph: JSON.stringify(graph),
      nodes: nodes,
      edges: edges,
      costo: parseFloat(total_cost.toFixed(2)),
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

  const graph_obj: any = await Graph.findOne({
    raw: true,
    where: {
      id_graph: graph_id,
    },
  }).catch((error) => {
    res.status(500).send("Errore nella funzione update");
  });

  //quando le valido calcolo il nuovo peso
  /*for(let i in requests){ 
    validateRequest(i).catch( () => {
      res.status(...).send("invalid ")
    });
  }*/

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
