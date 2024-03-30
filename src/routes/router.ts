import express from "express";
import * as Controller from "../controller/controller";
import * as Middleware from "../middleware/middleware";

const router = express.Router();

router.post(
  "/createGraph",
  Middleware.AUTH,
  Middleware.GRAPH,
  function (req: any, res: any) {
    Controller.createGraph(req, res);
  }
);

router.get("/getGraph", async function (req: any, res: any) {
  Controller.getGraphs(req, res);
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
  "/getPendingRequests",
  Middleware.AUTH,
  async function (req: any, res: any) {
    Controller.getPendingRequests(req, res);
  }
);

router.post(
  "/executeModel",
  Middleware.AUTH,
  async function (req: any, res: any) {
    Controller.executeModel(req, res);
  }
);

router.post("/acceptRequest", Middleware.AUTH, function (req: any, res: any) {
  Controller.acceptRequest(req, res);
});

router.post("/recharge", Middleware.AUTH, function (req: any, res: any) {
  Controller.rechargeTokens(req, res);
});

router.post(
  "/getGraphRequests",
  Middleware.AUTH,
  Middleware.DATE,
  Middleware.REQ,
  async function (req: any, res: any) {
    Controller.getGraphRequest(req, res);
  }
);

router.post(
  "/simulateModel",
  Middleware.AUTH,
  async function (req: any, res: any) {
    Controller.simulateModel(req, res);
  }
);

export default router;
