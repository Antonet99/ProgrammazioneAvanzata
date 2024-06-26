import express from "express";
import * as Controller from "../controller/controller";
import * as Middleware from "../middleware/middleware";

const router = express.Router();

router.post(
  "/createGraph",
  Middleware.AUTH,
  Middleware.GRAPH,
  async function (req: any, res: any) {
    await Controller.createGraph(req, res);
  }
);

router.get("/getAllGraph", async function (req: any, res: any) {
  Controller.getAllGraphs(req, res);
});

router.post(
  "/updateEdge",
  Middleware.AUTH,
  Middleware.UPDATE,
  async function (req: any, res: any) {
    await Controller.updateWeight(req, res);
  }
);

router.post(
  "/graphPendingRequests",
  Middleware.AUTH,
  Middleware.GRAPH_ID,
  async function (req: any, res: any) {
    await Controller.getGraphPendingRequests(req, res);
  }
);

router.post(
  "/executeModel",
  Middleware.AUTH,
  async function (req: any, res: any) {
    Controller.executeModel(req, res);
  }
);

router.post(
  "/acceptDenyRequest",
  Middleware.AUTH,
  Middleware.REQ,
  function (req: any, res: any) {
    Controller.acceptDenyRequest(req, res);
  }
);

router.post(
  "/rechargeTokens",
  Middleware.AUTH,
  Middleware.ADMIN,
  function (req: any, res: any) {
    Controller.rechargeTokens(req, res);
  }
);

router.post(
  "/getGraphRequests",
  Middleware.AUTH,
  Middleware.DATE,
  Middleware.REQSTAT,
  async function (req: any, res: any) {
    Controller.getGraphRequest(req, res);
  }
);

router.post(
  "/simulateModel",
  Middleware.AUTH,
  Middleware.SIM,
  Middleware.GRAPH_ID,
  async function (req: any, res: any) {
    Controller.simulateModel(req, res);
  }
);

router.post(
  "/getMyPendingRequests",
  Middleware.AUTH,
  async function (req: any, res: any) {
    Controller.getMyPendingRequests(req, res);
  }
);

export default router;
