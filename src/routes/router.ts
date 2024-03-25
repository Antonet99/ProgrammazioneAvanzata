import express from "express";
import * as Controller from "../controller/controller";
import * as Middleware from "../middleware/middleware";

const router = express.Router();

router.post("/register", Middleware.AUTH, function (req: any, res: any) {
  Controller.register(req.body, res);
});

//TO DO

// rotta per creazione grafo + validazione

router.post("/createGraph", Middleware.AUTH, function (req: any, res: any) {
  Controller.createGraph(req, res);
});

export default router;
