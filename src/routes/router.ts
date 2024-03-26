import express from "express";
import * as Controller from "../controller/controller";
import * as Middleware from "../middleware/middleware";

const router = express.Router();

router.post("/register", Middleware.AUTH, function (req: any, res: any) {
  Controller.register(req.body, res);
});

//TO DO

// rotta per creazione grafo + validazione

router.post(
  "/createGraph",
  Middleware.AUTH,
  Middleware.VAL,
  function (req: any, res: any) {
    Controller.createGraph(req, res);
  }
);

router.get("/getGraph", async function (req: any, res: any) {
  Controller.getGraph(req, res);
});


router.post("/updateEdge",Middleware.AUTH, async function (req : any, res : any) {
  await Controller.updateWeight(req,res);
})

export default router;
