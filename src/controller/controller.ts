import { User } from "../model/user";
import { Graph } from "../model/graph";
import { Request, Response } from "express";
import * as Utils from "../utils/utils";
import { json } from "sequelize";
import { JSONB } from "sequelize";
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

/*

new Graph non funziona con json, ma funziona con un oggetto
Quindi il payload passato tramite chiamata POST
deve essere convertito in un oggetto con JSON.parse() prima di 
essere passato a new Graph();

INPUT:

const Graph = require("node-dijkstra");

payload = {
  A: { B: 1 },
  B: { A: 1, C: 2, D: 4, F: 7, ET: 32 },
  C: { A: 1, D: 3 },
};

let json = JSON.stringify(payload);
let obj = JSON.parse(json);

const route = new Graph(obj);

OUTPUT:

tipo di payload: object
tipo di json: string
tipo di obj: object
tipo di route: object

output di route:

Graph {
  graph: Map(3) {
    'A' => Map(1) { 'B' => 1 },
    'B' => Map(5) { 'A' => 1, 'C' => 2, 'D' => 4, 'F' => 7, 'ET' => 32 },
    'C' => Map(2) { 'A' => 1, 'D' => 3 }
  }
}

*/

export async function createGraph(req: Request, res: Response) {
  //teoricamente anche l'id dell'user deve essere passato

  let graph = req.body;

  let nodes = Utils.nodes_count(graph);
  let edges = Utils.edges_count(graph);

  let total_cost = nodes * 0.1 + edges * 0.02;

  let resp = {
    nodes: nodes,
    edges: edges,
    total_cost: parseFloat(total_cost.toFixed(2)),
  };

  let graph_l = new GraphD(graph);

  //console.log(graph_l);
  /*   if (await checkBalance(req.body.id_user, total_cost, res)) {
    res.json(resp);
  } */

  //let date = new Date().toLocaleDateString();
  //let date = sequelize.literal("CURRENT_TIMESTAMP");
  let date = new Date().

  const new_G = await Graph.create({
    graph: JSON.stringify(graph),
    nodes: nodes,
    edges: edges,
    cost: total_cost,
    data_time : ,
    id_creator : 1
  })
    .then(() => {
      res.json(graph);
    })
    .catch((error) => {
      //console.log(error);
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
