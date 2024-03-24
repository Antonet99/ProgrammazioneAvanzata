import * as authorization from "./authorization";
import * as validation from "./validation";

export const AUTH = [
  authorization.checkAuthHeader,
  authorization.checkPayloadHeader,
  authorization.checkToken,
  authorization.verifyAndAuthenticate,
];

export const VAL = [validation.validateGraph];
