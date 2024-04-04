import * as authorization from "./authorization";
import * as validation from "./validation";

export const AUTH = [
  authorization.checkAuthHeader,
  authorization.checkPayloadHeader,
  authorization.checkToken,
  authorization.verifyAndAuthenticate,
  authorization.checkUser,
];

export const GRAPH = [validation.validateGraph];
export const GRAPH_ID = [validation.validateGraphId];

export const UPDATE = [validation.validateUpdateRequest];

export const DATE = [validation.validateDate];
export const REQSTAT = [validation.validateReqStatus];
export const REQ = [validation.validateRequest];

export const SIM = [validation.validateSimulation];

export const ADMIN = [authorization.checkAdmin, validation.validateRecharge];
