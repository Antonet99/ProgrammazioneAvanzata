import { User, getUser } from "../model/users";
import { insertGraph } from "../model/graph";
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
  //teoricamente anche l'id dell'user deve essere passato

  const graph = req.body;
  //console.log(req.username);

  const nodes = Utils.nodes_count(graph);
  const edges = Utils.edges_count(graph);

  const total_cost = nodes * 0.1 + edges * 0.02;

  let user: any;
  user = await getUser(req.username);

  if (user.tokens > total_cost) {
    let obj = {
      graph: JSON.stringify(graph),
      nodes: nodes,
      edges: edges,
      cost: total_cost,
      id_user: user.id_user,
    };

    try {
      insertGraph(obj);
    } catch (error) {
      res.status(500).send("Errore nella creazione del grafo");
    }
  } else {
    res.status(500).send("Token insufficienti");
  }
}

// Ottieni l'ID dell'utente dal token JWT
// Recupera il saldo del token dell'utente dal database o da un servizio esterno
// Confronta il saldo con il costo del grafo
// Se il saldo è sufficiente, chiama next() per passare al middleware successivo
// Altrimenti, restituisci un errore di saldo insufficiente
