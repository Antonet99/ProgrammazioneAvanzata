import * as authorization from "./authorization";
import * as validation from "./validation";

export const AUTH = [
  authorization.checkAuthHeader,
  authorization.checkPayloadHeader,
  authorization.checkToken,
  authorization.verifyAndAuthenticate,
];

export const GRAPH = [validation.validateGraph];

export const UPDATE = [validation.validateUpdateRequest];

export const DATE = [validation.validateDate];
export const REQ = [validation.validateReqStatus];
