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

export function validateGraph(req: Request, res: Response, next: NextFunction) {
  const graph = req.body; //da cambiare
  if (!graph) {
    return res.status(400).json({ error: "Grafo mancante nella richiesta" });
  }

  // Validazione della struttura del grafo
  if (
    !graph || //graph non null o undefined
    typeof graph !== "object" || // verifica che graph sia un oggetto
    Object.values(graph).some((node) => typeof node !== "object") // verifica che ogni valore in graph sia un oggetto
  ) {
    return res.status(400).json({ error: "Struttura del grafo non valida" });
  }

  next();
}

// 2.2 Verifica del saldo del token dell'utente
export function checkUserBalance(req: any, res: any, next: any): void {
  Controller.checkBalance(req.body.id_user, req.body.cost, res).then(
    (check) => {
      if (check) next();
      else next();
    }
  );
}
