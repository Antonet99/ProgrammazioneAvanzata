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

  GRAPH_CREATED = "Grafo creato con successo",
  GRAPH_CREATED_ERROR = "Unauthorized - Errore nella creazione del grafo",
}

export default Messages;
