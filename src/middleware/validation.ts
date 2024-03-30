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
