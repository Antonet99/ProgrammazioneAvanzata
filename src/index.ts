require("dotenv").config();
import express from "express";
import { SequelizeDB } from "./singleton/sequelize";
import { checkAlpha } from "./utils/utils";

import router from "./routes/router";
import { sendResponse } from "./utils/messages_sender";
import HttpStatusCode from "./utils/http_status_code";
import Message from "./utils/messages_string";

const sequelize = SequelizeDB.getConnection();

const app = express();
const port = process.env.API_PORT;

app.use(express.json());
app.use(router);
app.use("*", (req, res) => {
  sendResponse(res, HttpStatusCode.NOT_FOUND, Message.ROUTE_NOT_FOUND);
});

app.listen(port, () => {
  console.log(`App in ascolto sulla porta ${port}...`);
  checkAlpha();
  sequelize
    .sync()
    .then(() => {
      console.log("Tabelle sincronizzate.");
    })
    .catch((err) => {
      console.log("Errore nella sincronizzazione delle tabelle: ", err);
    });
});
