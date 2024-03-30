import { Request, Response, NextFunction } from "express";
import * as Controller from "../controller/controller";
require("dotenv").config();

/*
1. Autenticazione con JWT
2. if AUTH = true, next()
2.1 Validazione grafo: validazione grafo nel body della richiesta secondo la struttura prevista
e conteggio nodi e archi per calcolo costo
2.2 checkUserBalance: verifica del saldo del token dell'utente
if User.token >= costo, validate richiesta
*/

// 2.1 Validazione grafo
// Verifica la presenza del grafo nel body della richiesta
// Valida la struttura del grafo secondo le specifiche previste
// Conta il numero di nodi e archi per calcolare il costo
// Salva le informazioni del grafo e il costo nell'oggetto req per utilizzarli successivamente
// Chiama next() per passare al middleware successivo

export function validateGraph(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const graph = req.body;
  if (Object.keys(graph).length == 0) {
    res.status(400).json({ error: "Grafo mancante nella richiesta" });
    return;
  }

  // Validazione della struttura del grafo
  if (
    typeof graph !== "object" || // verifica che graph sia un oggetto
    Object.values(graph).some((node) => typeof node !== "object") // verifica che ogni valore in graph sia un oggetto
  ) {
    res.status(400).json({ error: "Struttura del grafo non valida" });
    return;
  }

  // Verifica che tutti i pesi degli archi siano numeri non negativi
  for (const node in graph) {
    for (const edge in graph[node]) {
      //node == edge per verificare autocicli (A : {A : 1})
      if (
        typeof graph[node][edge] !== "number" ||
        graph[node][edge] < 0 ||
        node == edge
      ) {
        res
          .status(400)
          .json({ error: `Peso dell'arco ${graph[node][edge]} non valido` });
        return;
      }
    }
  }

  next();
}

export async function validateUpdateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requests = req.body;

  if (Object.keys(requests).length == 0) {
    res.status(400).json({ error: "Richiesta mancante nel body" });
    return;
  }

  // Validazione della struttura della richiesta
  if (
    typeof requests !== "object" // verifica che requests sia un oggetto
  ) {
    res.status(400).json({ error: "Struttura della richiesta non valida" });
    return;
  }

  if (
    Object.values(requests).some(
      (request) =>
        typeof requests.start !== "string" &&
        typeof requests.end !== "string" &&
        typeof requests.weight !== "number" &&
        requests.weight < 0
    )
  ) {
    res.status(400).json({ error: "Struttura della richiesta non valida" });
    return;
  }

  next();
}

export function validateDate(req: any, res: any, next: any) {
  const id_graph = req.body.id_graph;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  if (typeof id_graph !== "number" || id_graph <= 0) {
    res
      .status(400)
      .send({ error: "id_graph deve essere un numero/numero positivo." });
    return;
  }

  if (startDate && endDate) {
    if (!Date.parse(startDate)) {
      res.status(400).send({ error: "startDate deve essere una data valida." });
      return;
    }
    if (!Date.parse(endDate)) {
      res.status(400).send({ error: "endDate deve essere una data valida." });
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      res
        .status(400)
        .send({ error: "startDate deve essere prima di endDate." });
      return;
    }
  }

  if (startDate && !endDate) {
    if (!Date.parse(startDate)) {
      res.status(400).send({ error: "startDate deve essere una data valida." });
      return;
    }
  } else if (!startDate && endDate) {
    if (!Date.parse(endDate)) {
      res.status(400).send({ error: "endDate deve essere una data valida." });
      return;
    }
  }
  next();
}

export async function validateReqStatus(req: any, res: any, next: any) {
  const req_status = req.body.status;

  if (req_status && req_status != "accepted" && req_status != "denied") {
    res
      .status(400)
      .send({ error: "status deve essere 'accepted' o 'denied'." });
    return;
  }
  next();
}

export async function validateSimulation(req: any, res: any, next: any) {
  let id_graph: number = req.body.id_graph;
  let options = req.body.options;
  let route = req.body.route;
  let edge = req.body.edge;

  let start: number = options.start;
  let stop: number = options.stop;
  let step: number = options.step;

  if (typeof id_graph !== "number" || id_graph <= 0) {
    res
      .status(400)
      .send({ error: "id_graph deve essere un numero positivo." });
    return;
  }

  if (typeof start !== "number" || start < 0) {
    res.status(400).send({ error: "start deve essere un numero positivo." });
    return;
  }

  if ((typeof stop !== "number" || stop < 0) && stop < start) {
    res.status(400).send({ error: "stop deve essere un numero positivo." });
    return;
  }

  if (start == stop) {
    res.status(400).send({ error: "start e stop non possono essere uguali." });
    return;
  }

  if ((typeof step !== "number" || step <= 0) || step > stop - start) {
    res.status(400).send({ error: "step deve essere un numero strettamente positivo e minore di stop - start" });
    return;
  }

  if(!route.start){
    res.status(400).send("start vuoto/null");
    return;
  }
  if(!route.goal){
    res.status(400).send("goal vuot/null");
    return;
  }

  if(route.start === route.goal){
    res.status(400).send("nodo di partenza e nodo di arrivo uguali");
    return;
  }
  /*if (
    (!route.start || !route.goal) &&
    typeof route.start !== "string" &&
    typeof route.goal !== "string"
  ) {
    res
      .status(400)
      .send({ error: "start e end devono essere una stringa non vuota." });
    return;
  }*/

  /*if (typeof edge.node1 !== "string" && typeof edge.node2 !== "string") {
    res
      .status(400)
      .send({ error: "node1 e node2 devono essere una stringa non vuota." });
    return;
  }

  if (edge.node1 == edge.node2) {
    res.status(400).send({ error: "node1 e node2 non possono essere uguali." });
    return;
  }*/
  if(!edge.node1){
    res.status(400).send("nodo1 vuoto/null");
    return;
  }

  if(!edge.node2){
    res.status(400).send("nodo2 vuoto/null");
    return;
  }

  if(edge.node1 === edge.node2){
    res.status(400).send("nodo1 e node2 uguali");
    return;
  }

  next();
}
