require("dotenv").config();
import express from "express";
import { SequelizeDB } from "./singleton/sequelize";
import { checkAlpha } from "./utils/utils";

import router from "./routes/router";

const sequelize = SequelizeDB.getConnection();

const app = express();
const port = process.env.API_PORT;

app.use(express.json());
app.use(router);

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
