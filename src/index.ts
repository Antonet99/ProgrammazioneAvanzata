require('dotenv').config();

import express from 'express';
import { SequelizeDB } from './model/sequelize';
import router from './routes/router';

const sequelize = SequelizeDB.getConnection();

const app = express();
const port = process.env.API_PORT;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`App in ascolto sulla porta ${port}...`);
  try {
      sequelize.authenticate();
      console.log('🛢️  Connesso al database.');
      sequelize.sync({ force: true })
      .then(() => console.log('Tabella del modello creata con successo.'))
      .catch(error => console.log('Si è verificato un errore durante la creazione della tabella del modello:', error));

  } catch (error) {
      console.error('⚠️ Errore nella connessione al database:', error);
  }
});
