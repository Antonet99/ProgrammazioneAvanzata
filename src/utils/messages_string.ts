enum MESSAGES {
  NO_AUTH_HEADER = "Bad Request - Authorization header missing",
  NO_PAYLOAD_HEADER = "Bad Request - JSON payload header missing",
  MISSING_TOKEN = "Bad Request - JWT Token missing",
  INVALID_TOKEN = "Forbidden - JWT Token invalid",
  MALFORMED_PAYLOAD = "Bad Request - Payload malformed",

  ROUTE_NOT_FOUND = "Not Found - Route not found",
  UNAUTHORIZED = "Error - Unauthorized",
  BAD_REQUEST = "Error - Bad request",
  INSUFFICIENT_BALANCE = "Unauthorized - Insufficient token balance",

  // For graphs
  GRAPH_CREATED = "Graph successfully created",
  GRAPH_CREATION_ERROR = "Unauthorized - Error in graph creation",
  GRAPH_NOT_FOUND = "Graph not found",
  NO_GRAPH_AVAILABLE = "Error - No graph available",

  // For users
  USER_NOT_FOUND = "User not found",

  // For requests
  REQUEST_ACCEPTED = "Request accepted",
  REQUESTS_ACCEPTED_DENIED = "Requests accepted/denied",
  EDGE_UPDATED = "Edge updated",
  PENDING_REQUEST = "Request pending for acceptance/denial",
  REQUEST_CREATION_ERROR = "Error - Could not create the request",

  REQUEST_USER_UNAUTHORIZED_GRAPH = "Unauthorized - You are not the creator of the graph",

  // To be divided maybe
  USER_GRAPH_NOT_FOUND = "User or graph not found",

  MODEL_EXECUTION_ERROR = "Error - Error during the execution of the model",

  ADMIN_NOT_FOUND = "Admin not found",
  // For admin
  INVALID_IMPORT = "Invalid import, it must be > 0",
  TOKENS_RECHARGED = "Tokens successfully recharged",
  RECHARGE_FAIL = "Error - Could not recharge tokens",

  DEFAULT_ERROR = "",
}

export default MESSAGES;
