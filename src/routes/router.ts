import express from 'express';
import * as Controller from '../controller/controller';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/register', function(req: any, res: any) {
  Controller.register(req.body, res);
});

export default router;
