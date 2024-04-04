import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";
require("dotenv").config();

export function validateGraph(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  const graph = req.body;
  if (Object.keys(graph).length == 0) {
    //res.status(400).json({ error: "Grafo mancante nella richiesta" });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MISSING_BODY);
    return;
  }

  // Validazione della struttura del grafo
  if (
    typeof graph !== "object" || // verifica che graph sia un oggetto
    Object.values(graph).some((node) => typeof node !== "object") // verifica che ogni valore in graph sia un oggetto
  ) {
    //res.status(400).json({ error: "Struttura del grafo non valida" });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
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
        //res.status(400).json({ error: `Peso dell'arco ${graph[node][edge]} non valido` });
        sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.BAD_REQUEST, {
          invalid_edge: graph[node][edge],
        });
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

  if (!requests) {
    //res.status(400).json({ error: "Richiesta mancante nel body" });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MISSING_BODY);
    return;
  }

  if (typeof requests.graph_id !== "number") {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  let data = requests.data;

  for (let i in data) {
    if (
      typeof data[i].start !== "string" ||
      !data[i].start ||
      data[i].start == ""
    ) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (typeof data[i].end !== "string" || !data[i].end || data[i].end == "") {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (typeof data[i].weight !== "number") {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (data[i].weight < 0) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
  }
  next();
}

export function validateDate(req: any, res: any, next: any) {
  const id_graph = req.body.id_graph;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  if (typeof id_graph !== "number" || id_graph <= 0) {
    //res.status(400).send({ error: "id_graph deve essere un numero/numero positivo." });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (startDate && endDate) {
    if (!Date.parse(startDate)) {
      //res.status(400).send({ error: "startDate deve essere una data valida." });
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (!Date.parse(endDate)) {
      //res.status(400).send({ error: "endDate deve essere una data valida." });
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      //res.status(400).send({ error: "startDate deve essere prima di endDate." });
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
  }

  if (startDate && !endDate) {
    if (!Date.parse(startDate)) {
      //res.status(400).send({ error: "startDate deve essere una data valida." });
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
  } else if (!startDate && endDate) {
    if (!Date.parse(endDate)) {
      //res.status(400).send({ error: "endDate deve essere una data valida." });
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
  }
  next();
}

export async function validateReqStatus(req: any, res: any, next: any) {
  const req_status = req.body.status;

  if (req_status && req_status != "accepted" && req_status != "denied") {
    //res.status(400).send({ error: "status deve essere 'accepted' o 'denied'." });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  next();
}

export async function validateSimulation(req: any, res: any, next: any) {
  let options = req.body.options;
  let route = req.body.route;
  let edge = req.body.edge;

  let start: number = options.start;
  let stop: number = options.stop;
  let step: number = options.step;

  if (typeof start !== "number" || start < 0) {
    //res.status(400).send({ error: "start deve essere un numero positivo." });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if ((typeof stop !== "number" || stop < 0) && stop < start) {
    //res.status(400).send({ error: "stop deve essere un numero positivo." });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (start == stop) {
    //res.status(400).send({ error: "start e stop non possono essere uguali." });
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (typeof step !== "number" || step <= 0 || step > stop - start) {
    //res.status(400).send({ error: "step deve essere un numero strettamente positivo e minore di stop - start",});
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (!route.start || typeof route.start != "string") {
    //res.status(400).send("start vuoto/null");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (!route.goal || typeof route.goal != "string") {
    //res.status(400).send("goal vuot/null");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (route.start === route.goal) {
    //res.status(400).send("nodo di partenza e nodo di arrivo uguali");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (!edge.node1) {
    //res.status(400).send("nodo1 vuoto/null");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (!edge.node2) {
    //res.status(400).send("nodo2 vuoto/null");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (edge.node1 === edge.node2) {
    //res.status(400).send("nodo1 e node2 uguali");
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  next();
}

export async function validateRecharge(req: any, res: any, next: any) {
  let username = req.body.username;
  let tokens = req.body.tokens;

  if (!username) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }

  if (!tokens || typeof tokens !== "number" || tokens <= 0) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD, {
      error: "Tokens deve essere maggiore di zero",
    });
    return;
  }
  next();
}

export async function validateGraphId(req: any, res: any, next: any) {
  let id_graph = req.body.id_graph;
  if (typeof id_graph !== "number" || id_graph <= 0) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  next();
}

export async function validateRequest(req: any, res: any, next: any) {
  let id_request = req.body.id_request;
  let accepted = req.body.accepted;

  if (typeof id_request !== "object" || id_request.length == 0) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (typeof accepted !== "object" || accepted.length == 0) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  if (id_request.length !== accepted.length) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
    return;
  }
  for (let i in id_request) {
    if (typeof id_request[i] !== "number" || id_request[i] <= 0) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
    if (typeof accepted[i] !== "boolean") {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, Message.MALFORMED_PAYLOAD);
      return;
    }
  }
  next();
}
