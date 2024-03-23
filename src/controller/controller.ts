import { User, } from '../model/model';
const GraphD = require("node-dijkstra");
import { Request, Response } from 'express';
import * as Utils from '../utils/utils'


export async function register(user: any, res: any) {
    User.create(user).then((user) =>  {
        res.json(user);
    }).catch((error) => {
        res.status(500).send("Errore nella funzione register");
    });
};



export async function createGraph(req: Request, res: Response) { //teoricamente anche l'id dell'user deve essere passato
    
    const grafo = new GraphD({
        A: { B: 1 },
        B: { A: 1, C: 2, D: 4 },
    });


    const grafo2 = new GraphD(req.body);

    console.log(grafo2);

    let nodes = Utils.conta_nodi(req.body);
    let edges = Utils.conta_archi(req.body);

    let resp = {
        "nodes" : nodes,
        "edges" : edges
    }

    res.json(resp);
    
    // validazione payload

    // calcolo costi

    // calcolo dimensione

    // inserimento in db tramite Graph model
};


/*
let str : string = `{
        'A': {
          'B': 1
        },
        'B': {
          'A': 1,
          'C': 2,
          'D': 4
        }
      }`;

    let j = JSON.parse(str.replace(/'/g, '"'));
*/