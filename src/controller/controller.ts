import { User } from "../model/user";
import { Graph } from "../model/graph";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";
import { json } from "sequelize";

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

export async function createGraph(req: Request, res: Response) {
  //teoricamente anche l'id dell'user deve essere passato

  let graph = req.body;

  let nodes = Utils.nodes_count(req.body);
  let edges = Utils.edges_count(req.body);

  let total_cost = nodes * 0.1 + edges * 0.02;

  let resp = {
    nodes: nodes,
    edges: edges,
    total_cost: parseFloat(total_cost.toFixed(2)),
  };

  graph = new GraphD(req.body);

  /*   if (await checkBalance(req.body.id_user, total_cost, res)) {
    res.json(resp);
  } */

  Graph.create({
    graph: json(graph),
    nodes: nodes,
    edges: edges,
    cost: total_cost,
  })
    .then(() => {
      res.json(graph);
    })
    .catch((error) => {
      res.status(500).send("Errore nella funzione createGraph");
    });
}

// Ottieni l'ID dell'utente dal token JWT
// Recupera il saldo del token dell'utente dal database o da un servizio esterno
// Confronta il saldo con il costo del grafo
// Se il saldo è sufficiente, chiama next() per passare al middleware successivo
// Altrimenti, restituisci un errore di saldo insufficiente

export async function checkBalance(
  id_user: string,
  cost: number,
  res: any
): Promise<boolean> {
  let result: any;
  try {
    result = await User.findByPk(id_user, { raw: true });
  } catch (error) {
    res.status(500).json({ error: "Utente non trovato." });
  }
  if (result.token >= cost) return true;
  else return false;
}

/*
let str : string = 
`{
        'A': {
          'B': 1
        },
        'B': {
          'A': 1,
          'C': 2,
          'D': 4
        }
      }`;

    let j = JSON.parse(str.replace(/'/g, '"'));
*/
