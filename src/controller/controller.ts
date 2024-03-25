import { User, getUser, tokenUpdate } from "../model/users";
import { Graph, insertGraph } from "../model/graph";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";
import sequelize from "sequelize";

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
      id_creator: parseInt(user.get("id_user")),
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
  let result : any = await Graph.findAll({
    raw : true,
    attributes : ["id_graph", "nodes", "edges", "costo", "id_creator"]
    //include: [{ model: User, attributes: ["username"], required: true }],
  }).catch((error) => {
    res.status(500).send("Errore nella funzione getGraph");
  });

  res.status(200).send(result);
}
