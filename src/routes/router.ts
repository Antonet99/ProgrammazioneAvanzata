import express from 'express';
import * as Controller from '../controller/controller';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/register', function(req: any, res: any) {
  Controller.register(req.body, res);
});

//TO DO

// rotta per creazione grafo + validazione 

router.post('/createGraph', function(req: any, res: any) {
  Controller.createGraph(req, res);
});


export default router;
