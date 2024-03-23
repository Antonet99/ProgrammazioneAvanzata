import * as middleAuth from "../middleware/middleAuth";
import * as middleVal from "../middleware/middleVal";

export const AUTH = [
    middleAuth.checkAuthHeader,
    middleAuth.checkPayloadHeader,
    middleAuth.checkToken,
    middleAuth.verifyAndAuthenticate,
];

export const VAL = [
    middleVal.checkPayloadHeader,
];