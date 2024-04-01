enum Messages {
  noAuthHeader_message = "Bad Request - No authorization header",
  noPayloadHeader_message = "Bad Request - No JSON payload header",
  missingToken_message = "Bad Request - Missing JWT Token",
  invalidToken_message = "Forbidden - Invalid JWT Token",
  malformedPayload_message = "Bad Request - Malformed payload",

  routeNotFound_message = "Not Found - Route not found",
  unauthorized_message = "ERROR - Unauthorized",
  badRequest_message = "ERROR - Bad request",
  insufficientBalance_message = "Unauthorized - Insufficient token balance",

  // per grafi
  GRAPH_CREATED = "Grafo creato con successo",
  GRAPH_CREATED_ERROR = "Unauthorized - Errore nella creazione del grafo",
  GRAPH_NOT_FOUND = "graph not found",
  NO_GRAPH_AVAIBLE = "ERROR - No graph avaible",

  //per utenti
  USER_NOT_FOUND = "user not found",

  //per richieste
  ACCEPTED_REQUEST = "request accepted",
  ACCEPTED_DENIED_REQUEST = "requests accepted/denied",
  EDGE_UPDATED = "edge updated",
  PENDING_REQUEST = "richiesta in attesa di accettazione/rifiuto",
  REQUEST_CREATE_ERROR = "could not create the request",
  
  REQUEST_USER_UNAUTHORIZED_GRAPH = "you are not the creator of the graph",


  //da dividere forse
  USER_GRAPH_NOT_FOUND = "user or graph not found",

  MODEL_EXECUTION_ERROR = "Error during the execution of the model",

  ADMIN_NOT_FOUND = "admin not found",
  //per admin
  INVALID_IMPORT = "invalid import, it must be > 0",
  TOKENS_RECHARGED = "tokens recharged successfully",
  RECHARGE_FAIL = "could not recharge token",

  DEFAULT_ERROR = ""
}

export default Messages;
