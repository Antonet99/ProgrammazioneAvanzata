import { User, } from '../model/model';
const GraphD = require("node-dijkstra");

export async function register(user: any, res: any) {
    User.create(user).then((user) =>  {
        res.json(user);
    }).catch((error) => {
        res.status(500).send("Errore nella funzione register");
    });
};

export async function createGraph(req: any, res: any) {
    
    const grafo = new GraphD({
        A: { B: 1 },
        B: { A: 1, C: 2, D: 4 },
      });
    
    console.log(typeof grafo)
    
    // validazione payload

    // calcolo costi

    // calcolo dimensione

    // inserimento in db tramite Graph model
};